'use strict';

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
const {
  SUPER_ADMIN_ROLES,
  DEFAULT_ADMIN_ROLE_CATALOGUE,
  isSuperAdminRole,
  normalizeRole,
  toFrontendRole
} = require('../config/systemRoles');
const { getTenantJson } = require('../utils/systemConfig');
const { isTokenRevoked } = require('../utils/tokenBlacklist');
const { httpError } = require('../utils/apiHelpers');

const DEV_JWT_FALLBACK = 'amylearn-development-insecure-secret';
const JWT_ALGORITHMS = ['HS256'];
let devSecretWarned = false;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) {
    const value = secret.trim();
    if (process.env.NODE_ENV === 'production' && value.length < 32) {
      throw httpError(500, 'JWT_SECRET must be at least 32 characters long in production.');
    }
    return value;
  }
  const env = process.env.NODE_ENV;
  if (env !== 'production') {
    if (!devSecretWarned && env !== 'test') {
      devSecretWarned = true;
      // eslint-disable-next-line no-console
      console.warn('[auth] JWT_SECRET is not set — using an insecure development secret. Set JWT_SECRET before any real deployment.');
    }
    return DEV_JWT_FALLBACK;
  }
  throw httpError(500, 'JWT_SECRET is not configured.');
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHMS[0],
    expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || '24h'
  });
}

function getTokenFromRequest(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && typeof header === 'string') {
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
    if (header.length > 20 && !header.includes(' ')) return header.trim();
  }
  const userToken = req.headers['x-user-token'] || req.headers['x-authorization'];
  if (userToken && typeof userToken === 'string') {
    return userToken.replace(/^Bearer\s+/i, '').trim();
  }
  if (req.cookies && (req.cookies.sessionToken || req.cookies.token)) {
    return req.cookies.sessionToken || req.cookies.token;
  }
  if (req.query && typeof req.query.token === 'string' && req.query.token.length > 20) {
    return req.query.token;
  }
  return null;
}

function decodeToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: JWT_ALGORITHMS });
}

function requestedTenantRef(req) {
  return (
    (typeof req.headers['x-tenant-id'] === 'string' && req.headers['x-tenant-id'].trim()) ||
    (typeof req.headers['x-college-id'] === 'string' && req.headers['x-college-id'].trim()) ||
    (typeof req.headers['x-selected-college'] === 'string' && req.headers['x-selected-college'].trim()) ||
    (typeof req.query.tenantId === 'string' && req.query.tenantId.trim()) ||
    null
  );
}

function membershipMatchesRef(membership, ref) {
  if (!membership || !ref) return false;
  const normalized = String(ref).trim().toLowerCase();
  const tenant = membership.tenant || {};
  return [membership.tenantId, tenant.id, tenant.collegeCode, tenant.subdomain, tenant.name]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase() === normalized);
}

async function findTenantByRef(ref) {
  if (!ref) return null;
  const value = String(ref).trim();
  return prisma.tenant.findFirst({
    where: {
      OR: [
        { id: value },
        { collegeCode: value.toUpperCase() },
        { collegeCode: value },
        { subdomain: value.toLowerCase() },
        { name: value }
      ]
    }
  });
}

async function loadAdminRoles(userId, tenantId, role) {
  if (!tenantId) return role === 'college_admin' ? ['campus_admin'] : [];
  const assignments = await getTenantJson('admin_role_assignments', tenantId, {});
  const normalizedAssignments =
    assignments && Array.isArray(assignments) ? {} : assignments && typeof assignments === 'object' ? assignments : {};
  const mine = Array.isArray(normalizedAssignments[userId]) ? normalizedAssignments[userId] : [];
  const keys = new Set(mine.map((entry) => (typeof entry === 'string' ? entry : entry && entry.key)).filter(Boolean));
  if (role === 'college_admin') keys.add('campus_admin');
  return Array.from(keys);
}

async function collectPermissions(tenantId, adminRoles) {
  if (!tenantId) return [];
  const custom = await getTenantJson('custom_roles', tenantId, []);
  const catalogue = [...DEFAULT_ADMIN_ROLE_CATALOGUE, ...(Array.isArray(custom) ? custom : [])];
  const permissions = new Set();
  adminRoles.forEach((key) => {
    const roleDef = catalogue.find((entry) => entry && (entry.key === key || entry.roleKey === key));
    if (roleDef && Array.isArray(roleDef.permissions)) {
      roleDef.permissions.forEach((permission) => permissions.add(permission));
    }
  });
  return Array.from(permissions);
}

function decorateUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    amylearnId: user.amylearnId || null,
    role: user.role,
    department: user.department || 'General',
    college: user.college || null,
    createdAt: user.createdAt
  };
}

function tenantShape(tenant) {
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    type: tenant.type,
    logoUrl: tenant.logoUrl || null,
    collegeCode: tenant.collegeCode || null,
    subdomain: tenant.subdomain || null,
    status: tenant.status
  };
}

function passwordChangedSinceIssue(user, payload) {
  const changedAt = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : 0;
  return changedAt > (Number(payload && payload.pwdChangedAt) || 0);
}

