'use strict';

const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError, numberOrZero, toNumber } = require('../utils/apiHelpers');
const {
  getTenantJson,
  setTenantJson,
  updateTenantJson
} = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const admitCardController = require('./admitCardController');

const FORMS_KEY = 'exam_forms';
const FEE_LEDGER_KEY = 'exam_fee_ledger';
const PUBLISH_KEY = 'exam_publish';
const ALLOCATION_KEY = 'exam_allocations';
const FEEDBACK_KEY = 'sem_feedback';
const SEMESTER_FEES_KEY = 'semester_fees';

const REGULAR_FEE_PER_PAPER = 500;
const BACKLOG_FEE_PER_PAPER = 700;
const BASE_FORM_FEE = 200;

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

function newId() {
  return crypto.randomUUID();
}

async function readForms(tenantId) {
  const forms = await getTenantJson(FORMS_KEY, tenantId, []);
  return Array.isArray(forms) ? forms : [];
}

async function writeForms(tenantId, forms) {
  await setTenantJson(FORMS_KEY, tenantId, forms);
  return forms;
}

async function readLedger(tenantId) {
  const ledger = await getTenantJson(FEE_LEDGER_KEY, tenantId, []);
  return Array.isArray(ledger) ? ledger : [];
}

async function writeLedger(tenantId, ledger) {
  await setTenantJson(FEE_LEDGER_KEY, tenantId, ledger);
  return ledger;
}

async function readAllocations(tenantId) {
  const allocations = await getTenantJson(ALLOCATION_KEY, tenantId, []);
  return Array.isArray(allocations) ? allocations : [];
}

async function readPublishState(tenantId) {
  const state = await getTenantJson(PUBLISH_KEY, tenantId, {});
  return state && typeof state === 'object' && !Array.isArray(state) ? state : {};
}

async function resolveStudent(tenantId, reference) {
  if (!reference) return null;
  const value = String(reference).trim();
  return prisma.user.findFirst({
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
}

async function studentContext(tenantId, student) {
  const profile = (student.studentProfiles || [])[0] || null;
  const department = profile && profile.departmentId
    ? await prisma.department.findFirst({ where: { id: profile.departmentId, tenantId } })
    : null;
  const stream = department
    ? await prisma.stream.findFirst({ where: { departmentId: department.id }, orderBy: { name: 'asc' } })
    : null;
  const batch = profile && profile.batchId
    ? await prisma.batch.findFirst({ where: { id: profile.batchId, tenantId } })
    : null;
  const curriculumType = (stream && stream.curriculumType) || 'Semester';
  const totalTerms = (stream && stream.totalTerms) || (curriculumType === 'Trimester' ? 12 : 8);
  const departmentId = department ? department.id : profile ? profile.departmentId : null;
  return { profile, department, stream, batch, curriculumType, totalTerms, departmentId };
}

function estimateTerm(batch, curriculumType, totalTerms, now = new Date()) {
  if (!batch || !batch.startYear) return 1;
  const years = Math.max(0, now.getFullYear() - Number(batch.startYear));
  const firstTermStart = 6; // July (0-indexed month)
  const inFirstTerm = now.getMonth() >= firstTermStart;
  let term;
  if (curriculumType === 'Trimester') {
    const monthIndex = now.getMonth();
    const trimesterSlot = monthIndex >= 6 ? monthIndex - 5 : monthIndex + 1;
    const withinYear = Math.min(3, Math.max(1, Math.ceil(trimesterSlot / 4)));
    term = years * 3 + (inFirstTerm ? withinYear : withinYear);
  } else {
    term = years * 2 + (inFirstTerm ? 1 : 2);
  }
  return Math.min(Math.max(term, 1), totalTerms);
}

async function subjectsForTerm(tenantId, departmentId, term) {
  if (!departmentId) return [];
  let subjects = await prisma.subject.findMany({
    where: { tenantId, departmentId, semester: term, isActive: true },
    orderBy: { code: 'asc' }
  });
  if (!subjects.length) {
    subjects = await prisma.subject.findMany({
      where: { tenantId, departmentId, semester: { lte: term }, isActive: true },
      orderBy: [{ semester: 'desc' }, { code: 'asc' }]
    });
    if (subjects.length) {
      const maxSemester = subjects[0].semester;
      subjects = subjects.filter((subject) => subject.semester === maxSemester);
    }
  }
  return subjects;
}

async function computeEligibility(tenantId, studentRef, options = {}) {
  const student = await resolveStudent(tenantId, studentRef);
  if (!student) throw httpError(404, 'Student not found in this institution.');

  const context = await studentContext(tenantId, student);
  const requestedTerm = options.semester ? Number(options.semester) : null;
  const term = requestedTerm || estimateTerm(context.batch, context.curriculumType, context.totalTerms);
  const regularSubjects = await subjectsForTerm(tenantId, context.departmentId, term);

  const results = await prisma.examResult.findMany({ where: { tenantId, studentId: student.id } });
  const failedIds = new Set(results.filter((result) => numberOrZero(result.marks) < 40).map((result) => result.subjectId));

  const failedSubjects = failedIds.size
    ? await prisma.subject.findMany({
        where: { tenantId, id: { in: Array.from(failedIds) } },
        orderBy: [{ semester: 'asc' }, { code: 'asc' }]
      })
    : [];

  const forms = await readForms(tenantId);
  const studentForms = forms.filter(
    (form) => form.studentId === student.id && form.status !== 'Reopened'
  );
  const publishedState = await readPublishState(tenantId);
  const hasPublishedResults = Object.values(publishedState).some((entry) => entry && entry.published);

  const reasons = [];
  if (!regularSubjects.length) reasons.push('No active subjects are configured for the current term.');
  if (student.memberships.length === 0) reasons.push('Your institutional membership is not active.');

  const feeInfo = {
    baseFee: BASE_FORM_FEE,
    regularFeePerPaper: REGULAR_FEE_PER_PAPER,
    backlogFeePerPaper: BACKLOG_FEE_PER_PAPER,
    regularTotal: BASE_FORM_FEE + regularSubjects.length * REGULAR_FEE_PER_PAPER,
    backlogTotal: BASE_FORM_FEE + failedSubjects.length * BACKLOG_FEE_PER_PAPER
  };

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      rollNumber: context.profile ? context.profile.rollNumber : student.amylearnId,
      department: context.department ? context.department.name : student.department,
      departmentId: context.departmentId,
      batch: context.batch ? context.batch.name : null
    },
    semester: term,
    curriculumType: context.curriculumType,
    totalTerms: context.totalTerms,
    regularPapers: regularSubjects,
    backlogPapers: failedSubjects,
    eligible: reasons.length === 0,
    eligibility: reasons.length === 0 ? 'Eligible' : 'Not Eligible',
    reasons,
    feeInfo,
    forms: studentForms,
    hasPublishedResults,
    existingForm: studentForms.find((form) => form.status === 'Submitted') || null
  };
}

