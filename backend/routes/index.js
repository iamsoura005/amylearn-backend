'use strict';

const express = require('express');
const { HttpError } = require('../utils/apiHelpers');

const router = express.Router();

// Cron endpoints are registered before the /api catch-all so scheduled jobs
// never hit an authenticated route by accident.
router.use('/api/cron', require('./cronRoutes'));

router.use('/api/auth', require('./authRoutes'));
router.use('/it-auth', require('./itAuthAliasRoutes'));
router.use('/it-admin', require('./platformRoutes'));
router.use('/session', require('./sessionRoutes'));
router.use('/api/college-admin', require('./collegeAdminRoutes'));
router.use('/api/student', require('./studentRoutes'));
router.use('/api/ai', require('./aiRoutes'));
router.use('/api/coe', require('./coeRoutes'));
router.use('/api/leave', require('./leaveRoutes'));
router.use('/api/library', require('./libraryRoutes'));
router.use('/api/attendance', require('./attendanceRoutes'));

// Feature flags + dashboard menu (mounted at /api and at / per the endpoint registry)
router.use('/api', require('./systemRoutes'));
router.use('/', require('./systemRoutes'));

// Academic core + timetable (departments, classrooms, batches, notices, calendar, routine, lessons)
router.use('/api', require('./academicRoutes'));

// LMS (all-subjects, module and content management)
router.use('/api', require('./lmsRoutes'));

// Unknown /api endpoints return JSON, not an HTML 404
router.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

module.exports = router;
