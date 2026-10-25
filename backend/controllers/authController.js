'use strict';

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { signToken, decodeToken } = require('../middleware/authMiddleware');
const {
  normalizeRole,
  isPlatformRole,
  toFrontendRole,
  roleConfigFor,
  ROLE_CONFIG
} = require('../config/systemRoles');
const { toUserDTO, toPublicTenantDTO } = require('../utils/userDTO');
const { asyncHandler, httpError, isEmail } = require('../utils/apiHelpers');
const { randomCode } = require('../utils/crypto');
const { nextSequence } = require('../utils/systemConfig');
const { revokeToken } = require('../utils/tokenBlacklist');
const emailService = require('../services/emailService');

const PLATFORM_SIGNUP_ROLES = ['it_admin', 'it_user', 'amylearn_admin', 'amylearn_manager'];
const CAMPUS_SIGNUP_ROLES = ['student', 'faculty', 'college_admin'];

function adminRoleKeys(role) {
  if (role === 'it_admin' || role === 'amylearn_admin') return ['platform_admin'];
  if (role === 'it_user' || role === 'amylearn_manager') return ['platform_manager'];
  return [];
}

async function findTenantByCodeOrId(value) {
  if (!value) return null;
  const ref = String(value).trim();
  return prisma.tenant.findFirst({
    where: {
      OR: [
        { id: ref },
        { collegeCode: ref.toUpperCase() },
        { collegeCode: ref },
        { subdomain: ref.toLowerCase() },
        { name: ref }
      ]
    }
  });
}

async function buildAmylearnId(role, tenant, preferred) {
  if (preferred && String(preferred).trim()) {
    const exists = await prisma.user.findFirst({ where: { amylearnId: String(preferred).trim() } });
    if (!exists) return String(preferred).trim();
  }
  const prefix = tenant && tenant.collegeCode ? `${tenant.collegeCode}-` : '';
  const rolePrefix = (roleConfigFor(role) && roleConfigFor(role).idPrefix) || 'USR';
  const seq = await nextSequence(`amylearn_id:${role}`, 1);
  return `${prefix}${rolePrefix}-${String(seq).padStart(4, '0')}`;
}

async function createRoleProfile(userId, tenantId, role) {
  const canonical = normalizeRole(role);
  if (canonical === 'student' && tenantId) {
    return prisma.studentProfile.create({ data: { userId, tenantId } });
  }
  if (canonical === 'faculty' && tenantId) {
    return prisma.facultyProfile.create({ data: { userId, tenantId } });
  }
  if (canonical === 'college_admin' && tenantId) {
    return prisma.adminProfile.create({ data: { userId, tenantId } });
  }
  if (canonical === 'it_admin') {
    return prisma.iTAdminProfile.create({ data: { userId } });
  }
  if (canonical === 'it_user') {
    return prisma.iTUserProfile.create({ data: { userId } });
  }
  return null;
}

function tokenPayloadFor(user, tenantId, role) {
  return {
    userId: user.id,
    tenantId: tenantId || null,
    role: normalizeRole(role) || normalizeRole(user.role),
    email: user.email,
    name: user.name,
    frontendRole: toFrontendRole(role || user.role),
    pwdChangedAt: user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : 0
  };
}

function attachSessionCookie(res, token) {
  try {
    res.cookie('sessionToken', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
  } catch (error) {
    /* cookie support is optional */
  }
}

async function findUserByIdentifier(identifier) {
  const value = String(identifier || '').trim();
  if (!value) return null;
  const candidates = [value, value.toLowerCase(), value.toUpperCase()];
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: { in: candidates } },
        { amylearnId: { in: candidates } },
        { studentProfiles: { some: { rollNumber: { in: candidates } } } }
      ]
    },
    include: {
      memberships: { include: { tenant: true } },
      studentProfiles: true,
      facultyProfiles: true,
      adminProfiles: true,
      itUserProfiles: true,
      itAdminProfiles: true
    }
  });
}

async function resolveSignupTenant(body) {
  const ref = body.tenantId || body.collegeCode;
  if (!ref) return null;
  const tenant = await findTenantByCodeOrId(ref);
  if (!tenant) throw httpError(404, 'Institution not found. Check the college code.');
  if (tenant.status !== 'active') throw httpError(403, 'This institution is not accepting registrations right now.');
  return tenant;
}

