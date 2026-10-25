'use strict';

class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function httpError(statusCode, message, details = null) {
  return new HttpError(statusCode, message, details);
}

function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function parseDate(value, fieldName = 'date') {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(400, `Invalid ${fieldName}.`);
  }
  return date;
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function daysBetween(from, to) {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function toInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pick(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    if (obj && obj[key] !== undefined) result[key] = obj[key];
  });
  return result;
}

function paginate(query = {}) {
  const page = Math.max(1, toInt(query.page, 1));
  const pageSize = clamp(toInt(query.pageSize || query.limit, 25), 1, 200);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

function sortByDateDesc(list, key = 'createdAt') {
  return [...list].sort((a, b) => new Date(b[key] || 0) - new Date(a[key] || 0));
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isUuidLike(value) {
  return typeof value === 'string' && /^[0-9a-fA-F-]{8,}$/.test(value);
}

function numberOrZero(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

module.exports = {
  HttpError,
  httpError,
  asyncHandler,
  parseDate,
  startOfDay,
  endOfDay,
  addDays,
  daysBetween,
  toInt,
  toNumber,
  clamp,
  pick,
  paginate,
  sortByDateDesc,
  safeJsonParse,
  isEmail,
  isUuidLike,
  numberOrZero
};
