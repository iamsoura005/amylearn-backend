'use strict';

const router = require('express').Router();
const multer = require('multer');
const { httpError } = require('../utils/apiHelpers');
const { setTenantContext } = require('../middleware/authMiddleware');
const coe = require('../controllers/coeController');

const ALLOWED_DOC_EXTENSIONS = /\.(pdf|docx?|txt|png|jpe?g|webp)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (ALLOWED_DOC_EXTENSIONS.test(file.originalname || '')) {
      return callback(null, true);
    }
    return callback(httpError(415, 'Unsupported question paper format. Upload a PDF, DOC, DOCX, TXT or image.'));
  }
});

router.use(setTenantContext);

// Sessions
router.get('/sessions/all', coe.listSessions);
router.post('/session', coe.createSession);
router.put('/session/:id', coe.updateSession);
router.get('/active-session', coe.activeSession);

// Eligibility & forms
router.get('/student/eligibility/:studentId', coe.eligibility);
router.post('/student/submit-form', coe.submitForm);
router.post('/submit-exam-form', coe.submitForm);
router.get('/my-forms/:studentId', coe.myForms);
router.put('/student/update-form-payment/:id', coe.updateFormPayment);
router.get('/student/payment-history/:userId', coe.paymentHistory);

// Allocations
router.get('/allocation/student/:studentId', coe.allocationByStudent);
router.get('/allocation/batch/:batchId', coe.allocationByBatch);
router.post('/allocation', coe.saveAllocation);

// Question bank
router.post('/upload-question', upload.single('file'), coe.uploadQuestion);
router.get('/questions', coe.listQuestions);
router.delete('/question/:id', coe.deleteQuestion);

// Marks & results
router.post('/upload-marks', coe.uploadMarks);
router.post('/publish-results', coe.publishResults);
router.get('/results/:rollNo', coe.resultsByRoll);
router.get('/my-results', coe.myResults);
router.get('/student/results/:userId', coe.studentResults);

// Admin views
router.get('/admin/exam-forms', coe.adminExamForms);
router.get('/admin/semester-fees', coe.adminSemesterFees);
router.get('/admin/exam-status', coe.adminExamStatus);
router.delete('/admin/reset-form/:formId', coe.resetForm);

// Feedback
router.get('/student/feedback-data/:userId', coe.feedbackData);
router.post('/student/submit-feedback', coe.submitFeedback);

// Admit card
router.get('/admit-card/:studentUserId', coe.getAdmitCard);

module.exports = router;
