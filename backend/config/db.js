'use strict';

const { prisma } = require('./prisma');

let connected = false;

/**
 * Connect Prisma. Connection failures are logged but never fatal outside of
 * production so that /health and static assets keep working while the database
 * is unavailable (useful for first boot before `prisma db push`).
 */
async function connectDB({ retries = 1, retryDelayMs = 1500 } = {}) {
  const attempts = Math.max(1, retries);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      // eslint-disable-next-line no-console
      console.log('[db] Connected to the database.');
      return true;
    } catch (error) {
      connected = false;
      // eslint-disable-next-line no-console
      console.error(`[db] Connection attempt ${attempt}/${attempts} failed: ${error.message}`);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.error('[db] Database unavailable. Serverless requests will fail until it recovers.');
  } else {
    // eslint-disable-next-line no-console
    console.warn('[db] Database unavailable — continuing in degraded mode (development).');
  }
  return false;
}

async function disconnectDB() {
  try {
    await prisma.$disconnect();
    connected = false;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[db] Disconnect failed: ${error.message}`);
    return false;
  }
}

async function pingDatabase() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    connected = true;
    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    connected = false;
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  pingDatabase,
  isConnected: () => connected
};
