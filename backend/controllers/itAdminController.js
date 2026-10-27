'use strict';

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { signToken, decodeToken } = require('../middleware/authMiddleware');
const {
  normalizeRole,
  isPlatformRole,
  toFrontendRole,
  DEFAULT_ADMIN_ROLE_CATALOGUE
} = require('../config/systemRoles');
const { getMenuForRole, normalizeMenuOverrides } = require('../config/masterFeatures');
const { toUserDTO, toPublicTenantDTO, toTenantDTO } = require('../utils/userDTO');
const { asyncHandler, httpError, paginate } = require('../utils/apiHelpers');
const { getJson, setJson, getTenantJson, setTenantJson } = require('../utils/systemConfig');
const { revokeToken } = require('../utils/tokenBlacklist');

async function findTenantOr404(id) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw httpError(404, 'Institution not found.');
  return tenant;
}

function sanitizeRoleDefinition(input) {
  const key = String(input.key || input.roleKey || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .slice(0, 60);
  if (!key) throw httpError(400, 'A role key is required.');
  return {
    key,
    label: String(input.label || key).trim().slice(0, 120),
    description: String(input.description || '').trim().slice(0, 500),
    baseRole: normalizeRole(input.baseRole || 'college_admin'),
    permissions: Array.isArray(input.permissions)
      ? input.permissions.map((permission) => String(permission).trim()).filter(Boolean).slice(0, 60)
      : []
  };
}

// ---------------------------------------------------------------------------
// Public platform endpoints
// ---------------------------------------------------------------------------
const publicColleges = asyncHandler(async (req, res) => {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'active' },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }]
  });
  return res.json({ success: true, colleges: tenants.map((tenant) => toPublicTenantDTO(tenant)) });
});

const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.email || req.body.identifier || '').trim();
  if (!identifier) throw httpError(400, 'Enter your platform email.');

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { email: identifier }, { amylearnId: identifier }]
    }
  });
  if (!user) throw httpError(401, 'Invalid platform credentials.');

  const ok = await bcrypt.compare(String(req.body.password || ''), user.password);
  if (!ok) throw httpError(401, 'Invalid platform credentials.');

  const canonical = normalizeRole(user.role);
  if (!isPlatformRole(user.role)) {
    throw httpError(403, 'This portal is restricted to AmyLearn platform staff. Use the campus portal to sign in.');
  }

  const token = signToken({
    userId: user.id,
    tenantId: null,
    role: canonical,
    email: user.email,
    name: user.name,
    frontendRole: toFrontendRole(canonical)
  });

  try {
    res.cookie('it_session', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/'
    });
  } catch (error) {
    /* optional */
  }

  return res.json({
    success: true,
    token,
    role: toFrontendRole(canonical),
    user: toUserDTO(user, { role: canonical, extra: { displayRole: canonical === 'it_user' ? 'Platform Manager' : 'Platform Admin' } })
  });
});

const signout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const token =
    (header.match(/^Bearer\s+(.+)$/i) || [])[1] || req.headers['x-user-token'] || req.cookies?.it_session || null;
  if (token) {
    let expiresAt = null;
    try {
      const payload = decodeToken(token);
      expiresAt = payload?.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    }
    await revokeToken(token, expiresAt);
  }
  try {
    res.clearCookie('it_session', { path: '/' });
  } catch (error) {
    /* optional */
  }
  return res.json({ success: true, message: 'Platform session signed out.' });
});

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------
const listColleges = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = paginate(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { name: { contains: String(req.query.search) } },
      { collegeCode: { contains: String(req.query.search) } },
      { subdomain: { contains: String(req.query.search) } }
    ];
  }

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        _count: { select: { memberships: true, departments: true, subjects: true } }
      }
    }),
    prisma.tenant.count({ where })
  ]);

  return res.json({
    success: true,
    page,
    pageSize,
    total,
    colleges: tenants.map((tenant) => ({
      ...toTenantDTO(tenant),
      counts: tenant._count
    }))
  });
});

const createCollege = asyncHandler(async (req, res) => {
  const body = req.body;
  const collegeCode = String(body.collegeCode).trim().toUpperCase();
  const existing = await prisma.tenant.findFirst({
    where: { OR: [{ name: body.name }, { collegeCode }] }
  });
  if (existing) throw httpError(409, 'An institution with this name or college code already exists.');

  const tenant = await prisma.tenant.create({
    data: {
      name: String(body.name).trim(),
      collegeCode,
      subdomain: body.subdomain ? String(body.subdomain).trim().toLowerCase() : null,
      type: body.type || 'college',
      location: body.location || 'India',
      category: body.category || 'University',
      logoUrl: body.logoUrl || null,
      featured: Boolean(body.featured),
      status: body.status || 'active'
    }
  });

  return res.status(201).json({ success: true, message: 'Institution created.', college: toTenantDTO(tenant) });
});

const updateCollegeStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toLowerCase();
  if (!['active', 'suspended'].includes(status)) {
    throw httpError(400, 'Status must be active or suspended.');
  }
  await findTenantOr404(req.params.id);
  const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { status } });
  return res.json({ success: true, message: `Institution ${status}.`, college: toTenantDTO(tenant) });
});

const updateCollege = asyncHandler(async (req, res) => {
  await findTenantOr404(req.params.id);
  const allowed = ['name', 'collegeCode', 'subdomain', 'type', 'location', 'category', 'logoUrl', 'featured', 'status'];
  const data = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  });
  if (data.collegeCode) data.collegeCode = String(data.collegeCode).toUpperCase();
  if (data.subdomain) data.subdomain = String(data.subdomain).toLowerCase();
  if (Object.keys(data).length === 0) throw httpError(400, 'No supported fields were supplied.');
  const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data });
  return res.json({ success: true, message: 'Institution updated.', college: toTenantDTO(tenant) });
});

const deleteCollege = asyncHandler(async (req, res) => {
  await findTenantOr404(req.params.id);
  await prisma.tenant.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Institution deleted.' });
});

const tenantsList = asyncHandler(async (req, res) => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, collegeCode: true, subdomain: true, status: true, category: true }
  });
  return res.json({ success: true, tenants });
});

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------
const INITIAL_COLLEGE_REQUESTS = [
  {
    id: 'req-apex-01',
    collegeName: 'Apex Institute of Technology & Sciences',
    collegeCode: 'AITS',
    domain: 'apex-tech',
    applicantName: 'Dr. Ramesh Narayan',
    applicantEmail: 'principal@apextech.edu.in',
    phone: '+91 94432 18900',
    type: 'Engineering & Technology',
    campusSize: '3,200 students · 180 faculty',
    status: 'Pending',
    submittedAt: '2026-10-25T10:30:00.000Z',
    notes: 'Seeking enterprise campus deployment with NAAC compliance and COE automation.'
  },
  {
    id: 'req-zenith-02',
    collegeName: 'Zenith Global Business School',
    collegeCode: 'ZGBS',
    domain: 'zenith-mba',
    applicantName: 'Prof. Ananya Sen',
    applicantEmail: 'dean@zenith.ac.in',
    phone: '+91 98840 76211',
    type: 'Management & Business',
    campusSize: '1,450 students · 75 faculty',
    status: 'Pending',
    submittedAt: '2026-10-22T14:15:00.000Z',
    notes: 'Multi-stream trimester curriculum with case study library requirements.'
  },
  {
    id: 'req-metro-03',
    collegeName: 'Metro Polytechnic College',
    collegeCode: 'MPC',
    domain: 'metro-poly',
    applicantName: 'Er. S. Balaji',
    applicantEmail: 'registrar@metropoly.edu',
    phone: '+91 97910 43520',
    type: 'Polytechnic & Diploma',
    campusSize: '2,100 students · 110 faculty',
    status: 'Pending',
    submittedAt: '2026-10-20T09:00:00.000Z',
    notes: 'Requires biometric attendance integration and semester dues ledger.'
  }
];

const collegeRequests = asyncHandler(async (req, res) => {
  let stored = await getJson('college_requests', []);
  if (!Array.isArray(stored) || !stored.length) {
    stored = INITIAL_COLLEGE_REQUESTS;
    await setJson('college_requests', stored);
  }

  const suspended = await prisma.tenant.findMany({
    where: { status: 'suspended' },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const tenancyRequests = await prisma.membership.findMany({
    where: { status: 'suspended' },
    include: { user: true, tenant: true },
    orderBy: { joinedAt: 'desc' },
    take: 100
  });

  return res.json({
    success: true,
    requests: Array.isArray(stored) ? stored : [],
    suspendedInstitutions: suspended.map((tenant) => toPublicTenantDTO(tenant)),
    membershipRequests: tenancyRequests.map((membership) => ({
      id: membership.id,
      type: 'membership',
      status: membership.status,
      role: membership.role,
      tenant: toPublicTenantDTO(membership.tenant),
      user: toUserDTO(membership.user)
    }))
  });
});

const actionCollegeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const decision = String(req.body.decision || req.body.status || 'Approved');
  const reason = req.body.reason || '';

  let stored = await getJson('college_requests', []);
  if (!Array.isArray(stored) || !stored.length) {
    stored = [...INITIAL_COLLEGE_REQUESTS];
  }

  const target = stored.find((item) => item.id === id);
  if (!target) throw httpError(404, 'Onboarding request not found.');

  target.status = decision;
  target.decisionReason = reason;
  target.actionedAt = new Date().toISOString();
  target.actionedBy = req.user?.email || 'IT Administrator';

  await setJson('college_requests', stored);

  return res.json({
    success: true,
    message: `Institution onboarding request ${decision.toLowerCase()}.`,
    request: target
  });
});

