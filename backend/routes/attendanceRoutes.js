'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const attendance = require('../controllers/attendanceController');

router.use(setTenantContext);

router.get('/faculty/init', attendance.facultyInit);
router.get('/report', attendance.report);
router.get('/my-records', attendance.myRecords);
router.get('/my-attendance', attendance.myAttendance);
router.post('/mark', attendance.mark);
router.get('/weekly-reports', attendance.weeklyReports);
router.post('/weekly-reports/generate', attendance.generateWeekly);

module.exports = router;
