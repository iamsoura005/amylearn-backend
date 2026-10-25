'use strict';

let sharp = null;
try {
  // Lazily resolved so the server boots even if the native binary is missing.
  // eslint-disable-next-line global-require
  sharp = require('sharp');
} catch (error) {
  // eslint-disable-next-line no-console
  console.warn('[ocr] sharp is unavailable; OCR images will be sent unresized.');
}

function loadTesseract() {
  try {
    // eslint-disable-next-line global-require
    return require('tesseract.js');
  } catch (error) {
    return null;
  }
}

async function normalizeImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return null;
  if (!sharp) return buffer;
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .png()
      .toBuffer();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[ocr] image normalisation failed: ${error.message}`);
    return buffer;
  }
}

/**
 * OCR a single image buffer with tesseract.js. Returns '' when OCR is not
 * available so callers can degrade gracefully instead of crashing.
 */
async function ocrImage(buffer, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) return '';
  const tesseract = loadTesseract();
  if (!tesseract || typeof tesseract.createWorker !== 'function') {
    // eslint-disable-next-line no-console
    console.warn('[ocr] tesseract.js is not installed; skipping OCR.');
    return '';
  }

  const lang = options.lang || 'eng';
  let worker = null;
  try {
    const prepared = await normalizeImage(buffer);
    worker = await tesseract.createWorker(lang, 1, { logger: () => {} });
    const result = await worker.recognize(prepared);
    const text = (result && result.data && result.data.text) || '';
    return String(text).trim();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[ocr] recognition failed: ${error.message}`);
    return '';
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (error) {
        /* worker cleanup is best-effort */
      }
    }
  }
}

async function ocrImages(buffers = [], options = {}) {
  const results = [];
  for (const buffer of buffers) {
    // Sequential on purpose: tesseract workers are memory heavy.
    // eslint-disable-next-line no-await-in-loop
    const text = await ocrImage(buffer, options);
    if (text) results.push(text);
  }
  return results.join('\n\n');
}

module.exports = { ocrImage, ocrImages, normalizeImage };
