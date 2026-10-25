'use strict';

const path = require('path');
const { ocrImage, ocrImages } = require('./ocrService');

const PAGE_LIMIT = Number(process.env.DOCUMENT_PAGE_LIMIT) > 0 ? Number(process.env.DOCUMENT_PAGE_LIMIT) : 25;
const IMAGE_LIMIT = 25;
const LIMIT_EXCEEDED = 'LIMIT_EXCEEDED';

function lazyRequire(name) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[file-parser] Optional dependency "${name}" is unavailable: ${error.message}`);
    return null;
  }
}

function normalizeWhitespace(text) {
  return String(text || '')
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractTextFromPdf(buffer) {
  const pdfParse = lazyRequire('pdf-parse');
  if (!pdfParse) return { text: '', pages: 0, error: 'pdf-parse unavailable' };
  try {
    const data = await pdfParse(buffer);
    return {
      text: normalizeWhitespace(data.text || ''),
      pages: Number(data.numpages) || 0,
      info: data.info || null
    };
  } catch (error) {
    return { text: '', pages: 0, error: error.message };
  }
}

async function extractTextFromDocx(buffer) {
  const mammoth = lazyRequire('mammoth');
  if (!mammoth) return '';
  try {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeWhitespace(result.value || '');
  } catch (error) {
    return '';
  }
}

async function extractTextFromExcel(buffer) {
  const ExcelJS = lazyRequire('exceljs');
  if (!ExcelJS) return '';
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const lines = [];
    workbook.eachSheet((sheet) => {
      lines.push(`## Sheet: ${sheet.name}`);
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const values = Array.isArray(row.values) ? row.values.slice(1) : [];
        const cells = values.map((value) => {
          if (value === null || value === undefined) return '';
          if (value && typeof value === 'object') {
            if (value.text) return String(value.text);
            if (value.result !== undefined) return String(value.result);
            if (value.hyperlink) return String(value.hyperlink);
            return JSON.stringify(value);
          }
          return String(value);
        });
        if (cells.some((cell) => cell.trim())) lines.push(cells.join('\t'));
      });
      lines.push('');
    });
    return normalizeWhitespace(lines.join('\n'));
  } catch (error) {
    return '';
  }
}

function extractPptxTextWithZip(buffer) {
  const AdmZip = lazyRequire('adm-zip');
  if (!AdmZip) return '';
  try {
    const zip = new AdmZip(buffer);
    const slides = zip
      .getEntries()
      .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName))
      .sort((a, b) => {
        const aNum = Number((a.entryName.match(/(\d+)\.xml$/) || [])[1] || 0);
        const bNum = Number((b.entryName.match(/(\d+)\.xml$/) || [])[1] || 0);
        return aNum - bNum;
      });
    const text = slides
      .map((entry, index) => {
        const xml = entry.getData().toString('utf8');
        const runs = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
        const lines = runs
          .map((run) => run.replace(/<[^>]+>/g, '').trim())
          .filter(Boolean)
          .map((line) =>
            line
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
          );
        return `## Slide ${index + 1}\n${lines.join('\n')}`;
      })
      .join('\n\n');
    return normalizeWhitespace(text);
  } catch (error) {
    return '';
  }
}

async function extractTextFromPptx(buffer) {
  const officeparser = lazyRequire('officeparser');
  if (officeparser) {
    try {
      const parseFn = officeparser.parseOfficeAsync || officeparser.parseOffice;
      if (typeof parseFn === 'function') {
        const result = await parseFn(buffer);
        const text = typeof result === 'string' ? result : result && (result.text || result.value);
        if (text && String(text).trim()) return normalizeWhitespace(text);
      }
    } catch (error) {
      /* fall through to the zip parser */
    }
  }
  return extractPptxTextWithZip(buffer);
}

function extractTextFromTxt(buffer) {
  return normalizeWhitespace(buffer.toString('utf8'));
}

/**
 * Extract embedded JPEG streams from a PDF. Scanned PDFs frequently wrap each
 * page as a single DCTDecode image; pulling those streams lets tesseract OCR the
 * pages without a native PDF rasteriser.
 */
function extractEmbeddedJpegs(buffer, limit = IMAGE_LIMIT) {
  const images = [];
  if (!Buffer.isBuffer(buffer)) return images;
  let offset = 0;
  while (offset < buffer.length && images.length < limit) {
    const start = buffer.indexOf(Buffer.from([0xff, 0xd8, 0xff]), offset);
    if (start === -1) break;
    const end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start + 3);
    if (end === -1) break;
    const slice = buffer.subarray(start, end + 2);
    if (slice.length > 2048) images.push(Buffer.from(slice));
    offset = end + 2;
  }
  return images;
}

