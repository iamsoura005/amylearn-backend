'use strict';

const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError, startOfDay, endOfDay, daysBetween, numberOrZero, toInt } = require('../utils/apiHelpers');
const { getTenantJson, setTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

const REPORT_STATS_KEY = 'weekly_report_stats';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function staffOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

async function studentsOfBatch(tenantId, batchId) {
  const profiles = await prisma.studentProfile.findMany({
    where: { tenantId, batchId },
    include: { user: { select: { id: true, name: true, email: true, amylearnId: true } } }
  });
  return profiles.map((profile) => ({
    id: profile.user.id,
    name: profile.user.name,
    rollNumber: profile.rollNumber || profile.user.amylearnId || null
  }));
}

async function batchesForFaculty(tenantId, facultyId) {
  const periods = await prisma.routinePeriod.findMany({
    where: { facultyId, routine: { tenantId } },
    include: {
      routine: { include: { batch: { select: { id: true, name: true, departmentId: true } } } },
      subject: { select: { id: true, name: true, code: true } }
    }
  });
  const map = new Map();
  periods.forEach((period) => {
    const batch = period.routine && period.routine.batch;
    if (!batch) return;
    if (!map.has(batch.id)) {
      map.set(batch.id, { id: batch.id, name: batch.name, departmentId: batch.departmentId, subjects: [] });
    }
    const entry = map.get(batch.id);
    if (period.subject && !entry.subjects.some((subject) => subject.id === period.subject.id)) {
      entry.subjects.push(period.subject);
    }
  });
  return Array.from(map.values());
}

function attendanceStatsFor(records) {
  const total = records.length;
  const present = records.filter((record) => record.status === 'Present').length;
  const late = records.filter((record) => record.status === 'Late').length;
  const absent = total - present - late;
  return {
    total,
    present,
    late,
    absent,
    percentage: total ? Number(((present + late) / total) * 100).toFixed(1) : 0
  };
}

// ---------------------------------------------------------------------------
// GET /api/attendance/faculty/init
// ---------------------------------------------------------------------------
const facultyInit = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let facultyId = req.user.id;
  if (staffOf(req) && req.query.facultyId) facultyId = String(req.query.facultyId);

  const batches = await batchesForFaculty(tenant.id, facultyId);
  const batchId = req.query.batchId || (batches[0] && batches[0].id) || null;
  let students = [];
  if (batchId) students = await studentsOfBatch(tenant.id, batchId);

  const today = startOfDay(new Date());
  const alreadyMarked = await prisma.attendance.findMany({
    where: {
      tenantId: tenant.id,
      facultyId,
      date: { gte: today, lte: endOfDay(new Date()) }
    },
    select: { batchId: true, subjectId: true }
  });

  return res.json({
    success: true,
    facultyId,
    batches,
    batchId,
    students,
    alreadyMarked,
    today: today.toISOString()
  });
});

// ---------------------------------------------------------------------------
// GET /api/attendance/report
// ---------------------------------------------------------------------------
const report = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const batchId = req.query.batchId || req.params.batchId || null;
  const subjectId = req.query.subjectId || null;

  let batch = null;
  if (batchId) {
    batch = await prisma.batch.findFirst({ where: { id: String(batchId), tenantId: tenant.id } });
    if (!batch) throw httpError(404, 'Batch not found in this institution.');
  }

  const where = { tenantId: tenant.id };
  if (batch) where.batchId = batch.id;
  if (subjectId) where.subjectId = String(subjectId);

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      records: true,
      batch: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } }
    },
    orderBy: { date: 'desc' }
  });

  const bySubject = new Map();
  attendances.forEach((attendance) => {
    const key = attendance.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subject: attendance.subject,
        sessions: 0,
        present: 0,
        late: 0,
        absent: 0
      });
    }
    const entry = bySubject.get(key);
    entry.sessions += 1;
    attendance.records.forEach((record) => {
      if (record.status === 'Present') entry.present += 1;
      else if (record.status === 'Late') entry.late += 1;
      else entry.absent += 1;
    });
  });

  const subjects = Array.from(bySubject.values()).map((entry) => {
    const total = entry.present + entry.late + entry.absent;
    return {
      ...entry,
      total,
      percentage: total ? Number(((entry.present + entry.late) / total) * 100).toFixed(1) : 0
    };
  });

  return res.json({
    success: true,
    batch,
    sessions: attendances.length,
    subjects,
    recent: attendances.slice(0, 20).map((attendance) => ({
      id: attendance.id,
      date: attendance.date,
      batch: attendance.batch ? attendance.batch.name : null,
      subject: attendance.subject,
      stats: attendanceStatsFor(attendance.records)
    }))
  });
});

