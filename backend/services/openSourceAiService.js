'use strict';

const axios = require('axios');

class AiServiceError extends Error {
  constructor(message, code = 'AI_SERVICE_ERROR', statusCode = 502) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const DEFAULT_TIMEOUT_MS = 30000;

function getAiConfig() {
  return {
    chatUrl: process.env.MODAL_CHAT_URL || '',
    visionUrl: process.env.MODAL_VISION_URL || '',
    pipelineUrl: process.env.MODAL_PIPELINE_URL || '',
    apiKey: process.env.MODAL_API_KEY || '',
    timeout: Number(process.env.MODAL_TIMEOUT_MS) > 0 ? Number(process.env.MODAL_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS
  };
}

function isAiConfigured() {
  const config = getAiConfig();
  return Boolean(config.apiKey && (config.chatUrl || config.visionUrl || config.pipelineUrl));
}

function assertConfigured(url, label) {
  const config = getAiConfig();
  if (!config.apiKey) {
    throw new AiServiceError(
      'The AmyLearn AI service is not configured (missing MODAL_API_KEY).',
      'AI_KEY_MISSING',
      503
    );
  }
  if (!url) {
    throw new AiServiceError(
      `The AmyLearn AI ${label} endpoint is not configured.`,
      'AI_ENDPOINT_MISSING',
      503
    );
  }
  return config;
}

function extractText(data) {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(extractText).join('\n').trim();
  const candidates = [
    data.response,
    data.reply,
    data.output,
    data.text,
    data.generated_text,
    data.summary,
    data.answer,
    data.result
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === 'object') {
      const nested = extractText(candidate);
      if (nested) return nested;
    }
  }
  if (data.choices && Array.isArray(data.choices) && data.choices.length) {
    const choice = data.choices[0];
    const content = choice && (choice.message ? choice.message.content : choice.text);
    if (typeof content === 'string' && content.trim()) return content.trim();
  }
  if (data.candidates && Array.isArray(data.candidates) && data.candidates.length) {
    const parts = data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    if (Array.isArray(parts)) {
      const joined = parts.map((part) => part.text || '').join('\n').trim();
      if (joined) return joined;
    }
  }
  try {
    return JSON.stringify(data);
  } catch (error) {
    return '';
  }
}

async function postToEndpoint(url, payload, label = 'inference') {
  const config = assertConfigured(url, label);
  try {
    const response = await axios.post(url, payload, {
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    const text = extractText(response.data);
    if (!text) {
      throw new AiServiceError('The AI service returned an empty response.', 'AI_EMPTY_RESPONSE', 502);
    }
    return text;
  } catch (error) {
    if (error instanceof AiServiceError) throw error;
    if (error.response) {
      const detail =
        (error.response.data && (error.response.data.error || error.response.data.message)) ||
        `status ${error.response.status}`;
      throw new AiServiceError(`The AI service rejected the request: ${detail}`, 'AI_UPSTREAM_ERROR', 502);
    }
    if (error.code === 'ECONNABORTED') {
      throw new AiServiceError('The AI service timed out. Please try again.', 'AI_TIMEOUT', 504);
    }
    throw new AiServiceError(`The AI service is unreachable: ${error.message}`, 'AI_UNREACHABLE', 502);
  }
}

/**
 * Chat completion against the self-hosted GPU endpoint.
 */
async function generateTutorResponse(systemInstruction, message, maxTokens = 1024, temperature = 0.7) {
  const config = getAiConfig();
  const payload = {
    system_instruction: systemInstruction,
    system: systemInstruction,
    message,
    prompt: message,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: message }
    ],
    max_tokens: maxTokens,
    temperature
  };
  const text = await postToEndpoint(config.chatUrl, payload, 'chat');
  return text;
}

function bufferToBase64(buffer) {
  if (!buffer) return null;
  if (typeof buffer === 'string') {
    if (buffer.startsWith('data:')) return buffer;
    return `data:image/jpeg;base64,${buffer}`;
  }
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
}

/**
 * Vision model used for scanned pages, charts, handwriting, formulas and tables.
 */
async function extractVisualContext(imageBufferOrBase64, instruction) {
  const config = getAiConfig();
  const image = bufferToBase64(imageBufferOrBase64);
  if (!image) {
    throw new AiServiceError('No image supplied for visual extraction.', 'AI_NO_IMAGE', 400);
  }
  const effectiveInstruction =
    instruction ||
    'Extract all visible text verbatim, including formulas, equations, tables and handwriting. ' +
      'Transcribe tables as markdown and describe every chart or diagram in detail.';
  const payload = {
    image,
    images: [image],
    instruction: effectiveInstruction,
    prompt: effectiveInstruction,
    task: 'visual_extraction'
  };
  const text = await postToEndpoint(config.visionUrl, payload, 'vision');
  return text;
}

const TASK_PROMPTS = {
  summarize:
    'You are an academic study assistant. Produce a structured summary with: an overview, key concepts, ' +
    'definitions, formulas, and a short revision checklist. Use concise markdown headings and bullets.',
  solve:
    'You are an academic problem solver. Solve every question in the material. For each item show the final ' +
    'answer first, then a short step-by-step method, and flag any assumptions. Use markdown.',
  exam_quiz:
    'You are an examination setter. Create an exam-style quiz from the material: 5 multiple-choice questions ' +
    '(four options and a marked answer), 3 short-answer questions and 2 long-answer questions. Use markdown.',
  mindmap:
    'You are a Mermaid.js diagram generator. Return ONLY valid Mermaid code starting with "graph TD". ' +
    'Map the material into a hierarchical mind map of concepts. Do not add prose, fences or commentary.'
};

/**
 * Multimodal pipeline entry point. Prefers the dedicated pipeline endpoint and
 * falls back to vision/chat depending on the payload.
 */
async function processMultimodalInput({ imageBuffer, taskType = 'summarize', userPrompt, studentName, text } = {}) {
  const config = getAiConfig();
  const safeTask = TASK_PROMPTS[taskType] ? taskType : 'summarize';
  const taskInstruction = TASK_PROMPTS[safeTask];
  const personalisation = studentName ? ` The learner's name is ${studentName}.` : '';
  const combinedPrompt = [
    taskInstruction,
    personalisation,
    userPrompt ? `Additional learner instructions: ${userPrompt}` : '',
    text ? `Study material:\n${text}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');

  const image = bufferToBase64(imageBuffer);

  if (config.pipelineUrl) {
    const payload = {
      task_type: safeTask,
      prompt: combinedPrompt,
      user_prompt: userPrompt || '',
      material: text || '',
      student_name: studentName || '',
      image,
      images: image ? [image] : [],
      max_tokens: 2000,
      temperature: safeTask === 'mindmap' ? 0.2 : 0.4
    };
    return postToEndpoint(config.pipelineUrl, payload, 'pipeline');
  }

  if (image && config.visionUrl) {
    return extractVisualContext(image, combinedPrompt);
  }

  if (config.chatUrl) {
    return generateTutorResponse(taskInstruction, combinedPrompt, 2000, 0.4);
  }

  throw new AiServiceError('No AmyLearn AI endpoint is available.', 'AI_ENDPOINT_MISSING', 503);
}

module.exports = {
  AiServiceError,
  getAiConfig,
  isAiConfigured,
  generateTutorResponse,
  extractVisualContext,
  processMultimodalInput,
  extractText,
  TASK_PROMPTS
};
