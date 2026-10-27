'use strict';

const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError, numberOrZero, addDays, daysBetween } = require('../utils/apiHelpers');
const { getTenantJson, setTenantJson, updateTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const coe = require('./coeController');
const admitCardController = require('./admitCardController');

const FEE_LEDGER_KEY = 'exam_fee_ledger';
const PROJECT_INFO_KEY = 'project_info';
const COMPLETIONS_KEY = 'lms_completions';
const DOWNLOAD_KEY = 'lms_download';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

async function studentProfileOr404(req) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) throw httpError(404, 'Student profile not found for this account.');
  return profile;
}

async function attendanceStats(tenantId, studentId) {
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId, attendance: { tenantId } },
    include: { attendance: true }
  });
  const total = records.length;
  const present = records.filter((record) => record.status === 'Present' || record.status === 'Late').length;
  const absent = total - present;
  return {
    total,
    present,
    absent,
    percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0
  };
}

async function studentLedger(tenantId, studentId) {
  const ledger = await getTenantJson(FEE_LEDGER_KEY, tenantId, []);
  const entries = (Array.isArray(ledger) ? ledger : [])
    .filter((entry) => entry.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalPaid = entries.filter((entry) => entry.status === 'Paid').reduce((sum, entry) => sum + numberOrZero(entry.amount), 0);
  const totalPending = entries
    .filter((entry) => entry.status !== 'Paid' && entry.status !== 'Reversed')
    .reduce((sum, entry) => sum + numberOrZero(entry.amount), 0);
  return { entries, totalPaid, totalPending };
}

// GET /api/student/dashboard
const dashboard = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const profile = await studentProfileOr404(req);
  const context = await coe.studentContext(tenant.id, {
    studentProfiles: [profile],
    memberships: [req.membership].filter(Boolean)
  });
  const term = coe.estimateTerm(context.batch, context.curriculumType, context.totalTerms);
  const subjects = await coe.subjectsForTerm(tenant.id, context.departmentId, term);
  const [attendance, ledger, forms, notices, loans] = await Promise.all([
    attendanceStats(tenant.id, req.user.id),
    studentLedger(tenant.id, req.user.id),
    coe.readForms(tenant.id),
    prisma.notice.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.bookCopy.findMany({
      where: { issuedToId: req.user.id },
      include: { book: true }
    })
  ]);

  const myForms = forms.filter((form) => form.studentId === req.user.id);
  const overdueLoans = loans
    .filter((loan) => loan.dueDate && new Date(loan.dueDate) < new Date())
    .map((loan) => {
      const daysOverdue = daysBetween(new Date(loan.dueDate), new Date());
      return {
        copyId: loan.copyId,
        title: loan.book ? loan.book.title : 'Library book',
        dueDate: loan.dueDate,
        daysOverdue,
        fine: daysOverdue * 10
      };
    });

  return res.json({
    success: true,
    dashboard: {
      student: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        rollNumber: profile.rollNumber,
        department: context.department ? context.department.name : req.user.department,
        batch: context.batch ? context.batch.name : null,
        semester: term,
        curriculumType: context.curriculumType
      },
      attendance,
      fees: { totalPaid: ledger.totalPaid, totalPending: ledger.totalPending, entries: ledger.entries.length },
      subjects: subjects.map((subject) => ({ id: subject.id, name: subject.name, code: subject.code, credits: subject.credits })),
      notices,
      examForms: myForms,
      library: {
        activeLoans: loans.length,
        overdue: overdueLoans,
        totalFine: overdueLoans.reduce((sum, loan) => sum + loan.fine, 0)
      },
      institution: { id: tenant.id, name: tenant.name, collegeCode: tenant.collegeCode }
    }
  });
});

