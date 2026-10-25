'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('./rateLimiters');
const auth = require('../controllers/authController');

router.use(authRateLimiter);

router.post('/check-email', auth.checkEmail);
router.post('/send-verification', auth.sendVerification);
router.post('/verify-email', auth.verifyEmail);
router.post('/role-signup', auth.roleSignup);
router.post('/signin', auth.signin);
router.post('/signout', auth.signout);
router.get('/verify-token', setTenantContext, auth.verifyToken);
router.get('/public/colleges', auth.publicColleges);
router.patch('/change-password', setTenantContext, auth.changePassword);

module.exports = router;
