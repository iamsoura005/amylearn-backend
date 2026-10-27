'use strict';

const router = require('express').Router();
const { setTenantContext, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');

router.use(setTenantContext);
router.use((req, res, next) => {
  requireAuthenticatedUser(req);
  next();
});

router.get('/', assignmentController.listAssignments);
router.post('/', assignmentController.createAssignment);
router.post('/:id/submit', assignmentController.submitAssignment);
router.get('/all-submissions', assignmentController.listAllSubmissions);
router.post('/grade', assignmentController.gradeSubmission);

module.exports = router;