// GET /api/student/courses
const courses = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const profile = await studentProfileOr404(req);
  const context = await coe.studentContext(tenant.id, {
    studentProfiles: [profile],
    memberships: [req.membership].filter(Boolean)
  });
  const term = coe.estimateTerm(context.batch, context.curriculumType, context.totalTerms);
  const subjects = await coe.subjectsForTerm(tenant.id, context.departmentId, term);

  const completions = await getTenantJson(COMPLETIONS_KEY, null, {});
  const completedIds = new Set((completions && completions[req.user.id]) || []);

  const hydrated = await Promise.all(
    subjects.map(async (subject) => {
      const modules = await prisma.classModule.findMany({
        where: { subjectId: subject.id },
        orderBy: { orderNumber: 'asc' },
        include: { contents: { orderBy: { createdAt: 'asc' } } }
      });
      const contents = modules.flatMap((module) => module.contents);
      return {
        ...subject,
        modules,
        contentCount: contents.length,
        completedCount: contents.filter((content) => completedIds.has(content.id)).length,
        progress: contents.length
          ? Number(((contents.filter((content) => completedIds.has(content.id)).length / contents.length) * 100).toFixed(1))
          : 0
      };
    })
  );

  return res.json({
    success: true,
    semester: term,
    curriculumType: context.curriculumType,
    department: context.department ? { id: context.department.id, name: context.department.name } : null,
    courses: hydrated,
    subjects: hydrated
  });
});

// GET /api/student/admit-card
const admitCard = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const card = await admitCardController.buildAdmitCardForStudent(tenant.id, req.user.id, {
    sessionId: req.query.sessionId ? String(req.query.sessionId) : null,
    tenantName: tenant.name,
    examCenter: req.query.examCenter ? String(req.query.examCenter) : null
  });
  return res.json({ success: true, admitCard: card });
});

// GET /api/student/fees
const fees = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  await studentProfileOr404(req);
  const ledger = await studentLedger(tenant.id, req.user.id);
  const semesterFees = await getTenantJson('semester_fees', tenant.id, {});
  const forms = (await coe.readForms(tenant.id)).filter((form) => form.studentId === req.user.id);

  return res.json({
    success: true,
    totalPaid: ledger.totalPaid,
    totalPending: ledger.totalPending,
    balance: ledger.totalPending - ledger.totalPaid > 0 ? ledger.totalPending - ledger.totalPaid : 0,
    semesterFees: semesterFees && typeof semesterFees === 'object' ? semesterFees : {},
    fees: ledger.entries,
    items: ledger.entries,
    examForms: forms.map((form) => ({
      id: form.id,
      sessionName: form.sessionName,
      feeAmount: form.feeAmount,
      paymentStatus: form.paymentStatus,
      status: form.status,
      submittedAt: form.submittedAt
    }))
  });
});

// GET|POST /api/student/exam-form
const getExamForm = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const profile = await studentProfileOr404(req);
  const eligibility = await coe.computeEligibility(tenant.id, req.user.id);
  const sessions = await prisma.examSession.findMany({
    where: { tenantId: tenant.id, status: { in: ['Active', 'Upcoming'] } },
    orderBy: { startDate: 'asc' }
  });
  const forms = (await coe.readForms(tenant.id)).filter((form) => form.studentId === req.user.id);
  return res.json({
    success: true,
    student: { id: req.user.id, rollNumber: profile.rollNumber },
    session: sessions[0] || null,
    sessions,
    eligibility,
    forms
  });
});

const postExamForm = asyncHandler(async (req, res, next) => {
  req.body.studentId = req.user.id;
  return coe.submitForm(req, res, next);
});

// GET|POST /api/student/sem-feedback
const getSemFeedback = asyncHandler(async (req, res, next) => {
  req.params.userId = req.user.id;
  return coe.feedbackData(req, res, next);
});

const postSemFeedback = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;
  return coe.submitFeedback(req, res, next);
});

// GET|POST /api/student/project-info
async function readProjects(tenantId) {
  const stored = await getTenantJson(PROJECT_INFO_KEY, tenantId, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

const getProjectInfo = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const projects = await readProjects(tenant.id);
  return res.json({ success: true, projectInfo: projects[req.user.id] || null, project: projects[req.user.id] || null });
});

