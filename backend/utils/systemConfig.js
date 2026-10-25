'use strict';

const { prisma } = require('../config/prisma');

/**
 * Thin helpers over the SystemConfig key/value table. This table backs every
 * feature that the immutable Prisma schema has no dedicated column for
 * (token revocation list, LMS toggles, custom roles, menu overrides, ledgers…).
 */
async function getConfig(key, fallback = null) {
  try {
    const row = await prisma.systemConfig.findUnique({ where: { key } });
    return row ? row.value : fallback;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[system-config] read failed for "${key}": ${error.message}`);
    return fallback;
  }
}

async function setConfig(key, value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return prisma.systemConfig.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized }
  });
}

async function deleteConfig(key) {
  try {
    await prisma.systemConfig.delete({ where: { key } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

async function getJson(key, fallback = null) {
  const raw = await getConfig(key, null);
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function setJson(key, value) {
  return setConfig(key, JSON.stringify(value));
}

async function updateJson(key, fallback, updater) {
  const current = await getJson(key, fallback);
  const next = await updater(current);
  await setJson(key, next);
  return next;
}

function tenantKey(prefix, tenantId) {
  return `${prefix}:${tenantId}`;
}

function tenantJsonKey(prefix, tenantId) {
  return tenantKey(prefix, tenantId || 'global');
}

async function getTenantJson(prefix, tenantId, fallback = null) {
  return getJson(tenantJsonKey(prefix, tenantId), fallback);
}

async function setTenantJson(prefix, tenantId, value) {
  return setJson(tenantJsonKey(prefix, tenantId), value);
}

async function updateTenantJson(prefix, tenantId, fallback, updater) {
  return updateJson(tenantJsonKey(prefix, tenantId), fallback, updater);
}

/**
 * Allocate a monotonically increasing sequence value (used for human readable
 * IDs: roll numbers, copy IDs, institution codes, amylearnIds).
 */
async function nextSequence(key, step = 1) {
  const row = await prisma.counter.upsert({
    where: { key },
    update: { seq: { increment: step } },
    create: { key, seq: step }
  });
  return row.seq;
}

async function formatSequence(key, prefix, width = 4) {
  const seq = await nextSequence(key);
  return `${prefix}${String(seq).padStart(width, '0')}`;
}

module.exports = {
  getConfig,
  setConfig,
  deleteConfig,
  getJson,
  setJson,
  updateJson,
  tenantKey,
  tenantJsonKey,
  getTenantJson,
  setTenantJson,
  updateTenantJson,
  nextSequence,
  formatSequence
};