// ---------------------------------------------------------------------------
// GET /api/attendance/my-records  (faculty marking history)
// ---------------------------------------------------------------------------
const myRecords = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const attendances = await prisma.attendance.findMany({
    where: { tenantId: tenant.id, facultyId: req.user.id },
    include: {
      records: true,
      batch: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } }
    },
    orderBy: { date: 'desc' }
  });
  return res.json({
    success: true,
    count: attendances.length,
    records: attendances.map((attendance) => ({
      id: attendance.id,
      date: attendance.date,
      batch: attendance.batch ? attendance.batch.name : null,
      subject: attendance.subject,
      isFinalized: attendance.isFinalized,
      stats: attendanceStatsFor(attendance.records),
      students: attendance.records.map((record) => ({ studentId: record.studentId, status: record.status }))
    }))
  });
});

// ---------------------------------------------------------------------------
// GET /api/attendance/my-attendance  (student self view)
// ---------------------------------------------------------------------------
const myAttendance = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: req.user.id, attendance: { tenantId: tenant.id } },
    include: {
      attendance: {
        include: {
          batch: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true, code: true } }
        }
      }
    },
    orderBy: { attendance: { date: 'desc' } }
  });

  const bySubject = new Map();
  records.forEach((record) => {
    const attendance = record.attendance;
    const key = attendance.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subject: attendance.subject,
        sessions: 0,
        present: 0,
        late: 0,
        absent: 0
      });
    }
    const entry = bySubject.get(key);
    entry.sessions += 1;
    if (record.status === 'Present') entry.present += 1;
    else if (record.status === 'Late') entry.late += 1;
    else entry.absent += 1;
  });

  const subjects = Array.from(bySubject.values()).map((entry) => ({
    ...entry,
    percentage: entry.sessions ? Number(((entry.present + entry.late) / entry.sessions) * 100).toFixed(1) : 0
  }));

  return res.json({
    success: true,
    studentId: req.user.id,
    count: records.length,
    subjects,
    records: records.map((record) => ({
      id: record.id,
      date: record.attendance.date,
      status: record.status,
      subject: record.attendance.subject,
      batch: record.attendance.batch ? record.attendance.batch.name : null
    }))
  });
});