// ---------------------------------------------------------------------------
// Exam sessions
// ---------------------------------------------------------------------------
const listSessions = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const sessions = await prisma.examSession.findMany({
    where: { tenantId: tenant.id },
    orderBy: { startDate: 'desc' }
  });
  const forms = await readForms(tenant.id);
  return res.json({
    success: true,
    count: sessions.length,
    sessions: sessions.map((session) => ({
      ...session,
      formCount: forms.filter((form) => form.sessionId === session.id).length
    }))
  });
});

const createSession = asyncHandler(async (req, res) => {
  if (!adminOf(req)) throw httpError(403, 'Only campus administrators can create exam sessions.');
  const tenant = tenantOf(req);
  if (!req.body.name || !req.body.startDate || !req.body.endDate) {
    throw httpError(400, 'name, startDate and endDate are required.');
  }
  const session = await prisma.examSession.create({
    data: {
      tenantId: tenant.id,
      name: String(req.body.name).trim(),
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      status: req.body.status || 'Upcoming'
    }
  });
  return res.status(201).json({ success: true, message: 'Exam session created.', session });
});

const updateSession = asyncHandler(async (req, res) => {
  if (!adminOf(req)) throw httpError(403, 'Only campus administrators can update exam sessions.');
  const tenant = tenantOf(req);
  const session = await prisma.examSession.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!session) throw httpError(404, 'Exam session not found.');
  const updated = await prisma.examSession.update({
    where: { id: session.id },
    data: {
      ...(req.body.name ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.startDate ? { startDate: new Date(req.body.startDate) } : {}),
      ...(req.body.endDate ? { endDate: new Date(req.body.endDate) } : {}),
      ...(req.body.status ? { status: req.body.status } : {})
    }
  });
  return res.json({ success: true, message: 'Exam session updated.', session: updated });
});

