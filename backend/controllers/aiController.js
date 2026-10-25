'use strict';

const sharp = require('sharp');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const {
  AiServiceError,
  isAiConfigured,
  generateTutorResponse,
  processMultimodalInput
} = require('../services/openSourceAiService');
const { extractDocument, detectKind } = require('../services/fileParserService');

const MAX_TEXT_CHARS = 16000;
const TASK_TYPES = ['summarize', 'solve', 'exam_quiz', 'mindmap'];

const SYSTEM_PROMPTS = {
  tutor:
    'You are a Socratic tutor inside the AmyLearn academic platform. Guide the student ' +
    'step by step, ask clarifying questions, and never reveal the final answer immediately. ' +
    'Be friendly, encouraging and concise.',
  mindmap:
    'You generate Mermaid.js mind maps. Output ONLY a ```mermaid graph TD code block. ' +
    'Keep it structured, hierarchical and study-friendly. No prose outside the code block.',
  default:
    'You are a supportive study companion inside the AmyLearn academic platform. ' +
    'Give clear, concise markdown explanations personalised for the learner, with examples ' +
    'when helpful. If asked to make a mind map, output ONLY a ```mermaid graph TD code block.'
};

function cleanMermaidCode(raw) {
  let code = String(raw || '').trim();
  code = code.replace(/```(?:mermaid)?\s*/gi, '').replace(/```\s*$/gi, '').trim();
  code = code.split('\n').filter((line) => !/^mermaid\s*$/i.test(line.trim())).join('\n');
  code = code.replace(/\|>/g, '|');
  if (!/^\s*graph\s+/i.test(code)) {
    code = code.startsWith('graph TD') || code.startsWith('graphTD') ? `graph TD\n${code}` : `graph TD\n${code}`;
  }
  return code.trim();
}

function wrapMermaid(code) {
  return `:::MERMAID_Start::${cleanMermaidCode(code)}:::MERMAID_End:::`;
}

function gpuOfflineReply() {
  return (
    'Sorry — the AmyLearn AI study service is currently offline. The GPU inference ' +
    'endpoint did not respond. Your data is safe, and you can try again in a few minutes.'
  );
}

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// ---------------------------------------------------------------------------
const chat = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req);
  const message = String(req.body.message || '').trim();
  if (!message) throw httpError(400, 'Provide a message to chat with the study companion.');

  const mode = String(req.body.mode || 'default').toLowerCase();
  const context = req.body.context && typeof req.body.context === 'object' ? req.body.context : {};
  const userName = context.userName || req.user.name || 'there';
  const classroomName = context.classroomName || req.tenant ? req.tenant.name : 'your institution';

  const systemInstruction =
    (mode === 'tutor' && SYSTEM_PROMPTS.tutor) ||
    (mode === 'mindmap' && SYSTEM_PROMPTS.mindmap) ||
    SYSTEM_PROMPTS.default;

  const personalised = `The learner's name is ${userName}. Their classroom is ${classroomName}.`;
  const fullMessage = `${personalised}\n\n${message}`;

  try {
    const reply = await generateTutorResponse(systemInstruction, fullMessage, 1024, mode === 'mindmap' ? 0.2 : 0.7);
    const output = mode === 'mindmap' ? wrapMermaid(reply) : reply;
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
  requireAuthenticatedUser(req);
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
