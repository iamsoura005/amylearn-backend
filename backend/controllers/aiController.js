'use strict';

const sharp = require('sharp');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const {
  AiServiceError,
  isAiConfigured,
  generateTutorResponse,
  processMultimodalInput,
  extractText
} = require('../services/openSourceAiService');
const { extractDocument, detectKind } = require('../services/fileParserService');

const MAX_TEXT_CHARS = 16000;
const TASK_TYPES = ['summarize', 'solve', 'exam_quiz', 'mindmap'];

const FORMAT_INSTRUCTIONS =
  '\n\nCRITICAL RESPONSE STRUCTURE RULES:' +
  '\n1. Structure every response cleanly with standard Markdown: brief opening, clear ### Headings, bold key terms, and tidy bullet points.' +
  '\n2. Whenever presenting comparisons, differences, multi-feature breakdowns, pros/cons, classifications, or metrics, ALWAYS format them as a clean GitHub-flavored Markdown table with pipe syntax (`| Col 1 | Col 2 |` and `|---|---|`).' +
  '\n3. NEVER use em-dashes (—) or hyphen lines as fake tables or fake diagrams. Use standard Markdown tables with pipes, or clean bullet points.' +
  '\n4. Ensure tables have concise headers and well-aligned cells.' +
  '\n5. If asked for a mind map, concept map, flowchart, or visual diagram, ALWAYS provide a valid Mermaid diagram using ```mermaid graph LR ... ``` with double-quoted node labels like A["Core Concept"] --> B["Subtopic (Details)"]. NEVER draw ASCII tree lines (├──, │, └──) or em-dash hierarchies.' +
  '\n6. Do not output raw internal thinking, reasoning tokens, or <think> blocks.';

const SYSTEM_PROMPTS = {
  tutor:
    'You are a Socratic tutor inside the AmyLearn academic platform. Guide the student ' +
    'step by step, ask clarifying questions, and never reveal the final answer immediately. ' +
    'Be friendly, encouraging and concise.' +
    FORMAT_INSTRUCTIONS,
  mindmap:
    'You are an expert academic study assistant and concept visualizer. ' +
    'Structure your response in two parts:\n' +
    '1. A concise, high-yield **Exam Brief** (2-3 structured bullet points or short paragraphs explaining the core concept, key formula/rule, and intuition).\n' +
    '2. A clean, valid Mermaid.js concept tree diagram starting with ```mermaid\ngraph LR\n...\n```\n\n' +
    'CRITICAL MERMAID RULES:\n' +
    '- ALWAYS use `graph LR` (Left-to-Right layout) so branches flow hierarchically from left to right instead of exploding horizontally into flat bar-graphs.\n' +
    '- Group concepts into 4 to 6 main thematic categories branching from the central topic.\n' +
    '- ALWAYS enclose every node label in double quotes inside square brackets: A["Core Topic"] --> B["Subtopic (details)"].\n' +
    '- Keep node labels concise (under 8 words per node) for crystal clarity.\n' +
    '- NEVER leave unquoted parentheses, colons, commas, or slashes inside node brackets.\n' +
    '- NEVER use em-dashes (—) or ASCII tree lines (├──, │, └──). Use standard Mermaid arrows (-->).\n' +
    '- Close the mermaid block with ``` and provide 2-3 bulleted High-Yield Exam Tips below it.',
  default:
    'You are a supportive, high-clarity academic study companion inside the AmyLearn platform. ' +
    'Provide structured, well-formatted explanations personalized for the learner with concrete examples.' +
    FORMAT_INSTRUCTIONS
};

