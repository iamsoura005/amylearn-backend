'use strict';

const { prisma } = require('../config/prisma');
const { DEFAULT_ADMIN_ROLE_CATALOGUE, normalizeRole, toFrontendRole } = require('../config/systemRoles');
const { toUserDTO, toTenantDTO } = require('../utils/userDTO');
const { asyncHandler, httpError, paginate, numberOrZero } = require('../utils/apiHelpers');
const {
  getTenantJson,
  setTenantJson,
  updateTenantJson,
  getJson
} = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

const SETTINGS_KEY = 'college_settings';
const REQUESTS_KEY = 'admin_requests';
const ROLE_ASSIGN_KEY = 'admin_role_assignments';
const FEE_LEDGER_KEY = 'exam_fee_ledger';
const SEMESTER_FEES_KEY = 'semester_fees';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

async function currentRoleCatalogue(tenantId) {
  const custom = await getTenantJson('custom_roles', tenantId, []);
  const global = await getJson('global_roles', null);
  const list = [
    ...DEFAULT_ADMIN_ROLE_CATALOGUE,
    ...(Array.isArray(global) ? global : []),
    ...(Array.isArray(custom) ? custom : [])
  ];
  const seen = new Set();
  return list.filter((role) => {
    if (!role || !role.key || seen.has(role.key)) return false;
    seen.add(role.key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const getSettings = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const stored = await getTenantJson(SETTINGS_KEY, tenant.id, {});
  return res.json({
    success: true,
    settings: {
      ...(stored && typeof stored === 'object' ? stored : {}),
      tenant: toTenantDTO(tenant),
      portalName: 'AmyLearn',
      supportEmail: (stored && stored.supportEmail) || 'support@amylearn.app'
    }
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const tenantFields = ['name', 'location', 'category', 'logoUrl', 'subdomain', 'featured'];
  const tenantUpdates = {};
  tenantFields.forEach((key) => {
    if (req.body[key] !== undefined) tenantUpdates[key] = req.body[key];
  });

  const settingsBody = { ...req.body };
  tenantFields.forEach((key) => delete settingsBody[key]);

  const merged = await updateTenantJson(SETTINGS_KEY, tenant.id, {}, (current) => ({
    ...(current && typeof current === 'object' ? current : {}),
    ...settingsBody,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user.id
  }));

  let updatedTenant = tenant;
  if (Object.keys(tenantUpdates).length) {
    updatedTenant = await prisma.tenant.update({ where: { id: tenant.id }, data: tenantUpdates });
  }

  return res.json({
    success: true,
    message: 'College settings updated.',
    settings: { ...merged, tenant: toTenantDTO(updatedTenant) }
  });
});

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
const getMyRoles = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  return res.json({
    success: true,
    role: normalizeRole(req.role),
    frontendRole: toFrontendRole(req.role),
    adminRoles: req.adminRoles || [],
    permissions: req.permissions || [],
    isSuperAdmin: Boolean(req.isSuperAdmin),
    tenant: toTenantDTO(tenant)
  });
});

const getAvailableRoles = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const roles = await currentRoleCatalogue(tenant.id);
  return res.json({ success: true, roles });
});

const listAdminRoles = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const assignments = await getTenantJson(ROLE_ASSIGN_KEY, tenant.id, {});
  const userIds = Object.keys(assignments || {});
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { memberships: { where: { tenantId: tenant.id } } }
      })
    : [];

  return res.json({
    success: true,
    assignments: userIds.map((userId) => {
      const user = users.find((entry) => entry.id === userId);
      return {
        userId,
        name: user ? user.name : 'Unknown user',
        email: user ? user.email : null,
        roles: Array.isArray(assignments[userId]) ? assignments[userId] : [],
        membershipStatus: user && user.memberships[0] ? user.memberships[0].status : 'unknown'
      };
    })
  });
});

const assignAdminRoles = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.isSuperAdmin && normalizeRole(req.role) !== 'college_admin') {
    throw httpError(403, 'Only campus administrators can assign administrative roles.');
  }
  const userId = req.body.userId || req.body.memberId;
  if (!userId) throw httpError(400, 'userId is required.');
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: String(userId), tenantId: tenant.id } }
  });
  if (!membership) throw httpError(404, 'This user is not a member of your institution.');

  const requested = Array.isArray(req.body.roles)
    ? req.body.roles
    : req.body.roleKey
      ? [req.body.roleKey]
      : [];
  const catalogue = await currentRoleCatalogue(tenant.id);
  const validKeys = new Set(catalogue.map((role) => role.key));
  const roles = requested.map((role) => String(role).trim()).filter((role) => validKeys.has(role));
  if (requested.length && roles.length !== requested.length) {
    throw httpError(400, 'One or more role keys are invalid.');
  }

  const updated = await updateTenantJson(ROLE_ASSIGN_KEY, tenant.id, {}, (current) => {
    const next = { ...(current && typeof current === 'object' ? current : {}) };
    if (roles.length) next[userId] = roles;
    else delete next[userId];
    return next;
  });

  return res.json({ success: true, message: 'Administrative roles updated.', assignments: updated });
});