const activeSession = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const sessions = await prisma.examSession.findMany({
    where: { tenantId: tenant.id },
    orderBy: { startDate: 'asc' }
  });
  const active =
    sessions.find((session) => session.status === 'Active') ||
    sessions.find((session) => new Date(session.startDate) >= new Date()) ||
    sessions[sessions.length - 1] ||
    null;
  return res.json({ success: true, session: active, active: active && active.status === 'Active' });
});

// ---------------------------------------------------------------------------
// Eligibility & forms
// ---------------------------------------------------------------------------
const eligibility = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let reference = req.params.studentId;
  if (!staffOf(req)) {
    const self = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const isSelf = reference === req.user.id || (self && self.rollNumber === reference);
    if (!isSelf) throw httpError(403, 'You can only check your own eligibility.');
    reference = req.user.id;
  }
  const result = await computeEligibility(tenant.id, reference, { semester: req.query.semester });
  return res.json({ success: true, ...result });
});

async function normalizePapers(tenantId, paperIds, examType) {
  if (!Array.isArray(paperIds) || paperIds.length === 0) return [];
  const subjects = await prisma.subject.findMany({
    where: { tenantId, id: { in: paperIds.map(String) } }
  });
  if (subjects.length !== paperIds.length) {
    throw httpError(400, 'One or more selected papers do not belong to this institution.');
  }
  return subjects.map((subject) => ({
    subjectId: subject.id,
    code: subject.code,
    name: subject.name,
    semester: subject.semester,
    credits: subject.credits,
    examType
  }));
}

function computeExamFee(papers, type) {
  const perPaper = type === 'backlog' ? BACKLOG_FEE_PER_PAPER : REGULAR_FEE_PER_PAPER;
  return BASE_FORM_FEE + papers.length * perPaper;
}

async function submitExamForm(req, res) {
  const tenant = tenantOf(req);
  const body = req.body;
  const sessionId = body.sessionId;
  if (!sessionId) throw httpError(400, 'sessionId is required.');
  const session = await prisma.examSession.findFirst({ where: { id: String(sessionId), tenantId: tenant.id } });
  if (!session) throw httpError(404, 'Exam session not found in this institution.');
  if (session.status === 'Completed') throw httpError(400, 'This examination session is closed.');

  let studentReference = body.studentId || body.rollNumber;
  if (!staffOf(req)) studentReference = req.user.id;
  if (!studentReference) throw httpError(400, 'studentId is required.');

  const student = await resolveStudent(tenant.id, studentReference);
  if (!student) throw httpError(404, 'Student not found in this institution.');

  const type = String(body.type || 'regular').toLowerCase() === 'backlog' ? 'backlog' : 'regular';
  const context = await studentContext(tenant.id, student);
  const eligibilityData = await computeEligibility(tenant.id, student.id);
  const requestedPapers = body.papers || body.subjects || [];
  const paperIds = requestedPapers.length
    ? requestedPapers
    : (type === 'backlog' ? eligibilityData.backlogPapers : eligibilityData.regularPapers).map(
        (subject) => subject.id
      );

  if (!paperIds.length) throw httpError(400, 'No papers were selected for this form.');
  const papers = await normalizePapers(tenant.id, paperIds, type);

  const forms = await readForms(tenant.id);
  const duplicate = forms.find(
    (form) =>
      form.studentId === student.id &&
      form.sessionId === session.id &&
      !['Reopened', 'Rejected', 'Cancelled'].includes(String(form.status))
  );
  if (duplicate) {
    throw httpError(409, 'An examination form for this session has already been submitted.', {
      formId: duplicate.id,
      status: duplicate.status
    });
  }

  const feeAmount =
    body.feeAmount !== undefined && body.feeAmount !== null
      ? numberOrZero(body.feeAmount)
      : computeExamFee(papers, type);
  const now = new Date().toISOString();
  const form = {
    id: newId(),
    sessionId: session.id,
    sessionName: session.name,
    studentId: student.id,
    studentName: student.name,
    rollNumber: context.profile ? context.profile.rollNumber : student.amylearnId,
    departmentId: context.departmentId,
    batchId: context.batch ? context.batch.id : null,
    semester: eligibilityData.semester,
    type,
    papers,
    subjects: papers.map((paper) => paper.subjectId),
    feeAmount,
    paymentStatus: 'Pending',
    status: 'Submitted',
    paymentMode: body.paymentMode || null,
    transactionId: null,
    remarks: body.remarks || null,
    submittedAt: now,
    paidAt: null,
    createdAt: now,
    updatedAt: now
  };

  forms.push(form);
  await writeForms(tenant.id, forms);

  const ledgerEntry = {
    id: newId(),
    formId: form.id,
    sessionId: session.id,
    sessionName: session.name,
    studentId: student.id,
    studentName: student.name,
    rollNumber: form.rollNumber,
    amount: feeAmount,
    status: 'Pending',
    type: 'exam',
    description: `${session.name} examination fee (${papers.length} paper${papers.length === 1 ? '' : 's'})`,
    paymentMode: null,
    createdAt: now,
    updatedAt: now
  };
  const ledger = await readLedger(tenant.id);
  ledger.push(ledgerEntry);
  await writeLedger(tenant.id, ledger);

  return res.status(201).json({
    success: true,
    message: 'Exam form submitted. Complete the fee payment to download the admit card.',
    form,
    fee: { amount: feeAmount, status: 'Pending' },
    ledgerEntry
  });
}

