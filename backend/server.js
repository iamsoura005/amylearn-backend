'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { connectDB, pingDatabase } = require('./config/db');
const { HttpError } = require('./utils/apiHelpers');
const { apiRateLimiter } = require('./routes/rateLimiters');
const routes = require('./routes');
const { startWeeklyKeepAliveJob } = require('./services/dbKeepAliveService');

const REPO_ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// CORS allow-list (function form)
// ---------------------------------------------------------------------------
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true); // Postman / native clients

  const allowed = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ALPHA_URL
  ].filter(Boolean);

  if (allowed.includes(origin)) return callback(null, true);

  // Vercel deployments (production, branch, and preview)
  if (/^https:\/\/[a-z0-9.-]+\.vercel\.app$/.test(origin)) {
    return callback(null, true);
  }
  // Any localhost / loopback port
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)) return callback(null, true);

  if (process.env.NODE_ENV !== 'production') {
    // Private ranges for LAN previews
    if (/^https?:\/\/(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?$/.test(origin)) {
      return callback(null, true);
    }
  }
  // Hosted preview hosts
  if (/^https:\/\/[a-z0-9-]+\.hf\.space$/.test(origin)) return callback(null, true);
  // Mobile schemes
  if (/^(?:exp|amylearn):\/\//.test(origin)) return callback(null, true);

  return callback(new Error('Blocked by CORS policy'), false);
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:*', 'https://*.amylearn.app', 'https://*.hf.space', 'https://*'],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  })
);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Proxy token bridge: a reverse proxy may forward the session through
// x-user-token / x-authorization instead of the Authorization header.
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    const forwarded = req.headers['x-user-token'] || req.headers['x-authorization'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      req.headers.authorization = /^Bearer\s+/i.test(forwarded) ? forwarded : `Bearer ${forwarded}`;
    }
  }
  next();
});

// Static brand assets (college logos etc.)
app.use('/webdata', express.static(path.join(REPO_ROOT, 'webdata')));

// ---------------------------------------------------------------------------
// Health + site verification (mounted before api catch-all)
// ---------------------------------------------------------------------------
app.get(['/health', '/api/health'], async (req, res) => {
  const payload = {
    status: 'ok',
    name: 'amylearn-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
  if (req.query.db === 'true') {
    payload.db = await pingDatabase();
  }
  return res.json(payload);
});

// API surface
app.use('/api/', apiRateLimiter);
app.use(routes);

const siteVerificationId = process.env.GOOGLE_SITE_VERIFICATION;
if (siteVerificationId) {
  app.get(`/google${siteVerificationId}.html`, (req, res) => {
    res.type('text/plain').send(`google-site-verification: ${siteVerificationId}`);
  });
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    });
  }
  if (error && error.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${error.message}` });
  }
  if (error && error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large.' });
  }
  // Prisma database known request errors (P2002 = unique constraint, P2025 = not found, P2003 = foreign key)
  if (error && error.code === 'P2002') {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'field';
    return res.status(409).json({ success: false, message: `A record with this ${target} already exists.` });
  }
  if (error && error.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Requested record was not found or has been deleted.' });
  }
  if (error && error.code === 'P2003') {
    return res.status(409).json({ success: false, message: 'Cannot complete operation due to linked dependencies.' });
  }
  // eslint-disable-next-line no-console
  console.error(`[server] ${req.method} ${req.originalUrl} failed:`, error.message);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong on our side.' : error.message
  });
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const start = async () => {
  await connectDB({ retries: 2 });
  if (process.env.NODE_ENV === 'production' && !process.env.PORT) {
    // Serverless: export only, never listen
    return app;
  }
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] AmyLearn API listening on http://localhost:${PORT}`);
      startWeeklyKeepAliveJob();
      resolve(app);
    });
    server.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('[server] Failed to bind port:', error.message);
      resolve(app);
    });
  });
};

// Running as a plain Node process → boot immediately. Under a serverless
// provider the exported app is used instead.
if (require.main === module) {
  start().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[server] Bootstrap failed:', error.message);
  });
}

module.exports = app;
