'use strict';

const router = require('express').Router();
const { setITContext } = require('../middleware/authMiddleware');
const it = require('../controllers/itAdminController');

// Public platform entry points
router.get('/public/colleges', it.publicColleges);
router.post('/login', it.login);
router.post('/signout', it.signout);

// Everything below is platform-staff only
router.use(setITContext);

router.get('/colleges', it.listColleges);
router.post('/colleges', it.createCollege);
router.patch('/colleges/:id/status', it.updateCollegeStatus);
router.put('/colleges/:id', it.updateCollege);
router.delete('/colleges/:id', it.deleteCollege);
router.get('/college-requests', it.collegeRequests);
router.post('/college-requests/:id/action', it.actionCollegeRequest);
router.get('/manager-requests', it.managerRequests);
router.get('/audit-logs', it.listAuditLogs);
router.get('/users', it.listUsers);
router.get('/tenants-list', it.tenantsList);
router.get('/menu-config/:tenantId', it.getMenuConfig);
router.post('/menu-config', it.saveMenuConfig);
router.get('/colleges/:id/admins', it.listCollegeAdmins);
router.post('/colleges/:id/admins', it.addCollegeAdmin);
router.patch('/colleges/:id/admins/:userId', it.updateCollegeAdmin);
router.delete('/colleges/:id/admins/:userId', it.deleteCollegeAdmin);
router.get('/global-roles', it.listGlobalRoles);
router.post('/global-roles', it.createGlobalRole);
router.put('/global-roles/:key', it.updateGlobalRole);
router.delete('/global-roles/:key', it.deleteGlobalRole);
router.get('/colleges/:id/custom-roles', it.listCustomRoles);
router.post('/colleges/:id/custom-roles', it.createCustomRole);
router.patch('/colleges/:id/custom-roles/:roleKey/label', it.updateCustomRoleLabel);
router.delete('/colleges/:id/custom-roles/:roleKey', it.deleteCustomRole);

module.exports = router;
