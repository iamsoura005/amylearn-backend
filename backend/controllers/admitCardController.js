'use strict';

const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { getTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

const ADMIT_CARD_INSTRUCTION = 'Bring a valid college ID along with this admit card.';

const EXAM_INSTRUCTIONS = [
  ADMIT_CARD_INSTRUCTION,
  'Report to the examination hall at least 30 minutes before the scheduled start time.',
  'Mobile phones, smart watches and any programmable devices are not permitted inside the hall.',
  'Carry your own stationery; borrowing from other candidates is not allowed.',
  'The QR code on this admit card is unique and will be verified at the entry desk.',
  'Any malpractice will be reported to the examination committee for disciplinary action.'
];

async function resolveStudent(tenantId, reference) {
  if (!reference) return null;
  const value = String(reference).trim();
  const user = await prisma.user.findFirst({
    where: {
      memberships: { some: { tenantId, status: 'active', role: 'student' } },
      OR: [
        { id: value },
        { email: value.toLowerCase() },
        { amylearnId: value },
        { studentProfiles: { some: { rollNumber: value } } }
      ]
    },
    include: {
      studentProfiles: true,
      memberships: { where: { tenantId }, include: { tenant: true } }
    }
  });
  return user;
}

function departmentFor(user) {
  const profile = user.studentProfiles && user.studentProfiles[0];
  return profile ? profile.departmentId : null;
}

async function buildAdmitCardForStudent(tenantId, studentReference, options = {}) {
  const student = await resolveStudent(tenantId, studentReference);
  if (!student) throw httpError(404, 'Student not found in this institution.');

  const [forms, ledger, allocations, sessions] = await Promise.all([
    getTenantJson('exam_forms', tenantId, []),
    getTenantJson('exam_fee_ledger', tenantId, []),
    getTenantJson('exam_allocations', tenantId, []),
    prisma.examSession.findMany({ where: { tenantId }, orderBy: { startDate: 'desc' } })
  ]);

  const sessionId = options.sessionId || null;
  const myForms = (Array.isArray(forms) ? forms : []).filter(
    (form) =>
      form.studentId === student.id &&
      (form.status === 'Submitted' || form.status === 'Approved') &&
      (!sessionId || form.sessionId === sessionId)
  );

  if (!myForms.length) {
    throw httpError(400, 'No submitted examination form was found. Submit an exam form before downloading the admit card.');
  }

  const latest = myForms.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
  const session = sessions.find((entry) => entry.id === latest.sessionId) || null;

  const ledgerEntry = (Array.isArray(ledger) ? ledger : []).find(
    (entry) => entry.formId === latest.id && entry.status === 'Paid'
  );
  const paid = latest.paymentStatus === 'Paid' || Boolean(ledgerEntry);
  if (!paid) {
    throw httpError(402, 'The examination fee for this form is still pending. Admit cards are issued only after payment.');
  }

  const departmentId = departmentFor(student);
  const profile = student.studentProfiles[0];
  const [department, batch] = await Promise.all([
    departmentId ? prisma.department.findFirst({ where: { id: departmentId, tenantId } }) : null,
    profile && profile.batchId ? prisma.batch.findFirst({ where: { id: profile.batchId, tenantId } }) : null
  ]);

  const papers = (latest.papers || []).map((paper) => {
    const allocation = (Array.isArray(allocations) ? allocations : []).find(
      (entry) =>
        entry.sessionId === latest.sessionId &&
        entry.subjectId === paper.subjectId &&
        (!entry.batchId || !batch || entry.batchId === batch.id)
    );
    return {
      subjectId: paper.subjectId,
      code: paper.code || null,
      name: paper.name || paper.subjectName || 'Paper',
      semester: paper.semester || null,
      credits: paper.credits || null,
      examType: paper.examType || latest.type || 'Regular',
      date: allocation ? allocation.date : null,
      startTime: allocation ? allocation.startTime : null,
      endTime: allocation ? allocation.endTime : null,
      room: allocation ? allocation.room : null,
      seatNumber: allocation ? allocation.seatNumber || null : null
    };
  });

  const verificationSeed = [
    student.id,
    latest.id,
    latest.sessionId,
    (latest.papers || []).map((paper) => paper.subjectId).join(',')
  ].join('|');
  const verificationCode = crypto.createHash('sha256').update(verificationSeed).digest('hex').slice(0, 16).toUpperCase();

  const issuedAt = new Date().toISOString();
  const qrPayload = JSON.stringify({
    v: 1,
    type: 'amylearn-admit-card',
    institution: options.tenantName || null,
    student: student.name,
    rollNumber: profile ? profile.rollNumber : student.amylearnId,
    sessionId: latest.sessionId,
    sessionName: session ? session.name : latest.sessionName || null,
    formId: latest.id,
    papers: papers.map((paper) => ({ code: paper.code, date: paper.date, room: paper.room })),
    issuedAt,
    verificationCode
  });

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      rollNumber: profile ? profile.rollNumber : student.amylearnId,
      department: department ? department.name : student.department,
      departmentCode: department ? department.code : null,
      program: batch ? batch.name : null,
      batch: batch ? batch.name : null
    },
    session: session
      ? {
          id: session.id,
          name: session.name,
          startDate: session.startDate,
          endDate: session.endDate,
          status: session.status
        }
      : { id: latest.sessionId, name: latest.sessionName || 'Examination Session' },
    form: {
      id: latest.id,
      type: latest.type,
      status: latest.status,
      paymentStatus: 'Paid',
      feeAmount: latest.feeAmount,
      submittedAt: latest.submittedAt || latest.createdAt
    },
    papers,
    examCenter: options.examCenter || 'Northbridge University — Main Examination Hall',
    instructions: EXAM_INSTRUCTIONS,
    instruction: ADMIT_CARD_INSTRUCTION,
    qrPayload,
    barcodeValue: `${profile ? profile.rollNumber : student.amylearnId}-${latest.sessionId.slice(0, 8)}`,
    verificationCode,
    issuedAt
  };
}

function isStaff(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

// GET /api/coe/admit-card/:studentUserId
const getAdmitCard = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req);
  const tenant = requireTenant(req);
  const reference = req.params.studentUserId;

  if (!isStaff(req)) {
    const selfProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const isSelf = reference === req.user.id || (selfProfile && selfProfile.rollNumber === reference);
    if (!isSelf) throw httpError(403, 'You can only download your own admit card.');
  }

  const admitCard = await buildAdmitCardForStudent(tenant.id, reference, {
    sessionId: req.query.sessionId ? String(req.query.sessionId) : null,
    tenantName: tenant.name,
    examCenter: req.query.examCenter ? String(req.query.examCenter) : null
  });

  return res.json({ success: true, admitCard });
});

module.exports = {
  ADMIT_CARD_INSTRUCTION,
  EXAM_INSTRUCTIONS,
  resolveStudent,
  buildAdmitCardForStudent,
  getAdmitCard,
  isStaff
};
