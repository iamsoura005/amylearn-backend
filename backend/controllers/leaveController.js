'use strict';

const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

const LEAVE_TYPES = ['Casual', 'Medical', 'Earned', 'Duty', 'Other'];

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function staffOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

function adminOf(req) {
  return req.isSuperAdmin || normalizeRole(req.role) === 'college_admin';
}

async function decorateApplications(rows) {
  if (!rows || !rows.length) return [];
  const approverIds = Array.from(new Set(rows.map((row) => row.approvedBy).filter(Boolean)));
  if (!approverIds.length) {
    return rows.map((application) => ({ ...application, approver: null }));
  }
  const approvers = await prisma.user.findMany({
    where: { id: { in: approverIds } },
    select: { id: true, name: true }
  });
  const approverMap = new Map(approvers.map((user) => [user.id, user]));
  return rows.map((application) => ({
    ...application,
    approver: application.approvedBy ? approverMap.get(application.approvedBy) || null : null
  }));
}

// ---------------------------------------------------------------------------
// POST /api/leave/apply
// ---------------------------------------------------------------------------
const apply = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw httpError(400, 'Valid startDate and endDate are required.');
  }
  if (endDate < startDate) throw httpError(400, 'End date cannot be before the start date.');
  if (!req.body.reason) throw httpError(400, 'reason is required.');

  let applicantId = req.body.userId || req.body.applicantId;
  if (!staffOf(req)) applicantId = req.user.id;
  if (!applicantId) applicantId = req.user.id;
  const applicant = await prisma.user.findFirst({
    where: {
      id: String(applicantId),
      memberships: { some: { tenantId: tenant.id } }
    }
  });
  if (!applicant) throw httpError(404, 'Applicant not found in this institution.');

  const type = LEAVE_TYPES.includes(String(req.body.type)) ? String(req.body.type) : 'Casual';

  const application = await prisma.leaveApplication.create({
    data: {
      tenantId: tenant.id,
      applicantId: applicant.id,
      type,
      startDate,
      endDate,
      reason: String(req.body.reason).trim(),
      status: 'Pending'
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Leave application submitted. It will be reviewed by the administration.',
    application
  });
});

// ---------------------------------------------------------------------------
// GET /api/leave/faculty
// ---------------------------------------------------------------------------
const faculty = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let where = { tenantId: tenant.id, applicant: { role: 'faculty' } };
  if (!adminOf(req)) where = { tenantId: tenant.id, applicantId: req.user.id };

  const applications = await prisma.leaveApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  const decorated = await decorateApplications(applications);
  return res.json({ success: true, count: applications.length, applications: decorated, leaves: decorated });
});

// ---------------------------------------------------------------------------
// GET /api/leave/history/:userId
// ---------------------------------------------------------------------------
const history = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const userId = req.params.userId || req.user.id;
  if (!staffOf(req) && userId !== req.user.id) {
    throw httpError(403, 'You can only view your own leave history.');
  }
  const applications = await prisma.leaveApplication.findMany({
    where: { tenantId: tenant.id, applicantId: userId },
    orderBy: { createdAt: 'desc' }
  });
  const decorated = await decorateApplications(applications);
  return res.json({ success: true, userId, count: applications.length, applications: decorated, history: decorated });
});

// ---------------------------------------------------------------------------
// GET /api/leave/admin/requests
// ---------------------------------------------------------------------------
const adminRequests = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Staff access is required.');
  const tenant = tenantOf(req);
  const where = { tenantId: tenant.id };
  if (req.query.status) where.status = String(req.query.status);

  const applications = await prisma.leaveApplication.findMany({
    where,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { applicant: { select: { id: true, name: true, email: true, amylearnId: true, role: true } } }
  });

  const pending = applications.filter((entry) => entry.status === 'Pending').length;
  const decorated = await decorateApplications(applications);
  return res.json({
    success: true,
    count: applications.length,
    pending,
    requests: decorated,
    applications: decorated
  });
});

// ---------------------------------------------------------------------------
// PUT /api/leave/admin/action/:id
// ---------------------------------------------------------------------------
const action = asyncHandler(async (req, res) => {
  if (!adminOf(req)) throw httpError(403, 'Only campus administrators can action leave requests.');
  const tenant = tenantOf(req);
  const application = await prisma.leaveApplication.findFirst({
    where: { id: req.params.id, tenantId: tenant.id }
  });
  if (!application) throw httpError(404, 'Leave application not found.');

  const status = String(req.body.status || 'Approved');
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    throw httpError(400, 'Status must be Approved, Rejected or Pending.');
  }

  const updated = await prisma.leaveApplication.update({
    where: { id: application.id },
    data: {
      status,
      approvedBy: status === 'Pending' ? null : req.user.id,
      actionedAt: status === 'Pending' ? null : new Date()
    }
  });

  return res.json({
    success: true,
    message: `Leave request ${status.toLowerCase()}.`,
    application: updated
  });
});

module.exports = { apply, faculty, history, adminRequests, action };