const submitForm = asyncHandler(submitExamForm);

const myForms = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let reference = req.params.studentId;
  if (!staffOf(req)) {
    const self = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const isSelf = reference === req.user.id || (self && self.rollNumber === reference);
    if (!isSelf) throw httpError(403, 'You can only view your own examination forms.');
    reference = req.user.id;
  }
  const student = await resolveStudent(tenant.id, reference);
  if (!student) throw httpError(404, 'Student not found.');
  const forms = (await readForms(tenant.id))
    .filter((form) => form.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return res.json({ success: true, studentId: student.id, count: forms.length, forms });
});

const updateFormPayment = asyncHandler(async (req, res) => {
  if (!adminOf(req)) throw httpError(403, 'Only campus administrators can reconcile exam fee payments.');
  const tenant = tenantOf(req);
  const forms = await readForms(tenant.id);
  const form = forms.find((entry) => entry.id === req.params.id);
  if (!form) throw httpError(404, 'Exam form not found.');

  const requested = String(req.body.paymentStatus || req.body.status || 'Paid');
  const paid = ['paid', 'success', 'completed', 'true'].includes(requested.toLowerCase());
  const now = new Date().toISOString();
  form.paymentStatus = paid ? 'Paid' : 'Pending';
  form.paidAt = paid ? now : null;
  form.paymentMode = req.body.paymentMode || form.paymentMode || 'Offline';
  form.transactionId = req.body.transactionId || form.transactionId || null;
  form.status = form.status === 'Reopened' ? 'Submitted' : form.status;
  form.updatedAt = now;
  if (!paid) form.submittedAt = form.submittedAt || now;
  await writeForms(tenant.id, forms);

  const ledger = await readLedger(tenant.id);
  let entry = ledger.find((item) => item.formId === form.id);
  if (!entry) {
    entry = {
      id: newId(),
      formId: form.id,
      sessionId: form.sessionId,
      sessionName: form.sessionName,
      studentId: form.studentId,
      studentName: form.studentName,
      rollNumber: form.rollNumber,
      amount: form.feeAmount,
      type: 'exam',
      description: `${form.sessionName || 'Examination'} fee`,
      createdAt: now
    };
    ledger.push(entry);
  }
  entry.status = paid ? 'Paid' : 'Pending';
  entry.paymentMode = form.paymentMode;
  entry.transactionId = form.transactionId;
  entry.updatedAt = now;
  await writeLedger(tenant.id, ledger);

  return res.json({ success: true, message: paid ? 'Payment recorded.' : 'Payment marked pending.', form, ledgerEntry: entry });
});

const paymentHistory = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let reference = req.params.userId;
  if (!staffOf(req)) {
    const isSelf = reference === req.user.id;
    if (!isSelf) throw httpError(403, 'You can only view your own payment history.');
    reference = req.user.id;
  }
  const student = await resolveStudent(tenant.id, reference);
  if (!student) throw httpError(404, 'Student not found.');
  const ledger = (await readLedger(tenant.id))
    .filter((entry) => entry.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalPaid = ledger.filter((entry) => entry.status === 'Paid').reduce((sum, entry) => sum + numberOrZero(entry.amount), 0);
  const totalPending = ledger
    .filter((entry) => entry.status !== 'Paid' && entry.status !== 'Reversed')
    .reduce((sum, entry) => sum + numberOrZero(entry.amount), 0);
  return res.json({ success: true, studentId: student.id, entries: ledger, history: ledger, totalPaid, totalPending });
});

