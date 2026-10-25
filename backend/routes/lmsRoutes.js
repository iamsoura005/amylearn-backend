'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const lms = require('../controllers/lmsController');

router.use(setTenantContext);

router.get('/all-subjects', lms.allSubjects);
router.get('/classrooms/:id/modules', lms.listModules);
router.post('/classrooms/:id/modules', lms.createModule);
router.get('/modules/:moduleId/content', lms.listContent);
router.post('/modules/:moduleId/content', lms.createContent);
router.get('/content/:id', lms.getContent);
router.put('/content/:id/toggle-download', lms.toggleDownload);
router.post('/content/:id/complete', lms.completeContent);
router.delete('/content/:id', lms.deleteContent);

module.exports = router;
