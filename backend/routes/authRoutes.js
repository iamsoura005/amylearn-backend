'use strict';

const router = require('express').Router();
const { setTenantContext } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('./rateLimiters');
const auth = require('../controllers/authController');

// Public college discovery is accessible by guest visitors without auth rate-limiting
router.get('/public/colleges', auth.publicColleges);

router.use(authRateLimiter);

router.post('/check-email', auth.checkEmail);
router.post('/send-verification', auth.sendVerification);
router.post('/verify-email', auth.verifyEmail);
router.post('/role-signup', auth.roleSignup);
router.post('/signin', auth.signin);
router.post('/signout', auth.signout);
router.get('/verify-token', setTenantContext, auth.verifyToken);
router.patch('/change-password', setTenantContext, auth.changePassword);

module.exports = router;