// ---------------------------------------------------------------------------
// Allocations
// ---------------------------------------------------------------------------
const allocationByStudent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const student = await resolveStudent(tenant.id, req.params.studentId);
  if (!student) throw httpError(404, 'Student not found.');
  if (!staffOf(req) && student.id !== req.user.id) {
    throw httpError(403, 'You can only view your own examination allocation.');
  }
  const profile = student.studentProfiles[0];
  const allocations = (await readAllocations(tenant.id)).filter(
    (allocation) =>
      (profile && allocation.batchId === profile.batchId) ||
      allocation.studentId === student.id
  );
  return res.json({ success: true, allocations, count: allocations.length });
});

const allocationByBatch = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const batch = await prisma.batch.findFirst({ where: { id: req.params.batchId, tenantId: tenant.id } });
  if (!batch) throw httpError(404, 'Batch not found.');
  const allocations = (await readAllocations(tenant.id)).filter((allocation) => allocation.batchId === batch.id);
  return res.json({ success: true, batch, allocations, count: allocations.length });
});

const saveAllocation = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only staff can allocate examination papers.');
  const tenant = tenantOf(req);
  const sessionId = req.body.sessionId;
  if (!sessionId) throw httpError(400, 'sessionId is required.');
  const session = await prisma.examSession.findFirst({ where: { id: sessionId, tenantId: tenant.id } });
  if (!session) throw httpError(404, 'Exam session not found.');

  const incoming = Array.isArray(req.body.allocations)
    ? req.body.allocations
    : Array.isArray(req.body.papers)
      ? req.body.papers
      : [req.body];
  if (!incoming.length) throw httpError(400, 'Provide at least one allocation.');

  const existing = await readAllocations(tenant.id);
  const batchId = req.body.batchId || (incoming[0] && incoming[0].batchId) || null;
  const kept = existing.filter(
    (allocation) => !(allocation.sessionId === session.id && allocation.batchId === batchId)
  );

  const created = [];
  for (const entry of incoming) {
    if (!entry.subjectId) throw httpError(400, 'Each allocation needs a subjectId.');
    const subject = await prisma.subject.findFirst({ where: { id: entry.subjectId, tenantId: tenant.id } });
    if (!subject) throw httpError(400, 'Allocated subject does not belong to this institution.');
    created.push({
      id: newId(),
      sessionId: session.id,
      sessionName: session.name,
      batchId: entry.batchId || batchId,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      date: entry.date ? new Date(entry.date).toISOString() : null,
      startTime: entry.startTime || null,
      endTime: entry.endTime || null,
      room: entry.room || null,
      seatNumber: entry.seatNumber || null,
      createdAt: new Date().toISOString()
    });
  }

  await setTenantJson(ALLOCATION_KEY, tenant.id, [...kept, ...created]);
  return res.json({ success: true, message: 'Examination allocation saved.', allocations: created });
});

// ---------------------------------------------------------------------------
// Marks & results
// ---------------------------------------------------------------------------
function gradeFor(marks) {
  const value = numberOrZero(marks);
  if (value >= 90) return 'O';
  if (value >= 80) return 'A+';
  if (value >= 70) return 'A';
  if (value >= 60) return 'B+';
  if (value >= 50) return 'B';
  if (value >= 40) return 'C';
  return 'F';
}

const uploadMarks = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can upload marks.');
  const tenant = tenantOf(req);
  const subjectId = req.body.subjectId;
  if (!subjectId) throw httpError(400, 'subjectId is required.');
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(404, 'Subject not found in this institution.');

  let marks = req.body.marks || req.body.records || req.body.results;
  if (!Array.isArray(marks) && typeof req.body.csv === 'string') {
    marks = req.body.csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [rollNumber, value] = line.split(/[,;\t]/);
        return { rollNumber: (rollNumber || '').trim(), marks: toNumber(value, 0) };
      });
  }
  if (!Array.isArray(marks) || !marks.length) {
    throw httpError(400, 'Provide a marks array or CSV content.');
  }

  const profileBatch = req.body.batchId || null;
  const saved = [];
  const skipped = [];
  for (const entry of marks) {
    const reference = entry.studentId || entry.rollNumber || entry.userId;
    if (!reference) {
      skipped.push({ entry, reason: 'Missing student reference' });
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    const student = await resolveStudent(tenant.id, reference);
    if (!student) {
      skipped.push({ reference, reason: 'Student not found' });
      continue;
    }
    const value = numberOrZero(entry.marks !== undefined ? entry.marks : entry.score);
    // eslint-disable-next-line no-await-in-loop
    await prisma.examResult.deleteMany({
      where: { tenantId: tenant.id, studentId: student.id, subjectId: subject.id }
    });
    // eslint-disable-next-line no-await-in-loop
    const result = await prisma.examResult.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        subjectId: subject.id,
        marks: value,
        grade: entry.grade || gradeFor(value)
      }
    });
    const profile = student.studentProfiles[0];
    saved.push({
      ...result,
      studentName: student.name,
      rollNumber: profile ? profile.rollNumber : student.amylearnId,
      batchId: profileBatch
    });
  }

  return res.json({
    success: true,
    message: `${saved.length} mark(s) uploaded.`,
    subject,
    count: saved.length,
    skipped,
    results: saved,
    marks: saved
  });
});

