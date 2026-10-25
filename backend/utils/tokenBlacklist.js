'use strict';

const { getJson, setJson } = require('./systemConfig');
const { hashToken } = require('./crypto');

const BLACKLIST_KEY = 'amylearn_token_blacklist';
const memorySet = new Set();
const memoryExpiry = new Map();
let loadedAt = 0;
const RELOAD_INTERVAL_MS = 30 * 1000;

function pruneMemory(now = Date.now()) {
  memoryExpiry.forEach((expiresAt, hash) => {
    if (!expiresAt || expiresAt <= now) {
      memoryExpiry.delete(hash);
      memorySet.delete(hash);
    }
  });
}

async function loadBlacklist(force = false) {
  const now = Date.now();
  if (!force && loadedAt && now - loadedAt < RELOAD_INTERVAL_MS) return;
  const entries = await getJson(BLACKLIST_KEY, []);
  if (Array.isArray(entries)) {
    entries.forEach((entry) => {
      if (!entry || !entry.hash) return;
      const expiresAt = entry.expiresAt ? new Date(entry.expiresAt).getTime() : null;
      if (expiresAt && expiresAt <= now) return;
      memorySet.add(entry.hash);
      memoryExpiry.set(entry.hash, expiresAt);
    });
  }
  loadedAt = now;
  pruneMemory(now);
}

/**
 * Persist a revoked token hash. The token payload is never stored, only its
 * SHA-256 hash plus the natural JWT expiry so the list self-prunes.
 */
async function revokeToken(token, expiresAt) {
  const hash = hashToken(token);
  const expiryMs = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 24 * 60 * 60 * 1000;
  memorySet.add(hash);
  memoryExpiry.set(hash, expiryMs);

  try {
    const entries = await getJson(BLACKLIST_KEY, []);
    const now = Date.now();
    const pruned = (Array.isArray(entries) ? entries : []).filter((entry) => {
      if (!entry || !entry.hash) return false;
      const entryExpiry = entry.expiresAt ? new Date(entry.expiresAt).getTime() : null;
      return !entryExpiry || entryExpiry > now;
    });
    if (!pruned.some((entry) => entry.hash === hash)) {
      pruned.push({ hash, expiresAt: new Date(expiryMs).toISOString(), revokedAt: new Date().toISOString() });
    }
    await setJson(BLACKLIST_KEY, pruned);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[auth] Could not persist token revocation: ${error.message}`);
  }
  return hash;
}

async function isTokenRevoked(token) {
  if (!token) return false;
  const hash = hashToken(token);
  await loadBlacklist();
  pruneMemory();
  return memorySet.has(hash);
}

async function revokedTokenCount() {
  await loadBlacklist(true);
  pruneMemory();
  return memorySet.size;
}

module.exports = {
  BLACKLIST_KEY,
  revokeToken,
  isTokenRevoked,
  revokedTokenCount,
  loadBlacklist
};