const managerRequests = asyncHandler(async (req, res) => {
  const stored = await getJson('manager_requests', []);
  const managers = await prisma.user.findMany({
    where: { role: { in: ['it_user', 'amylearn_manager'] } },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({
    success: true,
    requests: Array.isArray(stored) ? stored : [],
    managers: managers.map((user) => toUserDTO(user))
  });
});

const listAuditLogs = asyncHandler(async (req, res) => {
  const stored = await getJson('platform_audit_logs', []);
  const initialLogs = [
    { id: 'aud-1', at: '2026-10-27T10:14:00.000Z', action: 'tenant.create', target: 'Northbridge University', detail: 'Tenant schema & root admin provisioned', actor: 'it_admin@amylearn.app' },
    { id: 'aud-2', at: '2026-10-27T08:30:00.000Z', action: 'feature.toggle', target: 'ai_tutor', detail: 'Enabled AI tutor for tier-1 tenants', actor: 'platform_lead@amylearn.app' },
    { id: 'aud-3', at: '2026-10-26T16:45:00.000Z', action: 'role.assign', target: 'college_admin', detail: 'Assigned COE & Registrar permissions', actor: 'it_admin@amylearn.app' },
    { id: 'aud-4', at: '2026-10-26T14:20:00.000Z', action: 'ticket.update', target: 'TCK-1092', detail: 'Resolved LDAP sync latency issue', actor: 'it_support@amylearn.app' },
    { id: 'aud-5', at: '2026-10-25T11:00:00.000Z', action: 'billing.invoice', target: 'Northbridge University', detail: 'Generated semester enterprise invoice INV-2026-001', actor: 'billing_daemon' }
  ];
  const list = Array.isArray(stored) && stored.length ? stored : initialLogs;
  return res.json({ success: true, count: list.length, events: list });
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
const listUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = paginate(req.query);
  const where = {};
  if (req.query.role) {
    const canonical = normalizeRole(req.query.role);
    where.role = canonical === 'it_admin' ? { in: ['it_admin', 'amylearn_admin'] } : canonical === 'it_user' ? { in: ['it_user', 'amylearn_manager'] } : canonical;
  }
  if (req.query.tenantId) {
    where.memberships = { some: { tenantId: String(req.query.tenantId) } };
  }
  if (req.query.search) {
    const search = String(req.query.search).trim();
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { amylearnId: { contains: search } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        memberships: { include: { tenant: true } },
        studentProfiles: true,
        facultyProfiles: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return res.json({
    success: true,
    page,
    pageSize,
    total,
    users: users.map((user) =>
      toUserDTO(user, {
        extra: {
          memberships: (user.memberships || []).map((membership) => ({
            tenant: toPublicTenantDTO(membership.tenant),
            role: membership.role,
            status: membership.status
          }))
        }
      })
    )
  });
});

// ---------------------------------------------------------------------------
// Menu configuration
// ---------------------------------------------------------------------------
const getMenuConfig = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.tenantId);
  const overrides = normalizeMenuOverrides(await getTenantJson('tenant_menu_overrides', tenant.id, {}));
  return res.json({
    success: true,
    tenant: toPublicTenantDTO(tenant),
    overrides,
    menus: {
      student: getMenuForRole('student', overrides),
      faculty: getMenuForRole('faculty', overrides),
      college_admin: getMenuForRole('college_admin', overrides)
    }
  });
});

const saveMenuConfig = asyncHandler(async (req, res) => {
  const tenantId = req.body.tenantId || req.body.collegeId;
  if (!tenantId) throw httpError(400, 'tenantId is required.');
  const tenant = await findTenantOr404(tenantId);
  const input = req.body.overrides || req.body.menuConfig || req.body;
  const normalized = normalizeMenuOverrides(input);
  await setTenantJson('tenant_menu_overrides', tenant.id, normalized);
  return res.json({
    success: true,
    message: 'Menu configuration saved.',
    tenant: toPublicTenantDTO(tenant),
    overrides: normalized
  });
});

// ---------------------------------------------------------------------------
// College admins
// ---------------------------------------------------------------------------
const listCollegeAdmins = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const memberships = await prisma.membership.findMany({
    where: { tenantId: tenant.id, role: 'college_admin' },
    include: { user: true },
    orderBy: { joinedAt: 'asc' }
  });
  const assignments = await getTenantJson('admin_role_assignments', tenant.id, {});
  return res.json({
    success: true,
    tenant: toPublicTenantDTO(tenant),
    admins: memberships.map((membership) => ({
      ...toUserDTO(membership.user, { role: membership.role, membership, tenant }),
      adminRoles: Array.isArray(assignments[membership.userId]) ? assignments[membership.userId] : []
    }))
  });
});