// ---------------------------------------------------------------------------
// POST /api/auth/check-email
// ---------------------------------------------------------------------------
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isEmail(email)) throw httpError(400, 'Enter a valid email address.');
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
    include: { memberships: { include: { tenant: true } } }
  });

  if (!user) {
    return res.json({ success: true, exists: false, available: true });
  }

  return res.json({
    success: true,
    exists: true,
    available: false,
    email: user.email,
    role: user.role,
    frontendRole: toFrontendRole(user.role),
    colleges: (user.memberships || [])
      .filter((membership) => membership.status === 'active' && membership.tenant)
      .map((membership) => ({
        id: membership.tenant.id,
        name: membership.tenant.name,
        collegeCode: membership.tenant.collegeCode,
        role: membership.role
      }))
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/send-verification
// ---------------------------------------------------------------------------
const sendVerification = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();
  const code = randomCode(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerification.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt }
  });

  const result = await emailService.sendEmail(email, code, { name: req.body.name });
  if (!result.success) {
    if (process.env.NODE_ENV === 'production') {
      throw httpError(502, 'We could not send the verification email. Please try again shortly.');
    }
    // eslint-disable-next-line no-console
    console.warn(`[auth] Verification email could not be sent; development code for ${email}: ${code}`);
  }

  const payload = {
    success: true,
    message: 'Verification code sent. It expires in 10 minutes.',
    expiresAt: expiresAt.toISOString(),
    emailSent: Boolean(result.success && !result.simulated)
  };

  if ((result.simulated || !result.success) && process.env.NODE_ENV !== 'production') {
    payload.devCode = code;
  }

  return res.json(payload);
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// ---------------------------------------------------------------------------
const verifyEmail = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();
  const code = String(req.body.code).trim();

  const record = await prisma.emailVerification.findUnique({ where: { email } });
  if (!record) {
    throw httpError(400, 'No verification request found for this email. Request a new code.');
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await prisma.emailVerification.delete({ where: { email } }).catch(() => {});
    throw httpError(400, 'This verification code has expired. Request a new one.');
  }
  if (record.code !== code) {
    throw httpError(400, 'That verification code is incorrect.');
  }

  await prisma.emailVerification.delete({ where: { email } });
  return res.json({ success: true, verified: true, message: 'Email verified. You can continue with sign-up.' });
});