/**
 * Core resolver shared by setTenantContext / setITContext and the legacy
 * routers that resolve tenant context lazily.
 */
async function buildContext(req, { optional = false, requireTenant = false } = {}) {
  const token = getTokenFromRequest(req);
  if (!token) {
    if (optional) return null;
    throw httpError(401, 'Authentication required. Please sign in.');
  }

  let payload;
  try {
    payload = decodeToken(token);
  } catch (error) {
    if (optional && (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError')) return null;
    throw httpError(401, 'Session expired. Please sign in again.');
  }

  if (await isTokenRevoked(token)) {
    throw httpError(401, 'Session expired. Please sign in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw httpError(401, 'Session expired. Please sign in again.');
  }
  if (passwordChangedSinceIssue(user, payload)) {
    throw httpError(401, 'Your password was changed. Please sign in again.');
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id, status: 'active' },
    include: { tenant: true }
  });

  const platformUser = isSuperAdminRole(user.role);
  const ref = requestedTenantRef(req);
  let membership = null;

  if (ref) {
    membership = memberships.find((entry) => membershipMatchesRef(entry, ref)) || null;
    if (!membership && !platformUser) {
      throw httpError(403, 'You do not have access to this institution.');
    }
    if (!membership && platformUser) {
      const tenant = await findTenantByRef(ref);
      if (!tenant) throw httpError(404, 'Institution not found.');
      req.tenant = tenantShape(tenant);
      req.membership = null;
    }
  } else {
    const preferredTenantId = payload.tenantId;
    membership =
      memberships.find((entry) => entry.tenantId === preferredTenantId) || memberships[0] || null;
  }

  if (membership) {
    req.membership = membership;
    req.tenant = tenantShape(membership.tenant);
  } else if (!req.tenant) {
    req.tenant = null;
  }

  if (requireTenant && !req.tenant) {
    throw httpError(403, 'Select an institution to continue.');
  }

  const role = membership ? normalizeRole(membership.role) : normalizeRole(user.role);
  req.user = decorateUser(user);
  req.auth = { userId: user.id, email: user.email, tokenTenantId: payload.tenantId || null };
  req.tokenPayload = payload;
  req.authToken = token;
  req.role = role;
  req.isSuperAdmin = platformUser || SUPER_ADMIN_ROLES.includes(role);
  req.frontendRole = toFrontendRole(role);

  if (req.tenant) {
    req.adminRoles = await loadAdminRoles(user.id, req.tenant.id, role);
    req.permissions = await collectPermissions(req.tenant.id, req.adminRoles);
  } else {
    req.adminRoles = role === 'college_admin' ? ['campus_admin'] : [];
    req.permissions = [];
  }

  return { user, payload, token, role, membership };
}

async function setTenantContext(req, res, next) {
  try {
    await buildContext(req, { optional: false, requireTenant: false });
    next();
  } catch (error) {
    next(error);
  }
}

async function optionalTenantContext(req, res, next) {
  try {
    await buildContext(req, { optional: true, requireTenant: false });
    next();
  } catch (error) {
    next(error);
  }
}

async function verifyToken(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) throw httpError(401, 'Authentication required. Please sign in.');
    const payload = decodeToken(token);
    if (await isTokenRevoked(token)) {
      throw httpError(401, 'Session expired. Please sign in again.');
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw httpError(401, 'Session expired. Please sign in again.');
    if (passwordChangedSinceIssue(user, payload)) {
      throw httpError(401, 'Your password was changed. Please sign in again.');
    }
    req.user = decorateUser(user);
    req.auth = payload;
    req.tokenPayload = payload;
    req.authToken = token;
    req.role = normalizeRole(user.role);
    req.isSuperAdmin = isSuperAdminRole(user.role);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(httpError(401, 'Session expired. Please sign in again.'));
    }
    return next(error);
  }
}

async function setITContext(req, res, next) {
  try {
    const context = await buildContext(req, { optional: false, requireTenant: false });
    const originalRole = context.user.role;
    if (!isSuperAdminRole(originalRole) && !isSuperAdminRole(context.role)) {
      throw httpError(403, 'This portal is restricted to AmyLearn platform staff.');
    }
    req.itUser = {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
      role: toFrontendRole(originalRole),
      originalRole,
      amylearnId: context.user.amylearnId || null
    };
    next();
  } catch (error) {
    next(error);
  }
}

function requireTenant(req) {
  if (!req.tenant || !req.tenant.id) {
    throw httpError(401, 'Select an institution and sign in again.');
  }
  return req.tenant;
}

function requireAuthenticatedUser(req) {
  if (!req.user || !req.user.id) {
    throw httpError(401, 'Authentication required. Please sign in.');
  }
  return req.user;
}

module.exports = {
  getJwtSecret,
  signToken,
  getTokenFromRequest,
  decodeToken,
  buildContext,
  setTenantContext,
  optionalTenantContext,
  verifyToken,
  setITContext,
  requireTenant,
  requireAuthenticatedUser,
  findTenantByRef,
  loadAdminRoles,
  collectPermissions
};