const addCollegeAdmin = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) throw httpError(400, 'Admin email is required.');

  let user = await prisma.user.findUnique({ where: { email } });
  let temporaryPassword = null;

  if (!user) {
    if (!req.body.password && !req.body.name) {
      throw httpError(400, 'Provide a name to create a new administrator.');
    }
    temporaryPassword = req.body.password || `AmyLearn@${Math.random().toString(36).slice(2, 10)}`;
    const hashed = await bcrypt.hash(String(temporaryPassword), 10);
    user = await prisma.user.create({
      data: {
        email,
        name: String(req.body.name || email.split('@')[0]).trim(),
        password: hashed,
        role: 'college_admin',
        department: 'Administration',
        college: tenant.name,
        emailVerified: true
      }
    });
  }

  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    update: { role: 'college_admin', status: 'active' },
    create: { userId: user.id, tenantId: tenant.id, role: 'college_admin', status: 'active' }
  });

  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: { tenantId: tenant.id },
    create: { userId: user.id, tenantId: tenant.id }
  });

  return res.status(201).json({
    success: true,
    message: temporaryPassword ? 'Administrator created.' : 'Administrator linked to this institution.',
    temporaryPassword,
    user: toUserDTO(user, { role: 'college_admin', tenant })
  });
});

const updateCollegeAdmin = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: req.params.userId, tenantId: tenant.id } }
  });
  if (!membership) throw httpError(404, 'This user is not a member of the institution.');

  const status = req.body.status ? String(req.body.status).toLowerCase() : null;
  if (status && !['active', 'suspended'].includes(status)) {
    throw httpError(400, 'Status must be active or suspended.');
  }
  if (req.body.adminRoles && Array.isArray(req.body.adminRoles)) {
    const assignments = await getTenantJson('admin_role_assignments', tenant.id, {});
    const next = { ...(assignments && typeof assignments === 'object' ? assignments : {}) };
    next[req.params.userId] = req.body.adminRoles.map((role) => String(role).trim()).filter(Boolean);
    await setTenantJson('admin_role_assignments', tenant.id, next);
  }

  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { ...(status ? { status } : {}) },
    include: { user: true }
  });

  return res.json({
    success: true,
    message: 'Administrator updated.',
    user: toUserDTO(updated.user, { role: updated.role, membership: updated, tenant })
  });
});

const deleteCollegeAdmin = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: req.params.userId, tenantId: tenant.id } }
  });
  if (!membership) throw httpError(404, 'This user is not a member of the institution.');

  await prisma.membership.delete({ where: { id: membership.id } });
  const remaining = await prisma.membership.count({ where: { userId: req.params.userId } });
  if (remaining === 0 && normalizeRole(membership.role) === 'college_admin') {
    await prisma.adminProfile.deleteMany({ where: { userId: req.params.userId } });
  }
  return res.json({ success: true, message: 'Administrator access removed.' });
});

// ---------------------------------------------------------------------------
// Global roles
// ---------------------------------------------------------------------------
const listGlobalRoles = asyncHandler(async (req, res) => {
  const stored = await getJson('global_roles', null);
  const roles = Array.isArray(stored) && stored.length ? stored : DEFAULT_ADMIN_ROLE_CATALOGUE;
  return res.json({ success: true, roles });
});

const createGlobalRole = asyncHandler(async (req, res) => {
  const definition = sanitizeRoleDefinition(req.body);
  const stored = await getJson('global_roles', null);
  const roles = Array.isArray(stored) && stored.length ? [...stored] : [...DEFAULT_ADMIN_ROLE_CATALOGUE];
  if (roles.some((role) => role.key === definition.key)) {
    throw httpError(409, 'A global role with this key already exists.');
  }
  roles.push(definition);
  await setJson('global_roles', roles);
  return res.status(201).json({ success: true, message: 'Global role created.', role: definition });
});