// ---------------------------------------------------------------------------
// Approval requests
// ---------------------------------------------------------------------------
const listRequests = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const stored = await getTenantJson(REQUESTS_KEY, tenant.id, []);
  const suspended = await prisma.membership.findMany({
    where: { tenantId: tenant.id, status: 'suspended' },
    include: { user: true },
    take: 100
  });

  return res.json({
    success: true,
    requests: Array.isArray(stored) ? stored : [],
    suspendedMembers: suspended.map((membership) => ({
      id: membership.id,
      type: 'membership',
      status: 'Pending',
      role: membership.role,
      createdAt: membership.joinedAt,
      user: toUserDTO(membership.user)
    }))
  });
});

const actionRequest = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.isSuperAdmin && !['college_admin', 'faculty'].includes(normalizeRole(req.role))) {
    throw httpError(403, 'You cannot action approval requests.');
  }
  const action = String(req.params.action || '').toLowerCase();
  if (!['approve', 'reject', 'approved', 'rejected'].includes(action)) {
    throw httpError(400, 'Action must be approve or reject.');
  }
  const decision = action.startsWith('approve') ? 'Approved' : 'Rejected';

  const requests = await getTenantJson(REQUESTS_KEY, tenant.id, []);
  const list = Array.isArray(requests) ? requests : [];
  const target = list.find((entry) => entry.id === req.params.id);
  if (target) {
    target.status = decision;
    target.actionedAt = new Date().toISOString();
    target.actionedBy = req.user.id;
    await setTenantJson(REQUESTS_KEY, tenant.id, list);

    if (target.type === 'membership' && target.userId && decision === 'Approved') {
      await prisma.membership.updateMany({
        where: { userId: target.userId, tenantId: tenant.id },
        data: { status: 'active' }
      });
    }
    return res.json({ success: true, message: `Request ${decision.toLowerCase()}.`, request: target });
  }

  // Fall back to the membership id for suspended members surfaced by GET /requests.
  const membership = await prisma.membership.findUnique({ where: { id: req.params.id } });
  if (!membership || membership.tenantId !== tenant.id) {
    throw httpError(404, 'Request not found.');
  }
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { status: decision === 'Approved' ? 'active' : 'suspended' }
  });
  return res.json({ success: true, message: `Membership ${decision.toLowerCase()}.`, membership: updated });
});

// ---------------------------------------------------------------------------
// User administration
// ---------------------------------------------------------------------------
const ROLE_ALIASES = {
  student: ['student'],
  campus_student: ['student'],
  faculty: ['faculty'],
  admin: ['college_admin'],
  college_admin: ['college_admin'],
  campus_admin: ['college_admin']
};

const listUsersByRole = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const requested = String(req.params.role || 'student').toLowerCase();
  const roles = ROLE_ALIASES[requested] || [normalizeRole(requested)];
  const { page, pageSize, skip, take } = paginate(req.query);

  const where = {
    tenantId: tenant.id,
    role: { in: roles },
    ...(req.query.status ? { status: req.query.status } : {})
  };

  if (req.query.search) {
    where.user = {
      OR: [
        { name: { contains: String(req.query.search) } },
        { email: { contains: String(req.query.search) } },
        { amylearnId: { contains: String(req.query.search) } }
      ]
    };
  }

  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      include: { user: { include: { studentProfiles: true, facultyProfiles: true } } },
      orderBy: { joinedAt: 'desc' },
      skip,
      take
    }),
    prisma.membership.count({ where })
  ]);

  return res.json({
    success: true,
    page,
    pageSize,
    total,
    role: roles.length === 1 ? roles[0] : roles,
    users: memberships.map((membership) =>
      toUserDTO(membership.user, { role: membership.role, membership, tenant })
    )
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const status = String(req.body.status || '').toLowerCase();
  if (!['active', 'suspended'].includes(status)) {
    throw httpError(400, 'Status must be active or suspended.');
  }
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: req.params.id, tenantId: tenant.id } }
  });
  if (!membership) throw httpError(404, 'User is not a member of this institution.');

  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { status },
    include: { user: true }
  });
  return res.json({
    success: true,
    message: `User ${status}.`,
    user: toUserDTO(updated.user, { role: updated.role, membership: updated, tenant })
  });
});