function extractDocxImages(buffer, limit = IMAGE_LIMIT) {
  const AdmZip = lazyRequire('adm-zip');
  if (!AdmZip) return [];
  try {
    const zip = new AdmZip(buffer);
    return zip
      .getEntries()
      .filter((entry) => /^word\/media\/.+\.(png|jpe?g|bmp|tiff?)$/i.test(entry.entryName))
      .slice(0, limit)
      .map((entry) => entry.getData());
  } catch (error) {
    return [];
  }
}

async function extractTextFromImage(buffer) {
  return ocrImage(buffer);
}

async function extractTextFromScannedPdf(buffer, { maxPages = PAGE_LIMIT } = {}) {
  const digital = await extractTextFromPdf(buffer);
  if (digital.pages && digital.pages > maxPages) return LIMIT_EXCEEDED;
  const images = extractEmbeddedJpegs(buffer);
  if (images.length === 0) return '';
  const text = await ocrImages(images);
  return normalizeWhitespace(text);
}

async function extractTextFromScannedDocx(buffer) {
  const images = extractDocxImages(buffer);
  if (images.length === 0) return '';
  const text = await ocrImages(images);
  return normalizeWhitespace(text);
}

function detectKind(filename = '', mimetype = '') {
  const ext = path.extname(filename || '').toLowerCase();
  const mime = String(mimetype || '').toLowerCase();
  if (mime.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif'].includes(ext)) {
    return 'image';
  }
  if (mime === 'application/pdf' || ext === '.pdf') return 'pdf';
  if (ext === '.docx' || mime.includes('wordprocessingml')) return 'docx';
  if (ext === '.xlsx' || ext === '.xlsm' || mime.includes('spreadsheetml')) return 'xlsx';
  if (ext === '.pptx' || mime.includes('presentationml')) return 'pptx';
  if (ext === '.txt' || ext === '.md' || ext === '.csv' || mime.startsWith('text/')) return 'text';
  return 'unknown';
}

/**
 * Unified extraction with the digital-then-OCR merge used by /api/ai/summarize-file.
 * Returns the raw word count thresholds untouched; the controller decides when to
 * prepend the source headers.
 */
async function extractDocument(buffer, { filename = '', mimetype = '', maxPages = PAGE_LIMIT } = {}) {
  const kind = detectKind(filename, mimetype);
  const result = {
    kind,
    pages: 0,
    digitalText: '',
    ocrText: '',
    text: '',
    limited: false,
    ocrUsed: false,
    error: null
  };

  if (kind === 'image') {
    const text = await extractTextFromImage(buffer);
    return { ...result, ocrText: text, text, ocrUsed: Boolean(text) };
  }

  if (kind === 'pdf') {
    const digital = await extractTextFromPdf(buffer);
    result.pages = digital.pages;
    result.digitalText = digital.text;
    if (digital.pages && digital.pages > maxPages) {
      return { ...result, limited: true, text: LIMIT_EXCEEDED };
    }
    if (digital.text.length < 100) {
      const ocr = await extractTextFromScannedPdf(buffer, { maxPages });
      if (ocr === LIMIT_EXCEEDED) return { ...result, limited: true, text: LIMIT_EXCEEDED };
      result.ocrText = ocr;
      result.ocrUsed = Boolean(ocr);
    }
    result.text = normalizeWhitespace([result.digitalText, result.ocrText].filter(Boolean).join('\n\n'));
    return result;
  }

  if (kind === 'docx') {
    result.digitalText = await extractTextFromDocx(buffer);
    if (result.digitalText.length < 100) {
      result.ocrText = await extractTextFromScannedDocx(buffer);
      result.ocrUsed = Boolean(result.ocrText);
    }
    result.text = normalizeWhitespace([result.digitalText, result.ocrText].filter(Boolean).join('\n\n'));
    if (!result.text) result.error = 'No readable text found in this document.';
    return result;
  }

  if (kind === 'xlsx') {
    result.digitalText = await extractTextFromExcel(buffer);
    result.text = result.digitalText;
    if (!result.text) result.error = 'No readable text found in this spreadsheet.';
    return result;
  }

  if (kind === 'pptx') {
    result.digitalText = await extractTextFromPptx(buffer);
    result.text = result.digitalText;
    if (!result.text) result.error = 'No readable text found in this presentation.';
    return result;
  }

  if (kind === 'text') {
    result.digitalText = extractTextFromTxt(buffer);
    result.text = result.digitalText;
    return result;
  }

  result.error = 'Unsupported file type. Upload a PDF, DOCX, XLSX, PPTX, TXT or image.';
  return result;
}

module.exports = {
  PAGE_LIMIT,
  IMAGE_LIMIT,
  LIMIT_EXCEEDED,
  detectKind,
  normalizeWhitespace,
  extractTextFromPdf,
  extractTextFromDocx,
  extractTextFromExcel,
  extractTextFromPptx,
  extractTextFromTxt,
  extractTextFromImage,
  extractTextFromScannedPdf,
  extractTextFromScannedDocx,
  extractEmbeddedJpegs,
  extractDocxImages,
  extractDocument
};
