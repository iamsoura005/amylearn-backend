'use strict';

const router = require('express').Router();
const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { pingDatabase } = require('../config/db');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const library = require('../controllers/libraryController');

function secretsEqual(candidate, expected) {
  if (typeof candidate !== 'string' || typeof expected !== 'string') return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Equalise the input length so timing does not reveal the secret length,
    // then compare hashes to keep the comparison constant-time.
    const digestA = crypto.createHash('sha256').update(a).digest();
    const digestB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(digestA, digestB);
  }
  return crypto.timingSafeEqual(a, b);
}

function authorizeCron(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !String(secret).trim()) {
    if (process.env.NODE_ENV !== 'production') return true; // local development convenience
    return false; // fail closed in production
  }
  const header = req.headers.authorization || '';
  const bearer = (header.match(/^Bearer\s+(.+)$/i) || [])[1];
  return secretsEqual(bearer, String(secret).trim()) || secretsEqual(String(req.query.secret || ''), String(secret).trim());
}

// GET /api/cron/cleanup
router.get(
  '/cleanup',
  asyncHandler(async (req, res) => {
    if (!authorizeCron(req)) throw httpError(401, 'Unauthorized cron invocation.');

    const emailDeleted = await prisma.emailVerification.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    const booksDeleted = await prisma.physicalBook.deleteMany({
      where: { deleteAfter: { not: null, lt: new Date() } }
    });

    const { alertsSent } = await library.scanOverdueBooks();

    return res.json({
      success: true,
      emailCleaned: emailDeleted.count,
      booksCleaned: booksDeleted.count,
      overdueAlertsSent: alertsSent,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/cron/db-keep-alive
router.get(
  '/db-keep-alive',
  asyncHandler(async (req, res) => {
    if (!authorizeCron(req)) throw httpError(401, 'Unauthorized cron invocation.');
    const result = await pingDatabase();
    return res.json({ success: result.ok, ...result });
  })
);

module.exports = router;
