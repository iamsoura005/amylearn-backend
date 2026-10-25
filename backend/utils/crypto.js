'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const DEV_FALLBACK_KEY = 'developer-fallback-secret-key-amylearn';
let devKeyWarned = false;

function resolveSecret() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret.trim();
  if (process.env.NODE_ENV !== 'production') {
    if (!devKeyWarned && process.env.NODE_ENV !== 'test') {
      devKeyWarned = true;
      // eslint-disable-next-line no-console
      console.warn('[crypto] ENCRYPTION_KEY is not set — using an insecure development key. Set ENCRYPTION_KEY before any real deployment.');
    }
    return DEV_FALLBACK_KEY;
  }
  const error = new Error('Encryption is not configured. Set ENCRYPTION_KEY or JWT_SECRET.');
  error.statusCode = 500;
  throw error;
}

function getKey() {
  return crypto.createHash('sha256').update(resolveSecret()).digest();
}

/**
 * AES-256-GCM encrypt. Output format: iv:authTag:ciphertext (hex segments).
 */
function encrypt(plainText) {
  if (plainText === null || plainText === undefined) return plainText;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function looksEncrypted(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  return parts.every((part) => /^[0-9a-f]+$/i.test(part) && part.length > 0);
}

/**
 * Decrypt an `iv:authTag:ciphertext` payload. Values that are not in the
 * encrypted envelope are returned unchanged so legacy/plain rows keep working.
 */
function decrypt(payload) {
  if (payload === null || payload === undefined) return payload;
  if (!looksEncrypted(payload)) return payload;
  const [ivHex, tagHex, dataHex] = payload.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

function tryDecrypt(payload) {
  try {
    return decrypt(payload);
  } catch (error) {
    return null;
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function maskSecret(value, visible = 2) {
  if (!value) return '';
  const text = String(value);
  if (text.length <= visible * 2) return '*'.repeat(Math.max(text.length, 4));
  return `${text.slice(0, visible)}${'*'.repeat(Math.max(4, text.length - visible * 2))}${text.slice(-visible)}`;
}

function randomCode(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(crypto.randomInt(min, max + 1));
}

module.exports = {
  ALGORITHM,
  IV_LENGTH,
  DEV_FALLBACK_KEY,
  encrypt,
  decrypt,
  tryDecrypt,
  looksEncrypted,
  hashToken,
  maskSecret,
  randomCode
};
