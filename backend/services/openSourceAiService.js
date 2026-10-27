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

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 35000;

// High-speed open-source reasoning models on Groq
const DEFAULT_REASONING_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_REASONING_MODEL = 'qwen/qwen3.8-27b';
const FAST_REASONING_MODEL = 'openai/gpt-oss-20b';

const TASK_PROMPTS = {
  summarize:
    'You are an academic study assistant. Produce a structured summary with: an overview, key concepts, ' +
    'definitions, and a clean markdown table summarizing key properties or components where appropriate. Use concise markdown headings, bold terms, and clean bullets.',
  solve:
    'You are an academic problem solver. Solve every question in the material. For each item show the final ' +
    'answer first, then a clear step-by-step method with formulas and assumptions in structured markdown.',
  exam_quiz:
    'You are an examination setter. Create an exam-style quiz from the material: 5 multiple-choice questions ' +
    '(with four options and marked answer), 3 short-answer questions, and a comparison table for related concepts. Use clean markdown.',
  mindmap:
    'You are a Mermaid.js diagram generator. Return ONLY valid Mermaid code starting with "graph TD". ' +
    'Map the material into a hierarchical mind map of concepts. Do not add prose, fences or commentary.'
};

/**
 * Strip thinking / chain-of-thought tags so internal reasoning is hidden from the user
 */
function stripThinkingTags(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/^>\s*\*\*Step-by-Step Reasoning:\*\*[\s\S]*?(?=\n\n[^\n]|$)/i, '')
    .trim();
}

const cleanThinkingTags = stripThinkingTags;

/**
 * Extracts pure string text without internal reasoning details
 */
function extractText(data) {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return stripThinkingTags(data);
  if (Array.isArray(data)) return data.map(extractText).join('\n').trim();

  // Groq / OpenAI chat completions
  if (data.choices && Array.isArray(data.choices) && data.choices.length) {
    const choice = data.choices[0];
    const content = choice && (choice.message ? choice.message.content : choice.text);
    let output = typeof content === 'string' ? content.trim() : '';

    // If content is empty (e.g. model output only in reasoning field), fallback to clean text
    if (!output && choice && choice.message && choice.message.reasoning) {
      output = stripThinkingTags(choice.message.reasoning);
    }

    if (output) return stripThinkingTags(output);
  }

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
    if (typeof candidate === 'string' && candidate.trim()) return cleanThinkingTags(candidate.trim());
    if (candidate && typeof candidate === 'object') {
      const nested = extractText(candidate);
      if (nested) return nested;
    }
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    return '';
  }
}

function getAiConfig() {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  const model = process.env.AI_MODEL || DEFAULT_REASONING_MODEL;
  const timeout = Number(process.env.AI_TIMEOUT_MS) > 0 ? Number(process.env.AI_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS;

  return {
    provider: apiKey ? 'groq' : 'none',
    apiKey,
    baseUrl: GROQ_CHAT_URL,
    model,
    timeout
  };
}

function isAiConfigured() {
  const config = getAiConfig();
  return Boolean(config.apiKey);
}

/**
 * Execute chat completion via Groq with automatic model fallback
 */
async function callGroq({ messages, maxTokens = 2048, temperature = 0.6, model = null }) {
  const config = getAiConfig();
  if (!config.apiKey) {
    throw new AiServiceError(
      'GROQ_API_KEY is not configured in backend/.env.',
      'AI_KEY_MISSING',
      503
    );
  }

  const primaryModel = model || config.model;
  const modelsToTry = [primaryModel];
  if (primaryModel !== FALLBACK_REASONING_MODEL) modelsToTry.push(FALLBACK_REASONING_MODEL);
  if (!modelsToTry.includes(FAST_REASONING_MODEL)) modelsToTry.push(FAST_REASONING_MODEL);

  let lastError = null;

  for (const targetModel of modelsToTry) {
    try {
      const response = await axios.post(
        config.baseUrl,
        {
          model: targetModel,
          messages,
          max_tokens: maxTokens,
          temperature
        },
        {
          timeout: config.timeout,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      const text = extractText(response.data);
      if (!text) {
        throw new AiServiceError(`Groq (${targetModel}) returned an empty response.`, 'AI_EMPTY_RESPONSE', 502);
      }
      return text;
    } catch (error) {
      lastError = error;
      const errorMsg = error.response?.data?.error?.message || error.message || '';
      // If model decommissioned or unavailable, try next candidate
      if (error.response?.status === 404 || error.response?.data?.error?.code === 'model_decommissioned') {
        console.warn(`[ai-service] Groq model ${targetModel} unavailable, trying fallback...`);
        continue;
      }
      // For general upstream errors
      if (error.response) {
        const detail = error.response.data?.error?.message || `HTTP ${error.response.status}`;
        throw new AiServiceError(`Groq error: ${detail}`, 'AI_UPSTREAM_ERROR', 502);
      }
      if (error.code === 'ECONNABORTED') {
        throw new AiServiceError('Groq AI service timed out. Please try again.', 'AI_TIMEOUT', 504);
      }
      throw new AiServiceError(`Groq service unreachable: ${error.message}`, 'AI_UNREACHABLE', 502);
    }
  }

  throw new AiServiceError(`Groq inference failed: ${lastError?.message}`, 'AI_ALL_MODELS_FAILED', 502);
}

/**
 * Chat completion / tutoring entry point
 */
async function generateTutorResponse(systemInstruction, message, maxTokens = 2500, temperature = 0.7) {
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: message }
  ];
  return callGroq({ messages, maxTokens, temperature });
}

/**
 * Multimodal input processing (documents, parsed text, and academic prompts)
 */
async function processMultimodalInput({ imageBuffer, taskType = 'summarize', userPrompt, studentName, text } = {}) {
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

  return generateTutorResponse(taskInstruction, combinedPrompt, 2048, safeTask === 'mindmap' ? 0.2 : 0.4);
}

module.exports = {
  AiServiceError,
  getAiConfig,
  isAiConfigured,
  generateTutorResponse,
  processMultimodalInput,
  extractText,
  cleanThinkingTags,
  TASK_PROMPTS
};
