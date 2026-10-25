'use strict';

const router = require('express').Router();
const multer = require('multer');
const { setTenantContext } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('./rateLimiters');
const { httpError } = require('../utils/apiHelpers');
const ai = require('../controllers/aiController');

const ALLOWED_EXTENSIONS = /\.(pdf|docx|xlsx|xlsm|pptx|txt|md|csv|png|jpe?g|webp|bmp|tiff?)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const mimetype = String(file.mimetype || '').toLowerCase();
    const looksSupported =
      mimetype.startsWith('image/') ||
      mimetype === 'application/pdf' ||
      mimetype.includes('wordprocessingml') ||
      mimetype.includes('spreadsheetml') ||
      mimetype.includes('presentationml') ||
      mimetype.startsWith('text/') ||
      ALLOWED_EXTENSIONS.test(file.originalname || '');
    if (looksSupported) return callback(null, true);
    return callback(httpError(415, 'Unsupported file type. Upload a PDF, DOCX, XLSX, PPTX, TXT or image.'));
  }
});

router.use(aiRateLimiter);
router.use(setTenantContext);

router.post('/chat', ai.chat);
router.post('/summarize-file', upload.single('file'), ai.summarizeFile);
router.post('/transcribe-video', ai.transcribeVideo);

module.exports = router;
