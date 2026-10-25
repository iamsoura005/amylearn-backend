'use strict';

const { roleConfigFor, toFrontendRole } = require('../config/systemRoles');

function displayRoleFor(role) {
  const config = roleConfigFor(role);
  if (config) return config.displayRole;
  return toFrontendRole(role) || role || 'User';
}

function profileSummary(user) {
  if (!user) return null;
  const student = user.studentProfiles && user.studentProfiles[0];
  const faculty = user.facultyProfiles && user.facultyProfiles[0];
  return {
    rollNumber: student ? student.rollNumber : null,
    batchId: student ? student.batchId : null,
    departmentId: (student && student.departmentId) || (faculty && faculty.departmentId) || null,
    employeeId: faculty ? faculty.employeeId : null,
    designation: faculty ? faculty.designation : null
  };
}

/**
 * Safe user payload. Never leaks password hashes or encrypted secrets.
 */
function toUserDTO(user, extras = {}) {
  if (!user) return null;
  const profile = profileSummary(user);
  const role = extras.role || user.role;
  const frontendRole = toFrontendRole(role);
  const dto = {
    id: user.id,
    amylearnId: user.amylearnId || null,
    email: user.email,
    name: user.name,
    role,
    frontendRole,
    displayRole: displayRoleFor(role),
    department: user.department || 'General',
    college: user.college || null,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt || null,
    avatarUrl: user.avatarUrl || null,
    rollNumber: profile.rollNumber,
    batchId: profile.batchId,
    departmentId: profile.departmentId,
    employeeId: profile.employeeId,
    designation: profile.designation
  };

  if (extras.tenant) {
    dto.tenant = {
      id: extras.tenant.id,
      name: extras.tenant.name,
      collegeCode: extras.tenant.collegeCode || null,
      subdomain: extras.tenant.subdomain || null,
      type: extras.tenant.type,
      logoUrl: extras.tenant.logoUrl || null
    };
  }
  if (extras.membership) {
    dto.membership = {
      id: extras.membership.id,
      role: extras.membership.role,
      status: extras.membership.status,
      tenantId: extras.membership.tenantId
    };
  }
  if (extras.adminRoles) dto.adminRoles = extras.adminRoles;
  return Object.assign(dto, extras.extra || {});
}

function toTenantDTO(tenant) {
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    type: tenant.type,
    subdomain: tenant.subdomain || null,
    logoUrl: tenant.logoUrl || null,
    collegeCode: tenant.collegeCode || null,
    location: tenant.location,
    category: tenant.category,
    featured: Boolean(tenant.featured),
    status: tenant.status,
    createdAt: tenant.createdAt || null
  };
}

function toPublicTenantDTO(tenant) {
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    type: tenant.type,
    subdomain: tenant.subdomain || null,
    logoUrl: tenant.logoUrl || null,
    collegeCode: tenant.collegeCode || null,
    location: tenant.location,
    category: tenant.category,
    featured: Boolean(tenant.featured),
    status: tenant.status
  };
}

module.exports = { toUserDTO, toTenantDTO, toPublicTenantDTO, displayRoleFor };