// ---------------------------------------------------------------------------
// POST /api/attendance/mark
// ---------------------------------------------------------------------------
const mark = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can mark attendance.');
  const tenant = tenantOf(req);

  const batchId = req.body.batchId;
  const subjectId = req.body.subjectId;
  if (!batchId || !subjectId) throw httpError(400, 'batchId and subjectId are required.');

  const batch = await prisma.batch.findFirst({ where: { id: String(batchId), tenantId: tenant.id } });
  if (!batch) throw httpError(404, 'Batch not found in this institution.');
  const subject = await prisma.subject.findFirst({ where: { id: String(subjectId), tenantId: tenant.id } });
  if (!subject) throw httpError(404, 'Subject not found in this institution.');

  const records = Array.isArray(req.body.records) ? req.body.records : req.body.students;
  if (!Array.isArray(records) || !records.length) throw httpError(400, 'Provide attendance records.');

  const date = req.body.date ? new Date(req.body.date) : new Date();
  if (Number.isNaN(date.getTime())) throw httpError(400, 'Invalid attendance date.');

  const periodId = req.body.periodId || null;
  const facultyId = staffOf(req) && req.body.facultyId ? String(req.body.facultyId) : req.user.id;

  const attendance = await prisma.attendance.create({
    data: {
      tenantId: tenant.id,
      date,
      batchId: batch.id,
      periodId,
      subjectId: subject.id,
      facultyId,
      isFinalized: req.body.isFinalized === undefined ? true : Boolean(req.body.isFinalized),
      markedAt: new Date()
    }
  });

  const created = [];
  for (const entry of records) {
    const studentId = entry.studentId || entry.userId || entry.id;
    if (!studentId) continue;
    const status = ['Present', 'Absent', 'Late'].includes(String(entry.status))
      ? String(entry.status)
      : 'Present';
    // eslint-disable-next-line no-await-in-loop
    await prisma.attendanceRecord.create({
      data: { attendanceId: attendance.id, studentId: String(studentId), status }
    });
    created.push({ studentId: String(studentId), status });
  }

  const saved = await prisma.attendance.findUnique({
    where: { id: attendance.id },
    include: {
      records: true,
      batch: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } }
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Attendance marked successfully.',
    attendance: {
      ...saved,
      stats: attendanceStatsFor(saved.records)
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/attendance/weekly-reports
// ---------------------------------------------------------------------------
const weeklyReports = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let where = { tenantId: tenant.id };
  if (!staffOf(req)) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    where = {
      OR: [
        { tenantId: tenant.id, batchId: profile ? profile.batchId : null },
        { tenantId: tenant.id, generatedById: req.user.id }
      ]
    };
  } else if (req.query.batchId) {
    where.batchId = String(req.query.batchId);
  }

  const reports = await prisma.weeklyReport.findMany({
    where,
    include: {
      batch: { select: { id: true, name: true } },
      generatedBy: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const enriched = await Promise.all(
    reports.map(async (report) => {
      const stats = await getTenantJson(`${REPORT_STATS_KEY}:${report.id}`, tenant.id, null);
      return { ...report, stats };
    })
  );

  return res.json({ success: true, count: reports.length, reports: enriched });
});

// ---------------------------------------------------------------------------
// POST /api/attendance/weekly-reports/generate
// ---------------------------------------------------------------------------
const generateWeekly = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can generate weekly reports.');
  const tenant = tenantOf(req);

  const batchId = req.body.batchId;
  if (!batchId) throw httpError(400, 'batchId is required.');
  const batch = await prisma.batch.findFirst({ where: { id: String(batchId), tenantId: tenant.id } });
  if (!batch) throw httpError(404, 'Batch not found in this institution.');

  const weekStart = req.body.weekStartDate ? new Date(req.body.weekStartDate) : startOfDay(new Date());
  const weekEnd = req.body.weekEndDate ? new Date(req.body.weekEndDate) : new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(weekStart.getTime()) || Number.isNaN(weekEnd.getTime())) {
    throw httpError(400, 'Invalid week range.');
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      tenantId: tenant.id,
      batchId: batch.id,
      date: { gte: weekStart, lte: endOfDay(weekEnd) }
    },
    include: {
      records: true,
      subject: { select: { id: true, name: true, code: true } }
    }
  });

  const bySubject = new Map();
  attendances.forEach((attendance) => {
    const key = attendance.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, { subject: attendance.subject, sessions: 0, present: 0, late: 0, absent: 0 });
    }
    const entry = bySubject.get(key);
    entry.sessions += 1;
    attendance.records.forEach((record) => {
      if (record.status === 'Present') entry.present += 1;
      else if (record.status === 'Late') entry.late += 1;
      else entry.absent += 1;
    });
  });

  const stats = {
    weekStartDate: weekStart.toISOString(),
    weekEndDate: weekEnd.toISOString(),
    sessions: attendances.length,
    subjects: Array.from(bySubject.values()).map((entry) => {
      const total = entry.present + entry.late + entry.absent;
      return {
        ...entry,
        percentage: total ? Number(((entry.present + entry.late) / total) * 100).toFixed(1) : 0
      };
    })
  };

  const report = await prisma.weeklyReport.create({
    data: {
      tenantId: tenant.id,
      batchId: batch.id,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      generatedById: req.user.id,
      status: 'Generated'
    }
  });
  await setTenantJson(`${REPORT_STATS_KEY}:${report.id}`, tenant.id, stats);

  return res.status(201).json({
    success: true,
    message: 'Weekly report generated.',
    report: { ...report, stats }
  });
});

module.exports = {
  facultyInit,
  report,
  myRecords,
  myAttendance,
  mark,
  weeklyReports,
  generateWeekly,
  studentsOfBatch,
  batchesForFaculty,
  attendanceStatsFor
};