// ---------------------------------------------------------------------------
// POST /api/auth/role-signup
// ---------------------------------------------------------------------------
const roleSignup = asyncHandler(async (req, res) => {
  const body = req.body;
  const email = String(body.email).trim().toLowerCase();
  const role = normalizeRole(body.role || 'student');

  const allowed = [...PLATFORM_SIGNUP_ROLES.map(normalizeRole), ...CAMPUS_SIGNUP_ROLES];
  if (!allowed.includes(role)) {
    throw httpError(400, 'Choose a supported account type.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw httpError(409, 'An account with this email already exists. Sign in instead.');

  const platformRole = PLATFORM_SIGNUP_ROLES.map(normalizeRole).includes(role);
  const tenant = platformRole ? null : await resolveSignupTenant(body);
  if (!platformRole && !tenant) {
    throw httpError(400, 'Select your institution (college code) to create a campus account.');
  }

  const passwordHash = await bcrypt.hash(String(body.password), 10);
  const amylearnId = await buildAmylearnId(role, tenant, role === 'student' ? body.rollNumber : null);
  const department =
    body.department ||
    (roleConfigFor(role) && roleConfigFor(role).defaultDepartment) ||
    'General';

  const user = await prisma.user.create({
    data: {
      email,
      name: String(body.name).trim(),
      password: passwordHash,
      role,
      amylearnId,
      department,
      college: tenant ? tenant.name : null,
      emailVerified: true
    }
  });

  try {
    if (tenant) {
      await prisma.membership.create({
        data: { userId: user.id, tenantId: tenant.id, role, status: 'active' }
      });
    }
    if (role === 'student' && tenant) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          rollNumber: body.rollNumber ? String(body.rollNumber).trim() : amylearnId
        }
      });
    } else if (role === 'faculty' && tenant) {
      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          employeeId: body.employeeId ? String(body.employeeId).trim() : amylearnId,
          designation: body.designation || 'Assistant Professor'
        }
      });
    } else if (role === 'college_admin' && tenant) {
      await prisma.adminProfile.create({ data: { userId: user.id, tenantId: tenant.id } });
    } else if (role === 'it_admin') {
      await prisma.iTAdminProfile.create({ data: { userId: user.id } });
    } else if (role === 'it_user') {
      await prisma.iTUserProfile.create({ data: { userId: user.id } });
    }
  } catch (error) {
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    throw error;
  }

  const membership = tenant
    ? await prisma.membership.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } }
      })
    : null;

  const token = signToken(tokenPayloadFor(user, tenant ? tenant.id : null, role));
  attachSessionCookie(res, token);

  const hydrated = await prisma.user.findUnique({
    where: { id: user.id },
    include: { studentProfiles: true, facultyProfiles: true, memberships: { include: { tenant: true } } }
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: toUserDTO(hydrated, { role, tenant, membership }),
    tenant: toPublicTenantDTO(tenant),
    role: toFrontendRole(role)
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/signin
// ---------------------------------------------------------------------------
const signin = asyncHandler(async (req, res) => {
  const identifier = req.body.email || req.body.identifier || req.body.rollNumber;
  const requestedRole = req.body.role ? normalizeRole(req.body.role) : null;
  const tenantRef = req.body.collegeCode || req.body.tenantId || req.headers['x-tenant-id'];

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    // Equalise response timing with the bcrypt path so account enumeration
    // through latency is not possible.
    await bcrypt.compare(String(req.body.password), '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
    throw httpError(401, 'Invalid credentials. Check your email/roll number and password.');
  }

  const passwordOk = await bcrypt.compare(String(req.body.password), user.password);
  if (!passwordOk) throw httpError(401, 'Invalid credentials. Check your email/roll number and password.');

  const memberships = (user.memberships || []).filter((membership) => membership.status === 'active');
  const platform = isPlatformRole(user.role);

  if (requestedRole && PLATFORM_SIGNUP_ROLES.map(normalizeRole).includes(requestedRole) && !platform) {
    throw httpError(403, 'This account is not a platform account. Use the campus portal to sign in.');
  }
  if (requestedRole && isPlatformRole(requestedRole) && !platform) {
    throw httpError(403, 'This account does not have platform access.');
  }

  let tenant = null;
  let membership = null;

  if (tenantRef) {
    tenant = await findTenantByCodeOrId(tenantRef);
    if (!tenant) throw httpError(404, 'Institution not found. Check the selected college.');
    if (tenant.status !== 'active') throw httpError(403, 'This institution is currently suspended.');
    membership = memberships.find((entry) => entry.tenantId === tenant.id) || null;
    if (!membership && !platform) {
      throw httpError(403, 'You do not have an active membership at this institution.');
    }
  } else if (!platform) {
    membership = memberships[0] || null;
    if (!membership) throw httpError(403, 'Your membership is not active. Contact your institution administrator.');
    tenant = membership.tenant;
  }

  if (membership && requestedRole) {
    const membershipRole = normalizeRole(membership.role);
    const campusRequest = CAMPUS_SIGNUP_ROLES.includes(requestedRole);
    if (campusRequest && membershipRole !== requestedRole && membershipRole !== 'college_admin') {
      throw httpError(403, 'This account is not registered with the selected portal role.');
    }
  }

  const effectiveRole = membership ? normalizeRole(membership.role) : normalizeRole(user.role);
  const token = signToken(tokenPayloadFor(user, tenant ? tenant.id : null, effectiveRole));
  attachSessionCookie(res, token);

  return res.json({
    success: true,
    token,
    user: toUserDTO(user, {
      role: effectiveRole,
      tenant,
      membership,
      adminRoles: adminRoleKeys(effectiveRole)
    }),
    tenant: toPublicTenantDTO(tenant),
    role: toFrontendRole(effectiveRole)
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/signout
// ---------------------------------------------------------------------------
const signout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const rawToken =
    (header.match(/^Bearer\s+(.+)$/i) || [])[1] ||
    req.headers['x-user-token'] ||
    (req.cookies && req.cookies.sessionToken) ||
    null;

  if (rawToken) {
    let expiresAt = null;
    try {
      const payload = decodeToken(rawToken);
      expiresAt = payload && payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await revokeToken(rawToken, expiresAt);
  }

  try {
    res.clearCookie('sessionToken', { path: '/' });
  } catch (error) {
    /* optional */
  }

  return res.json({ success: true, message: 'Signed out successfully.' });
});

// ---------------------------------------------------------------------------
// GET /api/auth/verify-token (setTenantContext applied at the route level)
// ---------------------------------------------------------------------------
const verifyTokenHandler = asyncHandler(async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: req.user.id, status: 'active' },
    include: { tenant: true }
  });
  const hydrated = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { studentProfiles: true, facultyProfiles: true }
  });

  return res.json({
    success: true,
    valid: true,
    user: toUserDTO(hydrated, {
      role: req.role,
      tenant: req.tenant,
      membership: req.membership,
      adminRoles: req.adminRoles
    }),
    tenant: toPublicTenantDTO(req.tenant),
    role: req.frontendRole,
    isSuperAdmin: Boolean(req.isSuperAdmin),
    memberships: memberships.map((membership) => ({
      tenant: toPublicTenantDTO(membership.tenant),
      role: membership.role,
      status: membership.status
    }))
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/public/colleges
// ---------------------------------------------------------------------------
const publicColleges = asyncHandler(async (req, res) => {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'active' },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      type: true,
      subdomain: true,
      logoUrl: true,
      collegeCode: true,
      location: true,
      category: true,
      featured: true,
      status: true
    }
  });
  return res.json({
    success: true,
    count: tenants.length,
    colleges: tenants.map((tenant) => toPublicTenantDTO(tenant))
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/auth/change-password
// ---------------------------------------------------------------------------
const changePassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw httpError(404, 'Account not found.');

  const ok = await bcrypt.compare(String(req.body.currentPassword), user.password);
  if (!ok) throw httpError(400, 'Your current password is incorrect.');
  if (String(req.body.currentPassword) === String(req.body.newPassword)) {
    throw httpError(400, 'Choose a password different from your current one.');
  }

  const hashed = await bcrypt.hash(String(req.body.newPassword), 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordChangedAt: new Date() }
  });
  return res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = {
  checkEmail,
  sendVerification,
  verifyEmail,
  roleSignup,
  signin,
  signout,
  verifyToken: verifyTokenHandler,
  publicColleges,
  changePassword,
  // exported helpers reused by the platform controller
  findUserByIdentifier,
  findTenantByCodeOrId,
  attachSessionCookie,
  tokenPayloadFor,
  adminRoleKeys,
  PLATFORM_SIGNUP_ROLES,
  CAMPUS_SIGNUP_ROLES
};