function cleanMermaidCode(raw) {
  let code = String(raw || '').trim();
  code = code.replace(/^```(?:mermaid)?\s*/gi, '').replace(/\s*```$/gi, '').trim();
  code = code.split('\n').filter((line) => !/^mermaid\s*$/i.test(line.trim())).join('\n');
  code = code.replace(/\|>/g, '|');

  // Convert wide top-down graphs to Left-to-Right (LR) so mind maps never flatten into thin bar-graphs
  code = code.replace(/^\s*(?:graph|flowchart)\s+(?:TD|TB)\b/i, 'graph LR');

  // Fix em-dashes and en-dashes in connection arrows and text
  code = code.replace(/[\u2014\u2013]{2,}>/g, '-->');
  code = code.replace(/[\u2014\u2013]>/g, '-->');
  code = code.replace(/[\u2014\u2013]{2,}/g, '---');
  code = code.replace(/[\u2014\u2013]/g, '-');

  // Strip duplicate headers like graph LR\nflowchart LR or graph LR\nmindmap
  code = code.replace(/^\s*graph\s+[A-Z]{2}\s+(graph|flowchart|mindmap)/i, '$1');

  // Ensure diagram type header exists; default to graph LR for clean mind maps
  const isKnownType = /^\s*(graph|flowchart|mindmap|classDiagram|sequenceDiagram|erDiagram|gantt|pie|gitGraph|stateDiagram)\b/i.test(code);
  if (!isKnownType) {
    code = `graph LR\n${code}`;
  }

  // Quote unquoted node labels with special characters (parentheses, colons, slashes, dashes, commas)
  // E.g. A[Aarav (CSE) - TCP Congestion Control] => A["Aarav (CSE) - TCP Congestion Control"]
  code = code.replace(/(\b[A-Za-z0-9_]+)\s*\[\s*([^"\]\n]+?)\s*\]/g, (match, id, label) => {
    if (label.startsWith('"') && label.endsWith('"')) return match;
    const cleanLabel = label.replace(/"/g, "'").trim();
    return `${id}["${cleanLabel}"]`;
  });

  return code.trim();
}

function wrapMermaid(code) {
  return `:::MERMAID_Start:::${cleanMermaidCode(code)}:::MERMAID_End:::`;
}

function gpuOfflineReply() {
  if (!isAiConfigured()) {
    return (
      'The AmyLearn AI assistant is ready, but no API key is set yet.\n\n' +
      'To enable fast AI reasoning, add your free **GROQ_API_KEY** (from console.groq.com) to `backend/.env`.'
    );
  }
  return (
    'The AmyLearn AI study service is momentarily unavailable. ' +
    'The upstream inference provider did not respond. Please try again in a few moments.'
  );
}

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// ---------------------------------------------------------------------------
const chat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) throw httpError(400, 'Provide a message to chat with the study companion.');

  const mode = String(req.body.mode || 'default').toLowerCase();
  const isMindmapRequest = mode === 'mindmap' || /mind\s*map|mindmap|concept\s*map|flowchart|diagram/i.test(message);

  const context = req.body.context && typeof req.body.context === 'object' ? req.body.context : {};
  const userName = context.userName || (req.user ? req.user.name : 'there');
  const classroomName = context.classroomName || (req.tenant ? req.tenant.name : 'your institution');

  const systemInstruction =
    (isMindmapRequest && SYSTEM_PROMPTS.mindmap) ||
    (mode === 'tutor' && SYSTEM_PROMPTS.tutor) ||
    SYSTEM_PROMPTS.default;

  const personalised = `The learner's name is ${userName}. Their classroom is ${classroomName}.`;
  const fullMessage = `${personalised}\n\n${message}`;

  try {
    const reply = await generateTutorResponse(systemInstruction, fullMessage, 2500, isMindmapRequest ? 0.2 : 0.7);
    let output = reply;
    // If reply contains a mermaid code block, wrap ONLY that block with :::MERMAID_Start::: so surrounding text remains clean Markdown
    if (/```(?:mermaid)?\s*[\s\S]*?```/i.test(reply)) {
      output = reply.replace(/```(?:mermaid)?\s*([\s\S]*?)```/gi, (_, c) => wrapMermaid(c));
    } else if (isMindmapRequest) {
      output = wrapMermaid(reply);
    }
    return res.json({ success: true, reply: output, mode });
  } catch (error) {
    if (error instanceof AiServiceError || !isAiConfigured()) {
      return res.status(502).json({ success: false, reply: gpuOfflineReply(), message: error.message });
    }
    throw error;
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai/summarize-file  (multipart)
// ---------------------------------------------------------------------------
const summarizeFile = asyncHandler(async (req, res) => {
  const taskType = TASK_TYPES.includes(String(req.body.taskType || 'summarize'))
    ? String(req.body.taskType)
    : 'summarize';

  const fileName = req.file ? req.file.originalname : '';
  const buffer = req.file ? req.file.buffer : null;
  const providedText = req.body.text ? String(req.body.text) : '';

  if (!buffer && !providedText) {
    throw httpError(400, 'Attach a file or provide text to summarise.');
  }

  let text = providedText;
  let imageBuffer = null;
  let digitalSource = '';
  let ocrSource = '';

  if (buffer) {
    const kind = detectKind(fileName, req.file.mimetype);
    if (kind === 'image') {
      try {
        imageBuffer = await sharp(buffer).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 }).toBuffer();
      } catch (error) {
        imageBuffer = buffer;
      }
    } else {
      try {
        const extracted = await extractDocument(buffer, { filename: fileName, mimetype: req.file.mimetype });
        if (extracted && extracted.text) {
          digitalSource = String(extracted.text).trim();
        }
        if (extracted && extracted.ocrText) {
          ocrSource = String(extracted.ocrText).trim();
        }
        if (digitalSource.length < 100 && ocrSource && ocrSource !== 'LIMIT_EXCEEDED') {
          text = `--- [Source: Digital Parse] ---\n${digitalSource}\n\n--- [Source: Visual OCR] ---\n${ocrSource}`;
        } else {
          text = ocrSource && ocrSource !== 'LIMIT_EXCEEDED' && digitalSource.length < 100
            ? ocrSource
            : digitalSource || text;
        }
      } catch (error) {
        if (!text) throw httpError(422, 'This file type could not be read. Try a PDF, DOCX, XLSX, PPTX, TXT or image.');
      }
    }
  }

  text = String(text || '').slice(0, MAX_TEXT_CHARS);
  if (!text && !imageBuffer) {
    throw httpError(422, 'No readable text was found in this file.');
  }

  try {
    const result = await processMultimodalInput({
      imageBuffer,
      taskType,
      userPrompt: req.body.userPrompt || '',
      studentName: req.user.name || '',
      text
    });
    const summary = extractText(result);
    const output = taskType === 'mindmap' ? wrapMermaid(summary) : summary;
    return res.json({ success: true, summary: output, taskType, chars: text.length });
  } catch (error) {
    return res.status(502).json({
      success: false,
      summary: 'The AmyLearn AI service is offline right now, so this file could not be analysed live. Try again shortly.',
      message: error.message
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai/transcribe-video
// ---------------------------------------------------------------------------
const transcribeVideo = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req);
  const videoUrl = String(req.body.videoUrl || req.body.url || '').trim();
  if (!videoUrl) throw httpError(400, 'Provide a videoUrl to break down.');

  let parsedUrl = null;
  try {
    parsedUrl = new URL(videoUrl);
  } catch (error) {
    parsedUrl = null;
  }
  if (
    !parsedUrl ||
    (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') ||
    !/(^|\.)youtube\.com$|^youtu\.be$|^www\.youtube-nocookie\.com$/.test(parsedUrl.hostname)
  ) {
    throw httpError(400, 'Only public YouTube lecture links are supported.');
  }

  let transcriptText = '';
  let usedTranscript = false;
  try {
    const youtubeTranscript = require('youtube-transcript');
    const parts = await youtubeTranscript.YoutubeTranscript.fetchTranscript(videoUrl);
    transcriptText = (Array.isArray(parts) ? parts : []).map((part) => part && part.text).filter(Boolean).join(' ');
    usedTranscript = Boolean(transcriptText);
  } catch (error) {
    transcriptText = '';
  }

  if (!usedTranscript) {
    return res.status(422).json({
      success: false,
      message: 'Only public YouTube lecture links can be transcribed. The transcript for this video is not available.',
      breakdown: null
    });
  }

  transcriptText = transcriptText.slice(0, MAX_TEXT_CHARS);
  const instruction =
    'You are a lecture breakdown engine inside AmyLearn. From the transcript, produce a ' +
    'structured study brief with three sections: (1) Core topic summary, (2) Key takeaways — ' +
    'definitions and formulas as bullet points, (3) Three review questions. Use markdown ' +
    'headings and keep it concise.';

  try {
    const reply = await generateTutorResponse(instruction, transcriptText, 1500, 0.3);
    return res.json({ success: true, videoUrl, breakdown: reply, transcriptLength: transcriptText.length });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: gpuOfflineReply(),
      breakdown: null
    });
  }
});

module.exports = { chat, summarizeFile, transcribeVideo, cleanMermaidCode, wrapMermaid };
