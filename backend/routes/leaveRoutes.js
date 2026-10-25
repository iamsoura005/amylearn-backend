'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const leave = require('../controllers/leaveController');

router.use(setTenantContext);

router.post('/apply', leave.apply);
router.get('/faculty', leave.faculty);
router.get('/history/:userId', leave.history);
router.get('/admin/requests', leave.adminRequests);
router.put('/admin/action/:id', leave.action);

module.exports = router;
