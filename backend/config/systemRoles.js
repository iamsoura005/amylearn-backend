'use strict';

/**
 * Database roles for the two platform (cross-tenant) personas plus the mapping
 * the frontend uses for display. The DB values stay brand-neutral for campus
 * roles; only the platform roles carry the product prefix.
 */
const DB_ROLES = Object.freeze({
  SUPER_ADMIN: 'it_admin',
  MANAGER: 'it_user'
});

const FRONTEND_ROLES = Object.freeze({
  SUPER_ADMIN: 'amylearn_admin',
  MANAGER: 'amylearn_manager'
});

const SUPER_ADMIN_ROLES = Object.freeze([
  'super_admin',
  'it_admin',
  'amylearn_admin',
  'amylearn_manager'
]);

const CANONICAL_ROLES = Object.freeze([
  'student',
  'faculty',
  'college_admin',
  'it_user',
  'it_admin',
  'amylearn_manager',
  'amylearn_admin'
]);

const ROLE_MAP = Object.freeze({
  student: 'student',
  campus_student: 'student',
  faculty: 'faculty',
  college_admin: 'college_admin',
  campus_admin: 'college_admin',
  it_user: 'it_user',
  amylearn_manager: 'it_user',
  it_admin: 'it_admin',
  amylearn_admin: 'it_admin',
  super_admin: 'it_admin'
});

const FRONTEND_ROLE_MAP = Object.freeze({
  student: 'campus_student',
  campus_student: 'campus_student',
  faculty: 'faculty',
  college_admin: 'campus_admin',
  campus_admin: 'campus_admin',
  it_user: 'amylearn_manager',
  amylearn_manager: 'amylearn_manager',
  it_admin: 'amylearn_admin',
  amylearn_admin: 'amylearn_admin',
  super_admin: 'amylearn_admin'
});

const ROLE_CONFIG = Object.freeze({
  it_admin: {
    idPrefix: 'ADM',
    profileModel: 'ITAdminProfile',
    displayRole: 'Platform Admin',
    defaultDepartment: 'System Administration'
  },
  amylearn_admin: {
    idPrefix: 'ADM',
    profileModel: 'ITAdminProfile',
    displayRole: 'Platform Admin',
    defaultDepartment: 'System Administration'
  },
  it_user: {
    idPrefix: 'MGR',
    profileModel: 'ITUserProfile',
    displayRole: 'Platform Manager',
    defaultDepartment: 'IT Support'
  },
  amylearn_manager: {
    idPrefix: 'MGR',
    profileModel: 'ITUserProfile',
    displayRole: 'Platform Manager',
    defaultDepartment: 'IT Support'
  },
  college_admin: {
    idPrefix: 'CADM',
    profileModel: 'AdminProfile',
    displayRole: 'Campus Admin',
    defaultDepartment: 'Administration'
  },
  faculty: {
    idPrefix: 'FAC',
    profileModel: 'FacultyProfile',
    displayRole: 'Faculty',
    defaultDepartment: 'General'
  },
  student: {
    idPrefix: 'STU',
    profileModel: 'StudentProfile',
    displayRole: 'Student',
    defaultDepartment: 'General'
  }
});

const DEFAULT_ADMIN_ROLE_CATALOGUE = Object.freeze([
  {
    key: 'campus_admin',
    label: 'Campus Admin',
    description: 'Full control over the institution workspace.',
    baseRole: 'college_admin',
    permissions: ['manage_users', 'manage_departments', 'manage_finance', 'manage_exams', 'manage_roles']
  },
  {
    key: 'registrar',
    label: 'Registrar',
    description: 'Owns academic records, admissions and rosters.',
    baseRole: 'college_admin',
    permissions: ['manage_users', 'view_records', 'manage_departments']
  },
  {
    key: 'coe_controller',
    label: 'COE Controller',
    description: 'Runs examination sessions, forms and result publication.',
    baseRole: 'college_admin',
    permissions: ['manage_exams', 'publish_results', 'manage_fees']
  },
  {
    key: 'finance_officer',
    label: 'Finance Officer',
    description: 'Reviews fee ledgers and payment reconciliation.',
    baseRole: 'college_admin',
    permissions: ['manage_finance', 'view_records']
  }
]);

function normalizeRole(role) {
  if (!role) return null;
  return ROLE_MAP[String(role).toLowerCase()] || String(role).toLowerCase();
}

function toFrontendRole(role) {
  if (!role) return null;
  return FRONTEND_ROLE_MAP[String(role).toLowerCase()] || String(role).toLowerCase();
}

function isPlatformRole(role) {
  return SUPER_ADMIN_ROLES.includes(normalizeRole(role)) || SUPER_ADMIN_ROLES.includes(String(role).toLowerCase());
}

function isSuperAdminRole(role) {
  return isPlatformRole(role);
}

function roleConfigFor(role) {
  return ROLE_CONFIG[normalizeRole(role)] || ROLE_CONFIG[String(role).toLowerCase()] || null;
}

module.exports = {
  DB_ROLES,
  FRONTEND_ROLES,
  SUPER_ADMIN_ROLES,
  CANONICAL_ROLES,
  ROLE_MAP,
  FRONTEND_ROLE_MAP,
  ROLE_CONFIG,
  DEFAULT_ADMIN_ROLE_CATALOGUE,
  normalizeRole,
  toFrontendRole,
  isPlatformRole,
  isSuperAdminRole,
  roleConfigFor
};