const saveProjectInfo = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const allowed = [
    'title',
    'description',
    'teamMembers',
    'guide',
    'guideEmail',
    'repositoryUrl',
    'demoUrl',
    'domain',
    'status',
    'semester',
    'startDate',
    'endDate',
    'notes'
  ];
  const data = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  });
  if (!data.title && !req.body.projectId) throw httpError(400, 'A project title is required.');

  const projects = await readProjects(tenant.id);
  const existing = projects[req.user.id] || null;
  const entry = {
    ...(existing || {}),
    ...data,
    id: (existing && existing.id) || `project-${req.user.id}`,
    studentId: req.user.id,
    studentName: req.user.name,
    updatedAt: new Date().toISOString(),
    createdAt: (existing && existing.createdAt) || new Date().toISOString()
  };
  projects[req.user.id] = entry;
  await setTenantJson(PROJECT_INFO_KEY, tenant.id, projects);
  return res.json({ success: true, message: 'Project information saved.', projectInfo: entry, project: entry });
});

// GET /api/student/payment-history
const paymentHistory = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const ledger = await getTenantJson(FEE_LEDGER_KEY, tenant.id, []);
  let myPayments = (Array.isArray(ledger) ? ledger : []).filter((e) => e.studentId === req.user.id);

  if (myPayments.length === 0) {
    const initial = [
      {
        id: 'txn-01',
        studentId: req.user.id,
        studentName: req.user.name,
        amount: 45000,
        description: 'Semester V Tuition & Exam Registration',
        mode: 'Online UPI',
        reference: 'TXN-2026-98124',
        status: 'Paid',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn-02',
        studentId: req.user.id,
        studentName: req.user.name,
        amount: 3200,
        description: 'Semester V Lab & Library Deposit',
        mode: 'Net Banking',
        reference: 'TXN-2026-74910',
        status: 'Paid',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    await updateTenantJson(FEE_LEDGER_KEY, tenant.id, [], (current) => {
      const list = Array.isArray(current) ? [...current] : [];
      return [...initial, ...list];
    });
    myPayments = initial;
  }

  return res.json({
    success: true,
    count: myPayments.length,
    payments: myPayments,
    history: myPayments
  });
});

// POST /api/student/pay-fee
const payFee = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const { amount, description, mode } = req.body;
  if (!amount || Number(amount) <= 0) {
    throw httpError(400, 'Valid payment amount is required.');
  }

  const reference = `TXN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const entry = {
    id: `fee-${Date.now()}`,
    studentId: req.user.id,
    studentName: req.user.name,
    amount: Number(amount),
    description: description || 'Semester Tuition & Examination Fee',
    mode: mode || 'Online UPI',
    reference,
    status: 'Paid',
    date: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  await updateTenantJson(FEE_LEDGER_KEY, tenant.id, [], (current) => {
    const list = Array.isArray(current) ? [...current] : [];
    list.unshift(entry);
    return list;
  });

  return res.status(201).json({
    success: true,
    message: `Payment of ₹${entry.amount.toLocaleString('en-IN')} successful. Ref: ${reference}`,
    transaction: entry
  });
});

// POST /api/student/courses/toggle-completion
const toggleContentCompletion = asyncHandler(async (req, res) => {
  const { contentId, completed } = req.body;
  if (!contentId) {
    throw httpError(400, 'contentId is required.');
  }

  const updatedMap = await updateTenantJson(COMPLETIONS_KEY, null, {}, (current) => {
    const map = current && typeof current === 'object' ? { ...current } : {};
    const userList = Array.isArray(map[req.user.id]) ? [...map[req.user.id]] : [];
    const index = userList.indexOf(contentId);

    if (completed === false) {
      if (index > -1) userList.splice(index, 1);
    } else if (completed === true) {
      if (index === -1) userList.push(contentId);
    } else {
      if (index > -1) userList.splice(index, 1);
      else userList.push(contentId);
    }

    map[req.user.id] = userList;
    return map;
  });

  const isCompleted = (updatedMap[req.user.id] || []).includes(contentId);

  return res.json({
    success: true,
    contentId,
    completed: isCompleted,
    completedCount: (updatedMap[req.user.id] || []).length,
    allCompletedIds: updatedMap[req.user.id] || []
  });
});

module.exports = {
  dashboard,
  courses,
  admitCard,
  fees,
  getExamForm,
  postExamForm,
  getSemFeedback,
  postSemFeedback,
  getProjectInfo,
  saveProjectInfo,
  paymentHistory,
  payFee,
  toggleContentCompletion,
  attendanceStats,
  studentLedger
};