const publishResults = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only staff can publish results.');
  const tenant = tenantOf(req);
  const sessionId = req.body.sessionId;
  if (!sessionId) throw httpError(400, 'sessionId is required.');
  const session = await prisma.examSession.findFirst({ where: { id: sessionId, tenantId: tenant.id } });
  if (!session) throw httpError(404, 'Exam session not found.');

  const published = req.body.published === undefined ? true : Boolean(req.body.published);
  const state = await readPublishState(tenant.id);
  state[session.id] = {
    published,
    publishedAt: published ? new Date().toISOString() : null,
    publishedBy: published ? req.user.id : null,
    sessionName: session.name
  };
  await setTenantJson(PUBLISH_KEY, tenant.id, state);
  return res.json({
    success: true,
    message: published ? 'Results published to students.' : 'Results hidden from students.',
    sessionId: session.id,
    published
  });
});

async function resultsForStudent(tenantId, student) {
  const results = await prisma.examResult.findMany({
    where: { tenantId, studentId: student.id },
    orderBy: { createdAt: 'desc' }
  });
  const subjectIds = Array.from(new Set(results.map((result) => result.subjectId)));
  const subjects = subjectIds.length
    ? await prisma.subject.findMany({ where: { id: { in: subjectIds }, tenantId } })
    : [];
  const profile = student.studentProfiles ? student.studentProfiles[0] : null;

  const rows = results.map((result) => {
    const subject = subjects.find((entry) => entry.id === result.subjectId);
    return {
      id: result.id,
      subjectId: result.subjectId,
      subjectName: subject ? subject.name : 'Unknown subject',
      subjectCode: subject ? subject.code : null,
      semester: subject ? subject.semester : null,
      credits: subject ? subject.credits : null,
      marks: result.marks,
      grade: result.grade || gradeFor(result.marks),
      result: result.marks >= 40 ? 'Pass' : 'Fail',
      createdAt: result.createdAt
    };
  });

  const totalCredits = rows.reduce((sum, row) => sum + numberOrZero(row.credits), 0);
  const earnedCredits = rows
    .filter((row) => row.result === 'Pass')
    .reduce((sum, row) => sum + numberOrZero(row.credits), 0);
  const percentage = rows.length
    ? Number((rows.reduce((sum, row) => sum + numberOrZero(row.marks), 0) / rows.length).toFixed(2))
    : 0;

  return {
    student: {
      id: student.id,
      name: student.name,
      rollNumber: profile ? profile.rollNumber : student.amylearnId,
      email: student.email
    },
    results: rows,
    summary: {
      subjects: rows.length,
      totalCredits,
      earnedCredits,
      percentage,
      passed: rows.filter((row) => row.result === 'Pass').length,
      failed: rows.filter((row) => row.result === 'Fail').length
    }
  };
}

const resultsByRoll = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const student = await resolveStudent(tenant.id, req.params.rollNo);
  if (!student) throw httpError(404, 'No student matches this roll number.');
  if (!staffOf(req) && student.id !== req.user.id) {
    throw httpError(403, 'You can only view your own results.');
  }

  const state = await readPublishState(tenant.id);
  const published = staffOf(req) || Object.values(state).some((entry) => entry && entry.published);
  if (!published) {
    return res.json({
      success: true,
      published: false,
      message: 'Results for this session have not been published yet.',
      results: []
    });
  }
  const data = await resultsForStudent(tenant.id, student);
  return res.json({ success: true, published: true, ...data });
});

const myResults = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const student = await resolveStudent(tenant.id, req.user.id);
  if (!student) throw httpError(404, 'Student profile not found.');
  const state = await readPublishState(tenant.id);
  const published = Object.values(state).some((entry) => entry && entry.published);
  if (!published) {
    return res.json({
      success: true,
      published: false,
      message: 'Your results will appear once the examination committee publishes them.',
      results: []
    });
  }
  const data = await resultsForStudent(tenant.id, student);
  return res.json({ success: true, published: true, ...data });
});

