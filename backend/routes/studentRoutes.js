'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const student = require('../controllers/studentController');

router.use(setTenantContext);

router.get('/dashboard', student.dashboard);
router.get('/courses', student.courses);
router.get('/admit-card', student.admitCard);
router.get('/fees', student.fees);
router.get('/exam-form', student.getExamForm);
router.post('/exam-form', student.postExamForm);
router.get('/sem-feedback', student.getSemFeedback);
router.post('/sem-feedback', student.postSemFeedback);
router.get('/project-info', student.getProjectInfo);
router.post('/project-info', student.saveProjectInfo);
router.get('/payment-history', student.paymentHistory);
router.post('/pay-fee', student.payFee);
router.post('/courses/toggle-completion', student.toggleContentCompletion);

module.exports = router;
