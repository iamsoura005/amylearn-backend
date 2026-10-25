'use strict';

const { httpError } = require('../utils/apiHelpers');
const { normalizeRole, isSuperAdminRole } = require('../config/systemRoles');

const ADMIN_ROLES = new Set([
  'college_admin',
  'it_admin',
  'it_user',
  'super_admin',
  'amylearn_admin',
  'amylearn_manager'
]);

function currentRoles(req) {
  const roles = new Set();
  if (req.role) roles.add(normalizeRole(req.role));
  if (req.user && req.user.role) roles.add(normalizeRole(req.user.role));
  if (req.itUser && req.itUser.originalRole) roles.add(normalizeRole(req.itUser.originalRole));
  if (req.tokenPayload && req.tokenPayload.role) roles.add(normalizeRole(req.tokenPayload.role));
  return roles;
}

function isAdminRequest(req) {
  const roles = currentRoles(req);
  return Array.from(roles).some((role) => ADMIN_ROLES.has(role) || isSuperAdminRole(role));
}

/**
 * Factory: requireAdminRole('college_admin') → middleware.
 * With no arguments it accepts any administrative role.
 */
function requireAdminRole(...allowedRoles) {
  const allowed = allowedRoles.flat().filter(Boolean).map((role) => normalizeRole(role));
  return function adminRoleGuard(req, res, next) {
    try {
      if (!req.user && !req.itUser) {
        throw httpError(401, 'Authentication required. Please sign in.');
      }
      const roles = currentRoles(req);
      if (allowed.length === 0) {
        if (!Array.from(roles).some((role) => ADMIN_ROLES.has(role) || isSuperAdminRole(role))) {
          throw httpError(403, 'Administrative access is required for this action.');
        }
        return next();
      }
      const permitted = Array.from(roles).some(
        (role) => allowed.includes(role) || (isSuperAdminRole(role) && allowed.includes('it_admin'))
      );
      if (!permitted) {
        throw httpError(403, 'You do not have permission to perform this action.');
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

const requireAdmin = requireAdminRole();
const requireCollegeAdmin = requireAdminRole('college_admin');
const requirePlatformAdmin = requireAdminRole('it_admin', 'it_user');
const requireFacultyOrAdmin = requireAdminRole('faculty', 'college_admin', 'it_admin', 'it_user');

module.exports = {
  ADMIN_ROLES,
  requireAdminRole,
  requireAdmin,
  requireCollegeAdmin,
  requirePlatformAdmin,
  requireFacultyOrAdmin,
  isAdminRequest,
  currentRoles
};