const updateGlobalRole = asyncHandler(async (req, res) => {
  const stored = await getJson('global_roles', null);
  const roles = Array.isArray(stored) && stored.length ? [...stored] : [...DEFAULT_ADMIN_ROLE_CATALOGUE];
  const index = roles.findIndex((role) => role.key === req.params.key);
  if (index === -1) throw httpError(404, 'Global role not found.');
  const definition = sanitizeRoleDefinition({ ...roles[index], ...req.body, key: req.params.key });
  roles[index] = definition;
  await setJson('global_roles', roles);
  return res.json({ success: true, message: 'Global role updated.', role: definition });
});

const deleteGlobalRole = asyncHandler(async (req, res) => {
  const stored = await getJson('global_roles', null);
  const roles = Array.isArray(stored) && stored.length ? [...stored] : [...DEFAULT_ADMIN_ROLE_CATALOGUE];
  const next = roles.filter((role) => role.key !== req.params.key);
  if (next.length === roles.length) throw httpError(404, 'Global role not found.');
  await setJson('global_roles', next);
  return res.json({ success: true, message: 'Global role deleted.' });
});

// ---------------------------------------------------------------------------
// Per-tenant custom roles
// ---------------------------------------------------------------------------
const listCustomRoles = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const roles = await getTenantJson('custom_roles', tenant.id, []);
  return res.json({ success: true, tenant: toPublicTenantDTO(tenant), roles: Array.isArray(roles) ? roles : [] });
});

const createCustomRole = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const definition = sanitizeRoleDefinition(req.body);
  const roles = await getTenantJson('custom_roles', tenant.id, []);
  const list = Array.isArray(roles) ? [...roles] : [];
  if (list.some((role) => role.key === definition.key)) {
    throw httpError(409, 'A custom role with this key already exists for the institution.');
  }
  list.push(definition);
  await setTenantJson('custom_roles', tenant.id, list);
  return res.status(201).json({ success: true, message: 'Custom role created.', role: definition });
});

const updateCustomRoleLabel = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const roles = await getTenantJson('custom_roles', tenant.id, []);
  const list = Array.isArray(roles) ? [...roles] : [];
  const index = list.findIndex((role) => role.key === req.params.roleKey);
  if (index === -1) throw httpError(404, 'Custom role not found.');
  const label = String(req.body.label || req.body.title || '').trim();
  if (!label) throw httpError(400, 'A label is required.');
  list[index] = { ...list[index], label: label.slice(0, 120) };
  await setTenantJson('custom_roles', tenant.id, list);
  return res.json({ success: true, message: 'Custom role label updated.', role: list[index] });
});

const deleteCustomRole = asyncHandler(async (req, res) => {
  const tenant = await findTenantOr404(req.params.id);
  const roles = await getTenantJson('custom_roles', tenant.id, []);
  const list = Array.isArray(roles) ? roles : [];
  const next = list.filter((role) => role.key !== req.params.roleKey);
  if (next.length === list.length) throw httpError(404, 'Custom role not found.');
  await setTenantJson('custom_roles', tenant.id, next);

  const assignments = await getTenantJson('admin_role_assignments', tenant.id, {});
  if (assignments && typeof assignments === 'object') {
    const pruned = {};
    Object.entries(assignments).forEach(([userId, keys]) => {
      const remaining = Array.isArray(keys) ? keys.filter((key) => key !== req.params.roleKey) : [];
      if (remaining.length) pruned[userId] = remaining;
    });
    await setTenantJson('admin_role_assignments', tenant.id, pruned);
  }

  return res.json({ success: true, message: 'Custom role deleted.' });
});

module.exports = {
  publicColleges,
  login,
  signout,
  listColleges,
  createCollege,
  updateCollegeStatus,
  updateCollege,
  deleteCollege,
  tenantsList,
  collegeRequests,
  actionCollegeRequest,
  managerRequests,
  listAuditLogs,
  listUsers,
  getMenuConfig,
  saveMenuConfig,
  listCollegeAdmins,
  addCollegeAdmin,
  updateCollegeAdmin,
  deleteCollegeAdmin,
  listGlobalRoles,
  createGlobalRole,
  updateGlobalRole,
  deleteGlobalRole,
  listCustomRoles,
  createCustomRole,
  updateCustomRoleLabel,
  deleteCustomRole,
  findTenantOr404
};
