'use strict';

const router = require('express').Router();
const { authRateLimiter } = require('./rateLimiters');
const it = require('../controllers/itAdminController');

// Login entry alias sharing the same handlers as /it-admin
router.use(authRateLimiter);

router.get('/public/colleges', it.publicColleges);
router.post('/login', it.login);
router.post('/signout', it.signout);

module.exports = router;