const studentResults = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const student = await resolveStudent(tenant.id, req.params.userId);
  if (!student) throw httpError(404, 'Student not found.');
  if (!staffOf(req) && student.id !== req.user.id) {
    throw httpError(403, 'You can only view your own results.');
  }
  const data = await resultsForStudent(tenant.id, student);
  return res.json({ success: true, ...data });
});

// ---------------------------------------------------------------------------
// Admin views
// ---------------------------------------------------------------------------
const adminExamForms = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Staff access is required.');
  const tenant = tenantOf(req);
  let forms = await readForms(tenant.id);
  if (req.query.sessionId) forms = forms.filter((form) => form.sessionId === String(req.query.sessionId));
  if (req.query.status) {
    const status = String(req.query.status).toLowerCase();
    forms = forms.filter((form) => String(form.status).toLowerCase() === status);
  }
  if (req.query.paymentStatus) {
    const payment = String(req.query.paymentStatus).toLowerCase();
    forms = forms.filter((form) => String(form.paymentStatus).toLowerCase() === payment);
  }
  forms = forms.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalFees = forms.reduce((sum, form) => sum + numberOrZero(form.feeAmount), 0);
  const collected = forms
    .filter((form) => form.paymentStatus === 'Paid')
    .reduce((sum, form) => sum + numberOrZero(form.feeAmount), 0);
  return res.json({
    success: true,
    count: forms.length,
    summary: { totalFees, collected, pending: totalFees - collected },
    forms,
    examForms: forms
  });
});

const adminSemesterFees = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Staff access is required.');
  const tenant = tenantOf(req);
  const ledger = await readLedger(tenant.id);
  const configured = await getTenantJson(SEMESTER_FEES_KEY, tenant.id, {});
  const rows = ledger
    .filter((entry) => entry.type === 'exam' || entry.type === 'semester')
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalBilled = rows.reduce((sum, row) => sum + numberOrZero(row.amount), 0);
  const collected = rows.filter((row) => row.status === 'Paid').reduce((sum, row) => sum + numberOrZero(row.amount), 0);
  return res.json({
    success: true,
    semesterFees: configured && typeof configured === 'object' ? configured : {},
    summary: { totalBilled, collected, outstanding: totalBilled - collected, entries: rows.length },
    entries: rows,
    fees: rows
  });
});

const adminExamStatus = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Staff access is required.');
  const tenant = tenantOf(req);
  const [sessions, forms, ledger, results, state] = await Promise.all([
    prisma.examSession.findMany({ where: { tenantId: tenant.id }, orderBy: { startDate: 'desc' } }),
    readForms(tenant.id),
    readLedger(tenant.id),
    prisma.examResult.count({ where: { tenantId: tenant.id } }),
    readPublishState(tenant.id)
  ]);

  const perSession = sessions.map((session) => {
    const sessionForms = forms.filter((form) => form.sessionId === session.id);
    const paid = sessionForms.filter((form) => form.paymentStatus === 'Paid');
    return {
      sessionId: session.id,
      sessionName: session.name,
      status: session.status,
      forms: sessionForms.length,
      submitted: sessionForms.filter((form) => form.status === 'Submitted').length,
      paid: paid.length,
      pendingPayment: sessionForms.length - paid.length,
      revenue: paid.reduce((sum, form) => sum + numberOrZero(form.feeAmount), 0),
      resultsPublished: Boolean(state[session.id] && state[session.id].published)
    };
  });

  return res.json({
    success: true,
    status: perSession,
    totals: {
      sessions: sessions.length,
      forms: forms.length,
      paidForms: forms.filter((form) => form.paymentStatus === 'Paid').length,
      results,
      ledgerEntries: ledger.length
    }
  });
});

const resetForm = asyncHandler(async (req, res) => {
  if (!adminOf(req)) throw httpError(403, 'Only campus administrators can reopen examination forms.');
  const tenant = tenantOf(req);
  const forms = await readForms(tenant.id);
  const form = forms.find((entry) => entry.id === req.params.formId);
  if (!form) throw httpError(404, 'Exam form not found.');

  form.status = 'Reopened';
  form.paymentStatus = 'Pending';
  form.submittedAt = null;
  form.paidAt = null;
  form.updatedAt = new Date().toISOString();
  await writeForms(tenant.id, forms);

  const ledger = await readLedger(tenant.id);
  ledger.forEach((entry) => {
    if (entry.formId === form.id && entry.status === 'Paid') {
      entry.status = 'Reversed';
      entry.updatedAt = new Date().toISOString();
    }
  });
  await writeLedger(tenant.id, ledger);

  return res.json({ success: true, message: 'Exam form reopened for the student.', form });
});