const removeUser = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (req.params.id === req.user.id) {
    throw httpError(400, 'You cannot remove your own membership.');
  }
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: req.params.id, tenantId: tenant.id } }
  });
  if (!membership) throw httpError(404, 'User is not a member of this institution.');

  await prisma.membership.delete({ where: { id: membership.id } });
  if (normalizeRole(membership.role) === 'college_admin') {
    await prisma.adminProfile.deleteMany({ where: { userId: req.params.id, tenantId: tenant.id } });
  }
  if (normalizeRole(membership.role) === 'student') {
    await prisma.studentProfile.deleteMany({ where: { userId: req.params.id, tenantId: tenant.id } });
  }
  if (normalizeRole(membership.role) === 'faculty') {
    await prisma.facultyProfile.deleteMany({ where: { userId: req.params.id, tenantId: tenant.id } });
  }

  const remaining = await prisma.membership.count({ where: { userId: req.params.id } });
  if (remaining === 0 && String(req.query.hard).toLowerCase() === 'true') {
    await prisma.user.delete({ where: { id: req.params.id } }).catch(() => {});
  }

  return res.json({ success: true, message: 'User removed from this institution.' });
});

// ---------------------------------------------------------------------------
// Fees & marks
// ---------------------------------------------------------------------------
const listFees = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const ledger = await getTenantJson(FEE_LEDGER_KEY, tenant.id, []);
  const semesterFees = await getTenantJson(SEMESTER_FEES_KEY, tenant.id, {});
  const rows = Array.isArray(ledger) ? ledger : [];

  const totalCollected = rows
    .filter((row) => row.status === 'Paid')
    .reduce((sum, row) => sum + numberOrZero(row.amount), 0);
  const totalPending = rows
    .filter((row) => row.status !== 'Paid' && row.status !== 'Reversed')
    .reduce((sum, row) => sum + numberOrZero(row.amount), 0);

  const byStudent = {};
  rows.forEach((row) => {
    const key = row.studentId || row.rollNumber || 'unknown';
    if (!byStudent[key]) {
      byStudent[key] = {
        studentId: row.studentId || null,
        rollNumber: row.rollNumber || null,
        studentName: row.studentName || null,
        total: 0,
        paid: 0,
        pending: 0,
        entries: 0
      };
    }
    byStudent[key].total += numberOrZero(row.amount);
    byStudent[key].entries += 1;
    if (row.status === 'Paid') byStudent[key].paid += numberOrZero(row.amount);
    else if (row.status !== 'Reversed') byStudent[key].pending += numberOrZero(row.amount);
  });

  return res.json({
    success: true,
    summary: {
      totalCollected,
      totalPending,
      entries: rows.length,
      semesterFees: semesterFees && typeof semesterFees === 'object' ? semesterFees : {}
    },
    rows,
    students: Object.values(byStudent)
  });
});

const listMarks = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const where = { tenantId: tenant.id };
  if (req.query.subjectId) where.subjectId = String(req.query.subjectId);
  if (req.query.studentId) where.studentId = String(req.query.studentId);

  const results = await prisma.examResult.findMany({ where, orderBy: { createdAt: 'desc' }, take: 1000 });
  const subjectIds = Array.from(new Set(results.map((result) => result.subjectId)));
  const studentIds = Array.from(new Set(results.map((result) => result.studentId)));

  const [subjects, students] = await Promise.all([
    subjectIds.length
      ? prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, code: true, semester: true } })
      : [],
    studentIds.length
      ? prisma.user.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, name: true, email: true, amylearnId: true }
        })
      : []
  ]);

  const rows = results.map((result) => {
    const subject = subjects.find((entry) => entry.id === result.subjectId);
    const student = students.find((entry) => entry.id === result.studentId);
    return {
      id: result.id,
      studentId: result.studentId,
      studentName: student ? student.name : 'Unknown student',
      rollNumber: student ? student.amylearnId : null,
      subjectId: result.subjectId,
      subjectName: subject ? subject.name : 'Unknown subject',
      subjectCode: subject ? subject.code : null,
      semester: subject ? subject.semester : null,
      marks: result.marks,
      grade: result.grade,
      result: result.marks >= 40 ? 'Pass' : 'Fail',
      createdAt: result.createdAt
    };
  });

  return res.json({ success: true, count: rows.length, marks: rows });
});

module.exports = {
  getSettings,
  updateSettings,
  getMyRoles,
  getAvailableRoles,
  listAdminRoles,
  assignAdminRoles,
  listRequests,
  actionRequest,
  listUsersByRole,
  updateUserStatus,
  removeUser,
  listFees,
  listMarks
};
