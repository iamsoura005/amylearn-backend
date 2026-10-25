'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const academic = require('../controllers/academicController');

router.use(setTenantContext);

// Departments
router.get('/departments', academic.listDepartments);
router.post('/departments', academic.createDepartment);
router.put('/departments/:id', academic.updateDepartment);
router.delete('/departments/:id', academic.deleteDepartment);
router.post('/departments/:id/streams', academic.createStream);
router.put('/departments/:deptId/streams/:streamId/config', academic.updateStreamConfig);
router.delete('/departments/:id/streams/:streamId', academic.deleteStream);
router.get('/departments/:deptId/subjects', academic.listSubjects);
router.post('/departments/:deptId/subjects', academic.createSubjects);
router.put('/departments/subjects/:id', academic.updateSubject);
router.delete('/departments/subjects/:id', academic.deleteSubject);
router.get('/departments/:id/overview', academic.departmentOverview);

// Classrooms
router.get('/classrooms', academic.listClassrooms);
router.post('/classrooms', academic.createClassroom);
router.post('/classrooms/:id/enroll', academic.enrollClassroom);
router.delete('/classrooms/:id/unenroll', academic.unenrollClassroom);
router.delete('/classrooms/:id', academic.deleteClassroom);

// Batches
router.get('/batches', academic.listBatches);
router.post('/batches', academic.createBatch);
router.post('/batches/:batchId/enroll', academic.enrollBatch);
router.get('/batches/my-batches', academic.myBatches);
router.get('/batches/:batchId/students', academic.batchStudents);
router.put('/batches/:id', academic.updateBatch);
router.delete('/batches/:id', academic.deleteBatch);

// Notices
router.get('/notices', academic.listNotices);
router.get('/notices/:type', academic.noticesByType);
router.post('/notices', academic.createNotice);
router.patch('/notices/:id/react', academic.reactToNotice);
router.post('/notices/:id/comments', academic.addNoticeComment);
router.get('/notices/:id/comments', academic.listNoticeComments);
router.delete('/notices/:id', academic.deleteNotice);

// Timetable & calendar
router.get('/calendar', academic.getCalendar);
router.get('/calendar/events', academic.listCalendarEvents);
router.post('/calendar/events', academic.createCalendarEvent);
router.delete('/calendar/events/:id', academic.deleteCalendarEvent);
router.get('/calendar/org', academic.listOrgCalendar);
router.post('/calendar/org', academic.createOrgEvent);
router.patch('/calendar/org/:id', academic.updateOrgEvent);
router.delete('/calendar/org/:id', academic.deleteOrgEvent);
router.get('/routine/batch/:batchId', academic.getBatchRoutine);
router.post('/routine/batch/:batchId', academic.saveBatchRoutine);
router.get('/lessons', academic.listLessons);
router.post('/lessons', academic.createLesson);
router.get('/faculty/schedule', academic.facultySchedule);
router.post('/faculty/schedule', academic.addFacultySchedule);

module.exports = router;