// ---------------------------------------------------------------------------
// Semester feedback
// ---------------------------------------------------------------------------
const feedbackData = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const student = await resolveStudent(tenant.id, req.params.userId);
  if (!student) throw httpError(404, 'Student not found.');
  if (!staffOf(req) && student.id !== req.user.id) {
    throw httpError(403, 'You can only view your own feedback.');
  }

  const context = await studentContext(tenant.id, student);
  const term = estimateTerm(context.batch, context.curriculumType, context.totalTerms);
  const subjects = await subjectsForTerm(tenant.id, context.departmentId, term);
  const allFeedback = await getTenantJson(FEEDBACK_KEY, tenant.id, []);
  const existing = (Array.isArray(allFeedback) ? allFeedback : []).filter((entry) => entry.userId === student.id);

  return res.json({
    success: true,
    student: { id: student.id, name: student.name, semester: term },
    subjects,
    feedback: existing,
    submitted: existing.length > 0
  });
});

const submitFeedback = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let reference = req.body.userId;
  if (!staffOf(req)) reference = req.user.id;
  if (!reference) reference = req.user.id;
  const student = await resolveStudent(tenant.id, reference);
  if (!student) throw httpError(404, 'Student not found.');
  if (!staffOf(req) && student.id !== req.user.id) {
    throw httpError(403, 'You can only submit your own feedback.');
  }

  const responses = req.body.responses || req.body.feedback;
  if (!Array.isArray(responses) || !responses.length) {
    throw httpError(400, 'Provide feedback responses.');
  }
  const subjectIds = responses.map((response) => response.subjectId).filter(Boolean);
  const subjects = subjectIds.length
    ? await prisma.subject.findMany({ where: { tenantId: tenant.id, id: { in: subjectIds } } })
    : [];
  if (subjects.length !== subjectIds.length) {
    throw httpError(400, 'One or more feedback subjects are invalid.');
  }

  const entry = {
    id: newId(),
    userId: student.id,
    studentName: student.name,
    sessionId: req.body.sessionId || null,
    responses: responses.map((response) => ({
      subjectId: response.subjectId,
      subjectName: (subjects.find((subject) => subject.id === response.subjectId) || {}).name || null,
      rating: Math.min(5, Math.max(1, numberOrZero(response.rating))),
      comments: response.comments || ''
    })),
    submittedAt: new Date().toISOString()
  };

  const extra = req.body.extra && typeof req.body.extra === 'object' ? req.body.extra : {};
  Object.assign(entry, extra);

  await updateTenantJson(FEEDBACK_KEY, tenant.id, [], (current) => {
    const list = Array.isArray(current) ? current : [];
    return [...list.filter((item) => !(item.userId === student.id && item.sessionId === entry.sessionId)), entry];
  });

  return res.status(201).json({ success: true, message: 'Semester feedback submitted. Thank you!', feedback: entry });
});

// ---------------------------------------------------------------------------
// Question bank (delegated)
// ---------------------------------------------------------------------------
const questionBank = require('./questionBankController');

module.exports = {
  listSessions,
  createSession,
  updateSession,
  activeSession,
  eligibility,
  submitForm,
  myForms,
  updateFormPayment,
  paymentHistory,
  allocationByStudent,
  allocationByBatch,
  saveAllocation,
  uploadMarks,
  publishResults,
  resultsByRoll,
  myResults,
  studentResults,
  adminExamForms,
  adminSemesterFees,
  adminExamStatus,
  resetForm,
  feedbackData,
  submitFeedback,
  getAdmitCard: admitCardController.getAdmitCard,
  uploadQuestion: questionBank.uploadQuestion,
  listQuestions: questionBank.listQuestions,
  deleteQuestion: questionBank.deleteQuestion,
  // reused by the student dashboard controller
  computeEligibility,
  submitExamForm: submitExamForm,
  readForms,
  readLedger,
  readPublishState,
  resolveStudent,
  studentContext,
  estimateTerm,
  subjectsForTerm,
  gradeFor,
  resultsForStudent
};
