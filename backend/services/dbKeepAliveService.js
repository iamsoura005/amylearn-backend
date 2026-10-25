'use strict';

const { prisma } = require('../config/prisma');
const { pingDatabase: ping } = require('../config/db');

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
let keepAliveTimer = null;

/**
 * Lightweight liveness query used by /health?db=true and the cron endpoint.
 */
async function pingDatabase() {
  return ping();
}

async function runKeepAlive() {
  const startedAt = new Date();
  const result = await pingDatabase();
  try {
    // A nominal write keeps free-tier clusters from being paused for inactivity.
    await prisma.systemConfig.upsert({
      where: { key: 'amylearn_keep_alive' },
      update: { value: startedAt.toISOString() },
      create: { key: 'amylearn_keep_alive', value: startedAt.toISOString() }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[keep-alive] heartbeat write skipped: ${error.message}`);
  }
  // eslint-disable-next-line no-console
  console.log(`[keep-alive] ${result.ok ? 'OK' : 'FAILED'} at ${startedAt.toISOString()}`);
  return { ...result, checkedAt: startedAt.toISOString() };
}

/**
 * Weekly scheduler used when the server owns the process (local/Docker).
 * On serverless the same logic runs through /api/cron/db-keep-alive.
 */
function startWeeklyKeepAliveJob({ intervalMs = WEEK_MS, runImmediately = true } = {}) {
  if (keepAliveTimer) return keepAliveTimer;
  if (runImmediately) {
    runKeepAlive().catch(() => {
      /* already logged */
    });
  }
  keepAliveTimer = setInterval(() => {
    runKeepAlive().catch(() => {
      /* already logged */
    });
  }, intervalMs);
  if (typeof keepAliveTimer.unref === 'function') keepAliveTimer.unref();
  return keepAliveTimer;
}

function stopWeeklyKeepAliveJob() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

module.exports = {
  pingDatabase,
  runKeepAlive,
  startWeeklyKeepAliveJob,
  stopWeeklyKeepAliveJob,
  WEEK_MS
};
