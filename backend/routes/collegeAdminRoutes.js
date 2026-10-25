'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const admin = require('../controllers/collegeAdminRoleController');

router.use(setTenantContext);

router.get('/settings', admin.getSettings);
router.patch('/settings', admin.updateSettings);
router.get('/my-roles', admin.getMyRoles);
router.get('/available-roles', admin.getAvailableRoles);
router.get('/admin-roles', admin.listAdminRoles);
router.post('/admin-roles', admin.assignAdminRoles);
router.get('/requests', admin.listRequests);
router.post('/requests/:id/:action', admin.actionRequest);
router.get('/users/:role', admin.listUsersByRole);
router.patch('/users/:id/status', admin.updateUserStatus);
router.delete('/users/:id', admin.removeUser);
router.get('/fees', admin.listFees);
router.get('/marks', admin.listMarks);

module.exports = router;
