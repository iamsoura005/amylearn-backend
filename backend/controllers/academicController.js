'use strict';

const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError, toInt } = require('../utils/apiHelpers');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function assertManager(req) {
  if (req.isSuperAdmin) return;
  if (normalizeRole(req.role) !== 'college_admin') {
    throw httpError(403, 'Only campus administrators can manage academic structure.');
  }
}

async function findDepartment(req, id = req.params.deptId || req.params.id) {
  const tenant = tenantOf(req);
  const department = await prisma.department.findFirst({ where: { id, tenantId: tenant.id } });
  if (!department) throw httpError(404, 'Department not found in this institution.');
  return { tenant, department };
}

const listDepartments = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const departments = await prisma.department.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' },
    include: {
      streams: { orderBy: { name: 'asc' } },
      _count: { select: { subjects: true, streams: true } }
    }
  });
  return res.json({
    success: true,
    count: departments.length,
    departments: departments.map((department) => ({
      ...department,
      subjectCount: department._count.subjects,
      streamCount: department._count.streams
    }))
  });
});

const createDepartment = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const existing = await prisma.department.findFirst({
    where: { tenantId: tenant.id, name: req.body.name }
  });
  if (existing) throw httpError(409, 'A department with this name already exists.');

  const department = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      name: req.body.name,
      code: req.body.code || null,
      headOfDepartment: req.body.headOfDepartment || null
    }
  });
  return res.status(201).json({ success: true, message: 'Department created.', department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  assertManager(req);
  const { department } = await findDepartment(req);
  const updated = await prisma.department.update({
    where: { id: department.id },
    data: {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.code !== undefined ? { code: req.body.code } : {}),
      ...(req.body.headOfDepartment !== undefined ? { headOfDepartment: req.body.headOfDepartment } : {})
    }
  });
  return res.json({ success: true, message: 'Department updated.', department: updated });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  assertManager(req);
  const { department } = await findDepartment(req);
  const counts = await prisma.department.findUnique({
    where: { id: department.id },
    select: { _count: { select: { subjects: true, streams: true } } }
  });
  if (counts?._count?.subjects > 0 || counts?._count?.streams > 0) {
    throw httpError(409, 'Cannot delete department with active streams or courses. Reassign or remove them first.');
  }
  await prisma.department.delete({ where: { id: department.id } });
  return res.json({ success: true, message: 'Department deleted.' });
});

const createStream = asyncHandler(async (req, res) => {
  assertManager(req);
  const { department } = await findDepartment(req);
  const stream = await prisma.stream.create({
    data: {
      departmentId: department.id,
      name: req.body.name,
      code: req.body.code || null,
      curriculumType: req.body.curriculumType || 'Semester',
      totalTerms: req.body.totalTerms || (req.body.curriculumType === 'Trimester' ? 12 : 8),
      oddStartMonth: req.body.oddStartMonth || 'July',
      oddEndMonth: req.body.oddEndMonth || 'December',
      evenStartMonth: req.body.evenStartMonth || 'January',
      evenEndMonth: req.body.evenEndMonth || 'June'
    }
  });
  return res.status(201).json({ success: true, message: 'Stream created.', stream });
});

const updateStreamConfig = asyncHandler(async (req, res) => {
  assertManager(req);
  const { tenant, department } = await findDepartment(req, req.params.deptId);
  const stream = await prisma.stream.findFirst({
    where: { id: req.params.streamId, departmentId: department.id }
  });
  if (!stream) throw httpError(404, 'Stream not found in this department.');

  const changingCurriculum = ['curriculumType', 'totalTerms', 'oddStartMonth', 'oddEndMonth', 'evenStartMonth', 'evenEndMonth'].some(
    (key) => req.body[key] !== undefined && req.body[key] !== stream[key]
  );
  if (stream.isLocked && changingCurriculum && req.body.isLocked !== false) {
    throw httpError(409, 'This stream curriculum is locked. Unlock it before changing term settings.');
  }

  const data = {};
  [
    'curriculumType',
    'totalTerms',
    'oddStartMonth',
    'oddEndMonth',
    'evenStartMonth',
    'evenEndMonth',
    'isConfigured',
    'isLocked'
  ].forEach((key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  });
  if (req.body.isConfigured === undefined && changingCurriculum) data.isConfigured = true;

  const updated = await prisma.stream.update({ where: { id: stream.id }, data });
  return res.json({
    success: true,
    message: 'Stream curriculum updated.',
    stream: updated,
    tenantId: tenant.id
  });
});

const deleteStream = asyncHandler(async (req, res) => {
  assertManager(req);
  const { department } = await findDepartment(req);
  const stream = await prisma.stream.findFirst({
    where: { id: req.params.streamId, departmentId: department.id }
  });
  if (!stream) throw httpError(404, 'Stream not found in this department.');
  await prisma.stream.delete({ where: { id: stream.id } });
  return res.json({ success: true, message: 'Stream deleted.' });
});

const listSubjects = asyncHandler(async (req, res) => {
  const { department } = await findDepartment(req, req.params.deptId);
  const where = { departmentId: department.id };
  if (req.query.semester) where.semester = toInt(req.query.semester, 1);
  if (req.query.active !== undefined) where.isActive = String(req.query.active) !== 'false';

  const subjects = await prisma.subject.findMany({
    where,
    orderBy: [{ semester: 'asc' }, { code: 'asc' }]
  });
  return res.json({ success: true, count: subjects.length, subjects });
});

function normalizeSubjectInput(input, tenantId, departmentId) {
  return {
    tenantId,
    departmentId,
    name: String(input.name).trim(),
    code: String(input.code).trim().toUpperCase(),
    type: input.type || 'Theory',
    credits: input.credits === undefined ? 3 : Number(input.credits),
    semester: Number(input.semester),
    year: input.year === undefined ? Math.max(1, Math.ceil(Number(input.semester) / 2)) : Number(input.year),
    isActive: input.isActive === undefined ? true : Boolean(input.isActive)
  };
}

const createSubjects = asyncHandler(async (req, res) => {
  assertManager(req);
  const { tenant, department } = await findDepartment(req, req.params.deptId);
  const payload = Array.isArray(req.body) ? req.body : Array.isArray(req.body.subjects) ? req.body.subjects : [req.body];
  if (!payload.length) throw httpError(400, 'Provide at least one subject.');

  const created = [];
  for (const input of payload) {
    const data = normalizeSubjectInput(input, tenant.id, department.id);
    if (!data.name || !data.code || !data.semester) {
      throw httpError(400, 'Each subject needs a name, code and semester.');
    }
    // eslint-disable-next-line no-await-in-loop
    const existing = await prisma.subject.findFirst({
      where: { tenantId: tenant.id, code: data.code }
    });
    if (existing) throw httpError(409, `Subject code ${data.code} already exists.`);
    // eslint-disable-next-line no-await-in-loop
    const subject = await prisma.subject.create({ data });
    created.push(subject);
  }

  return res.status(201).json({
    success: true,
    message: created.length === 1 ? 'Subject created.' : `${created.length} subjects created.`,
    subject: created.length === 1 ? created[0] : undefined,
    subjects: created
  });
});

const updateSubject = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!subject) throw httpError(404, 'Subject not found in this institution.');

  if (req.body.code) {
    const code = String(req.body.code).trim().toUpperCase();
    const clash = await prisma.subject.findFirst({
      where: { tenantId: tenant.id, code, NOT: { id: subject.id } }
    });
    if (clash) throw httpError(409, 'Another subject already uses this code.');
  }

  const data = {};
  ['name', 'type', 'code', 'credits', 'semester', 'year', 'isActive', 'departmentId'].forEach((key) => {
    if (req.body[key] !== undefined) {
      data[key] = ['credits', 'semester', 'year'].includes(key) ? Number(req.body[key]) : req.body[key];
    }
  });
  if (data.code) data.code = String(data.code).toUpperCase();
  if (data.departmentId) {
    const department = await prisma.department.findFirst({
      where: { id: data.departmentId, tenantId: tenant.id }
    });
    if (!department) throw httpError(400, 'Target department does not belong to this institution.');
  }

  const updated = await prisma.subject.update({ where: { id: subject.id }, data });
  return res.json({ success: true, message: 'Subject updated.', subject: updated });
});

const deleteSubject = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!subject) throw httpError(404, 'Subject not found in this institution.');
  const attendanceCount = await prisma.attendance.count({ where: { subjectId: subject.id } });
  if (attendanceCount > 0) {
    throw httpError(409, 'Cannot delete subject with existing attendance records.');
  }
  await prisma.subject.delete({ where: { id: subject.id } });
  return res.json({ success: true, message: 'Subject deleted.' });
});

const departmentOverview = asyncHandler(async (req, res) => {
  const { tenant, department } = await findDepartment(req);
  const [streams, subjects, batches, facultyProfiles] = await Promise.all([
    prisma.stream.findMany({ where: { departmentId: department.id }, orderBy: { name: 'asc' } }),
    prisma.subject.findMany({
      where: { departmentId: department.id },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }]
    }),
    prisma.batch.findMany({ where: { tenantId: tenant.id, departmentId: department.id } }),
    prisma.facultyProfile.findMany({ where: { tenantId: tenant.id, departmentId: department.id } })
  ]);

  const bySemester = {};
  subjects.forEach((subject) => {
    bySemester[subject.semester] = bySemester[subject.semester] || [];
    bySemester[subject.semester].push(subject);
  });

  return res.json({
    success: true,
    overview: {
      department,
      streams,
      subjects,
      subjectsBySemester: Object.entries(bySemester)
        .map(([semester, items]) => ({ semester: Number(semester), subjects: items }))
        .sort((a, b) => a.semester - b.semester),
      batches,
      counts: {
        streams: streams.length,
        subjects: subjects.length,
        batches: batches.length,
        faculty: facultyProfiles.length
      }
    }
  });
});



// ---------------------------------------------------------------------------
// Classrooms (rosters persisted in SystemConfig — the schema has no join table)
// ---------------------------------------------------------------------------
const { getConfig, setConfig } = require('../utils/systemConfig');

function rosterKey(classroomId) {
  return `classroom_roster:${classroomId}`;
}

async function readRoster(classroomId) {
  const raw = await getConfig(rosterKey(classroomId), '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeRoster(classroomId, userIds) {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  await setConfig(rosterKey(classroomId), JSON.stringify(unique));
  return unique;
}

async function findClassroom(req, id = req.params.id) {
  const tenant = tenantOf(req);
  const classroom = await prisma.classroom.findFirst({ where: { id, tenantId: tenant.id } });
  if (!classroom) throw httpError(404, 'Classroom not found in this institution.');
  return { tenant, classroom };
}

const listClassrooms = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const classrooms = await prisma.classroom.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ building: 'asc' }, { roomNumber: 'asc' }]
  });
  const withRosters = await Promise.all(
    classrooms.map(async (classroom) => {
      const studentIds = await readRoster(classroom.id);
      return { ...classroom, studentIds, studentCount: studentIds.length };
    })
  );
  return res.json({ success: true, count: withRosters.length, classrooms: withRosters });
});

const createClassroom = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  if (!req.body.roomNumber) throw httpError(400, 'roomNumber is required.');
  const existing = await prisma.classroom.findFirst({
    where: { tenantId: tenant.id, roomNumber: String(req.body.roomNumber).trim() }
  });
  if (existing) throw httpError(409, 'A classroom with this room number already exists.');

  const classroom = await prisma.classroom.create({
    data: {
      tenantId: tenant.id,
      roomNumber: String(req.body.roomNumber).trim(),
      building: req.body.building || null,
      capacity: req.body.capacity === undefined ? null : Number(req.body.capacity)
    }
  });
  return res.status(201).json({ success: true, message: 'Classroom created.', classroom });
});

async function resolveStudents(tenantId, identifiers) {
  const list = Array.isArray(identifiers) ? identifiers : [identifiers];
  const users = [];
  for (const value of list.filter(Boolean)) {
    const identifier = String(value).trim();
    // eslint-disable-next-line no-await-in-loop
    const user = await prisma.user.findFirst({
      where: {
        memberships: { some: { tenantId, status: 'active', role: 'student' } },
        OR: [
          { id: identifier },
          { email: identifier.toLowerCase() },
          { amylearnId: identifier },
          { studentProfiles: { some: { rollNumber: identifier } } }
        ]
      }
    });
    if (user) users.push(user);
  }
  return users;
}

const enrollClassroom = asyncHandler(async (req, res) => {
  assertManager(req);
  const { classroom } = await findClassroom(req);
  const identifiers =
    req.body.studentIds || req.body.userIds || req.body.studentId || req.body.userId || req.body.rollNumber;
  if (!identifiers) throw httpError(400, 'Provide studentId, rollNumber or a studentIds array.');
  const students = await resolveStudents(req.tenant.id, identifiers);
  if (!students.length) throw httpError(404, 'No matching students were found in this institution.');

  const current = await readRoster(classroom.id);
  const next = await writeRoster(classroom.id, [...current, ...students.map((student) => student.id)]);
  return res.json({
    success: true,
    message: `${students.length} student(s) enrolled.`,
    classroom,
    studentIds: next,
    enrolled: students.map((student) => ({ id: student.id, name: student.name, email: student.email }))
  });
});

const unenrollClassroom = asyncHandler(async (req, res) => {
  assertManager(req);
  const { classroom } = await findClassroom(req);
  const identifier = req.body.studentId || req.body.userId || req.query.studentId || req.query.userId;
  if (!identifier) throw httpError(400, 'studentId or userId is required.');
  const current = await readRoster(classroom.id);
  const next = await writeRoster(
    classroom.id,
    current.filter((id) => id !== identifier)
  );
  return res.json({ success: true, message: 'Student unenrolled.', classroom, studentIds: next });
});

const deleteClassroom = asyncHandler(async (req, res) => {
  assertManager(req);
  const { classroom } = await findClassroom(req);
  await prisma.classroom.delete({ where: { id: classroom.id } });
  await setConfig(rosterKey(classroom.id), JSON.stringify([]));
  return res.json({ success: true, message: 'Classroom deleted.' });
});

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------
async function findBatch(req, id = req.params.id) {
  const tenant = tenantOf(req);
  const batch = await prisma.batch.findFirst({ where: { id, tenantId: tenant.id } });
  if (!batch) throw httpError(404, 'Batch not found in this institution.');
  return { tenant, batch };
}

const listBatches = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const batches = await prisma.batch.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ startYear: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { routines: true, attendances: true } } }
  });
  const withCounts = await Promise.all(
    batches.map(async (batch) => {
      const students = await prisma.studentProfile.count({ where: { tenantId: tenant.id, batchId: batch.id } });
      return { ...batch, studentCount: students, routineCount: batch._count.routines };
    })
  );
  return res.json({ success: true, count: withCounts.length, batches: withCounts });
});

const createBatch = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  if (!req.body.name || !req.body.startYear || !req.body.endYear) {
    throw httpError(400, 'name, startYear and endYear are required.');
  }
  const existing = await prisma.batch.findFirst({
    where: { tenantId: tenant.id, name: String(req.body.name).trim() }
  });
  if (existing) throw httpError(409, 'A batch with this name already exists.');

  const batch = await prisma.batch.create({
    data: {
      tenantId: tenant.id,
      name: String(req.body.name).trim(),
      startYear: Number(req.body.startYear),
      endYear: Number(req.body.endYear),
      departmentId: req.body.departmentId || null
    }
  });
  return res.status(201).json({ success: true, message: 'Batch created.', batch });
});

const enrollBatch = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.isSuperAdmin && !['college_admin', 'faculty'].includes(normalizeRole(req.role))) {
    const self = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const requestedUserId = req.body.userId || req.body.studentId;
    if (!self || (requestedUserId && requestedUserId !== req.user.id)) {
      throw httpError(403, 'Only administrators can enroll students.');
    }
  }
  const { batch } = await findBatch(req, req.params.batchId);
  const identifiers = req.body.studentIds || req.body.studentId || req.body.userId || req.body.rollNumber;
  if (!identifiers) throw httpError(400, 'Provide studentId, rollNumber or a studentIds array.');

  const students = await resolveStudents(tenant.id, identifiers);
  if (!students.length) throw httpError(404, 'No matching students were found.');

  for (const student of students) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: { batchId: batch.id, departmentId: batch.departmentId || undefined },
      create: { userId: student.id, tenantId: tenant.id, batchId: batch.id, departmentId: batch.departmentId }
    });
  }

  return res.json({
    success: true,
    message: `${students.length} student(s) enrolled into ${batch.name}.`,
    batch,
    students: students.map((student) => ({ id: student.id, name: student.name, email: student.email }))
  });
});

const myBatches = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
  if (profile && profile.tenantId === tenant.id && profile.batchId) {
    const batch = await prisma.batch.findFirst({ where: { id: profile.batchId, tenantId: tenant.id } });
    return res.json({ success: true, batches: batch ? [batch] : [], batchId: profile.batchId });
  }

  const periods = await prisma.routinePeriod.findMany({
    where: { facultyId: req.user.id },
    include: { routine: { include: { batch: true } } }
  });
  const byId = new Map();
  periods.forEach((period) => {
    if (period.routine && period.routine.batch && period.routine.batch.tenantId === tenant.id) {
      byId.set(period.routine.batchId, period.routine.batch);
    }
  });
  return res.json({ success: true, batches: Array.from(byId.values()) });
});

const batchStudents = asyncHandler(async (req, res) => {
  const { tenant, batch } = await findBatch(req, req.params.batchId);
  const profiles = await prisma.studentProfile.findMany({
    where: { tenantId: tenant.id, batchId: batch.id },
    include: { user: true }
  });
  return res.json({
    success: true,
    batch,
    count: profiles.length,
    students: profiles.map((profile) => ({
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      rollNumber: profile.rollNumber,
      amylearnId: profile.user.amylearnId,
      departmentId: profile.departmentId
    }))
  });
});

const updateBatch = asyncHandler(async (req, res) => {
  assertManager(req);
  const { batch } = await findBatch(req);
  const data = {};
  ['name', 'startYear', 'endYear', 'departmentId'].forEach((key) => {
    if (req.body[key] !== undefined) {
      data[key] = ['startYear', 'endYear'].includes(key) ? Number(req.body[key]) : req.body[key];
    }
  });
  const updated = await prisma.batch.update({ where: { id: batch.id }, data });
  return res.json({ success: true, message: 'Batch updated.', batch: updated });
});

const deleteBatch = asyncHandler(async (req, res) => {
  assertManager(req);
  const { batch } = await findBatch(req);
  const [studentCount, attendanceCount] = await Promise.all([
    prisma.studentProfile.count({ where: { batchId: batch.id } }),
    prisma.attendance.count({ where: { batchId: batch.id } })
  ]);
  if (studentCount > 0 || attendanceCount > 0) {
    throw httpError(409, 'Cannot delete batch with enrolled students or attendance records. Reassign students first.');
  }
  await prisma.batch.delete({ where: { id: batch.id } });
  return res.json({ success: true, message: 'Batch deleted.' });
});

// ---------------------------------------------------------------------------
// Notices — reactions toggled + threaded comments
// ---------------------------------------------------------------------------
const { randomUUID } = require('crypto');
const { getTenantJson, setTenantJson, updateTenantJson } = require('../utils/systemConfig');

function reactionMetaKey() {
  return 'notice_reactions_meta';
}

async function reactionMetaFor(tenantId) {
  const meta = await getTenantJson(reactionMetaKey(), tenantId, {});
  return meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {};
}

async function decorateNotices(tenantId, notices, userId) {
  const meta = await reactionMetaFor(tenantId);
  return notices.map((notice) => {
    const noticeMeta = meta[notice.id] && typeof meta[notice.id] === 'object' ? meta[notice.id] : {};
    const myReaction = userId ? noticeMeta[userId] || null : null;
    const comments = (notice.comments || []).map((comment) => ({
      ...comment,
      isReply: Boolean(comment.parentId)
    }));
    const roots = comments
      .filter((comment) => !comment.parentId)
      .map((comment) => ({
        ...comment,
        replies: comments.filter((reply) => reply.parentId === comment.id)
      }));
    return {
      ...notice,
      commentCount: comments.length,
      reactionCount: (notice.reactions || []).length,
      reactedByMe: Boolean(myReaction || (notice.reactions || []).some((reaction) => reaction.userId === userId)),
      myReaction,
      comments,
      threads: roots
    };
  });
}

const listNotices = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const where = { tenantId: tenant.id };
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.department) where.department = String(req.query.department);
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.search) {
    where.OR = [
      { title: { contains: String(req.query.search) } },
      { content: { contains: String(req.query.search) } }
    ];
  }
  const take = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

  const notices = await prisma.notice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      comments: { orderBy: { createdAt: 'asc' } },
      reactions: true
    }
  });

  const decorated = await decorateNotices(tenant.id, notices, req.user ? req.user.id : null);
  return res.json({ success: true, count: decorated.length, notices: decorated, items: decorated });
});

const noticesByType = asyncHandler(async (req, res) => {
  const type = String(req.params.type || '').toLowerCase();
  if (!['staff', 'departmental'].includes(type)) {
    throw httpError(400, 'Notice type must be staff or departmental.');
  }
  req.query.type = type;
  return listNotices(req, res);
});

const createNotice = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.isSuperAdmin && !['college_admin', 'faculty'].includes(normalizeRole(req.role))) {
    throw httpError(403, 'Only staff members can publish notices.');
  }
  const type = String(req.body.type || 'staff').toLowerCase();
  if (!['staff', 'departmental'].includes(type)) {
    throw httpError(400, 'Notice type must be staff or departmental.');
  }

  const notice = await prisma.notice.create({
    data: {
      tenantId: tenant.id,
      type,
      department: type === 'departmental' ? req.body.department || req.user.department || null : req.body.department || null,
      category: req.body.category || 'Announcement',
      posterId: req.user.id,
      posterName: req.user.name,
      posterRole: normalizeRole(req.role),
      title: String(req.body.title).trim(),
      content: String(req.body.content).trim()
    },
    include: { comments: true, reactions: true }
  });

  return res.status(201).json({ success: true, message: 'Notice published.', notice });
});

const reactToNotice = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const notice = await prisma.notice.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!notice) throw httpError(404, 'Notice not found.');

  const existing = await prisma.noticeReaction.findFirst({
    where: { noticeId: notice.id, userId: req.user.id }
  });
  const requestedReaction = req.body && (req.body.reaction || req.body.type || req.body.emoji);
  let reacted;

  if (existing) {
    await prisma.noticeReaction.delete({ where: { id: existing.id } });
    reacted = false;
  } else {
    await prisma.noticeReaction.create({
      data: { noticeId: notice.id, userId: req.user.id, userName: req.user.name }
    });
    reacted = true;
  }

  const meta = await reactionMetaFor(tenant.id);
  const noticeMeta = { ...(meta[notice.id] || {}) };
  if (reacted) noticeMeta[req.user.id] = requestedReaction || 'like';
  else delete noticeMeta[req.user.id];
  await updateTenantJson(reactionMetaKey(), tenant.id, {}, (current) => ({
    ...(current && typeof current === 'object' ? current : {}),
    [notice.id]: noticeMeta
  }));

  const count = await prisma.noticeReaction.count({ where: { noticeId: notice.id } });
  return res.json({
    success: true,
    reacted,
    reaction: reacted ? noticeMeta[req.user.id] : null,
    reactionCount: count
  });
});

const addNoticeComment = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const notice = await prisma.notice.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!notice) throw httpError(404, 'Notice not found.');

  if (req.body.parentId) {
    const parent = await prisma.noticeComment.findFirst({
      where: { id: req.body.parentId, noticeId: notice.id }
    });
    if (!parent) throw httpError(400, 'The comment you are replying to does not exist.');
  }

  const comment = await prisma.noticeComment.create({
    data: {
      noticeId: notice.id,
      userId: req.user.id,
      userName: req.user.name,
      text: String(req.body.text).trim(),
      parentId: req.body.parentId || null
    }
  });
  return res.status(201).json({ success: true, message: 'Comment posted.', comment });
});

const listNoticeComments = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const notice = await prisma.notice.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!notice) throw httpError(404, 'Notice not found.');
  const comments = await prisma.noticeComment.findMany({
    where: { noticeId: notice.id },
    orderBy: { createdAt: 'asc' }
  });
  return res.json({ success: true, comments });
});

const deleteNotice = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const notice = await prisma.notice.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!notice) throw httpError(404, 'Notice not found.');
  if (notice.posterId !== req.user.id && !req.isSuperAdmin && normalizeRole(req.role) !== 'college_admin') {
    throw httpError(403, 'You can only delete notices you published.');
  }
  await prisma.notice.delete({ where: { id: notice.id } });
  return res.json({ success: true, message: 'Notice deleted.' });
});

// ---------------------------------------------------------------------------
// Timetable, calendar, lessons and faculty schedule
// ---------------------------------------------------------------------------
const CALENDAR_KEY = 'calendar_events';
const ORG_CALENDAR_KEY = 'org_calendar';
const LESSONS_KEY = 'lessons';
const FACULTY_SCHEDULE_KEY = 'faculty_schedule';

function monthRange(query) {
  if (query.from || query.to) {
    const from = query.from ? new Date(String(query.from)) : null;
    const to = query.to ? new Date(String(query.to)) : null;
    return { from, to };
  }
  if (query.month && /^\d{4}-\d{2}$/.test(String(query.month))) {
    const [year, month] = String(query.month).split('-').map(Number);
    return { from: new Date(Date.UTC(year, month - 1, 1)), to: new Date(Date.UTC(year, month, 1)) };
  }
  return { from: null, to: null };
}

function withinRange(dateValue, range) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date >= range.to) return false;
  return true;
}

const getCalendar = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const events = await getTenantJson(CALENDAR_KEY, tenant.id, []);
  const range = monthRange(req.query);
  const mine = (Array.isArray(events) ? events : []).filter(
    (event) => event.userId === req.user.id && withinRange(event.date, range)
  );
  return res.json({ success: true, count: mine.length, events: mine, calendar: mine });
});

const listCalendarEvents = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const events = await getTenantJson(CALENDAR_KEY, tenant.id, []);
  const range = monthRange(req.query);
  const mine = (Array.isArray(events) ? events : []).filter(
    (event) => event.userId === req.user.id && withinRange(event.date, range)
  );
  return res.json({ success: true, events: mine });
});

const createCalendarEvent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.body.title || !req.body.date) throw httpError(400, 'title and date are required.');
  const event = {
    id: randomUUID(),
    userId: req.user.id,
    title: String(req.body.title).trim(),
    description: req.body.description || '',
    date: new Date(req.body.date).toISOString(),
    startTime: req.body.startTime || null,
    endTime: req.body.endTime || null,
    type: req.body.type || 'personal',
    createdAt: new Date().toISOString()
  };
  const events = await getTenantJson(CALENDAR_KEY, tenant.id, []);
  const list = Array.isArray(events) ? [...events, event] : [event];
  await setTenantJson(CALENDAR_KEY, tenant.id, list);
  return res.status(201).json({ success: true, message: 'Event added.', event });
});

const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const events = await getTenantJson(CALENDAR_KEY, tenant.id, []);
  const list = Array.isArray(events) ? events : [];
  const target = list.find((event) => event.id === req.params.id);
  if (!target) throw httpError(404, 'Calendar event not found.');
  if (target.userId !== req.user.id && !req.isSuperAdmin) {
    throw httpError(403, 'You can only delete your own calendar events.');
  }
  await setTenantJson(
    CALENDAR_KEY,
    tenant.id,
    list.filter((event) => event.id !== req.params.id)
  );
  return res.json({ success: true, message: 'Event deleted.' });
});

const listOrgCalendar = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const events = await getTenantJson(ORG_CALENDAR_KEY, tenant.id, []);
  const range = monthRange(req.query);
  const filtered = (Array.isArray(events) ? events : []).filter((event) => withinRange(event.date, range));
  return res.json({ success: true, count: filtered.length, events: filtered, orgEvents: filtered });
});

const createOrgEvent = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  if (!req.body.title || !req.body.date) throw httpError(400, 'title and date are required.');
  const event = {
    id: randomUUID(),
    title: String(req.body.title).trim(),
    description: req.body.description || '',
    date: new Date(req.body.date).toISOString(),
    endDate: req.body.endDate ? new Date(req.body.endDate).toISOString() : null,
    startTime: req.body.startTime || null,
    endTime: req.body.endTime || null,
    category: req.body.category || 'Academic',
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };
  const events = await getTenantJson(ORG_CALENDAR_KEY, tenant.id, []);
  const list = Array.isArray(events) ? [...events, event] : [event];
  await setTenantJson(ORG_CALENDAR_KEY, tenant.id, list);
  return res.status(201).json({ success: true, message: 'Organisation event created.', event });
});

const updateOrgEvent = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const events = await getTenantJson(ORG_CALENDAR_KEY, tenant.id, []);
  const list = Array.isArray(events) ? [...events] : [];
  const index = list.findIndex((event) => event.id === req.params.id);
  if (index === -1) throw httpError(404, 'Organisation event not found.');
  const updated = { ...list[index], ...req.body, id: list[index].id, updatedAt: new Date().toISOString() };
  if (req.body.date) updated.date = new Date(req.body.date).toISOString();
  list[index] = updated;
  await setTenantJson(ORG_CALENDAR_KEY, tenant.id, list);
  return res.json({ success: true, message: 'Organisation event updated.', event: updated });
});

const deleteOrgEvent = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const events = await getTenantJson(ORG_CALENDAR_KEY, tenant.id, []);
  const list = Array.isArray(events) ? events : [];
  if (!list.some((event) => event.id === req.params.id)) {
    throw httpError(404, 'Organisation event not found.');
  }
  await setTenantJson(
    ORG_CALENDAR_KEY,
    tenant.id,
    list.filter((event) => event.id !== req.params.id)
  );
  return res.json({ success: true, message: 'Organisation event deleted.' });
});

async function routineForBatch(tenantId, batchId) {
  const routines = await prisma.routine.findMany({
    where: { tenantId, batchId },
    include: {
      periods: {
        orderBy: { periodNumber: 'asc' },
        include: {
          subject: { select: { id: true, name: true, code: true, type: true } },
          faculty: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return routines.sort((a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek));
}

const getBatchRoutine = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const batch = await prisma.batch.findFirst({
    where: { id: req.params.batchId, tenantId: tenant.id },
    include: { _count: { select: { routines: true } } }
  });
  if (!batch) throw httpError(404, 'Batch not found in this institution.');
  const routines = await routineForBatch(tenant.id, batch.id);
  return res.json({ success: true, batch, routines, routine: routines });
});

const saveBatchRoutine = asyncHandler(async (req, res) => {
  assertManager(req);
  const tenant = tenantOf(req);
  const batch = await prisma.batch.findFirst({ where: { id: req.params.batchId, tenantId: tenant.id } });
  if (!batch) throw httpError(404, 'Batch not found in this institution.');

  const days = Array.isArray(req.body.days)
    ? req.body.days
    : [{ dayOfWeek: req.body.dayOfWeek || 'Monday', periods: req.body.periods || [] }];

  const saved = [];
  for (const day of days) {
    if (!day.dayOfWeek) throw httpError(400, 'Each routine day needs a dayOfWeek value.');
    let routine = await prisma.routine.findFirst({
      where: { tenantId: tenant.id, batchId: batch.id, dayOfWeek: day.dayOfWeek }
    });
    if (!routine) {
      routine = await prisma.routine.create({
        data: { tenantId: tenant.id, batchId: batch.id, dayOfWeek: day.dayOfWeek }
      });
    }
    await prisma.routinePeriod.deleteMany({ where: { routineId: routine.id } });
    const periods = Array.isArray(day.periods) ? day.periods : [];
    for (const [index, period] of periods.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.routinePeriod.create({
        data: {
          routineId: routine.id,
          periodNumber: Number(period.periodNumber) || index + 1,
          subjectId: period.subjectId || null,
          facultyId: period.facultyId || null,
          startTime: period.startTime || null,
          endTime: period.endTime || null
        }
      });
    }
    saved.push(routine);
  }

  const routines = await routineForBatch(tenant.id, batch.id);
  return res.json({ success: true, message: 'Routine saved.', batch, routines, saved: saved.length });
});

const listLessons = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const lessons = await getTenantJson(LESSONS_KEY, tenant.id, []);
  const mine = (Array.isArray(lessons) ? lessons : []).filter((lesson) => lesson.userId === req.user.id);
  return res.json({ success: true, count: mine.length, lessons: mine });
});

const createLesson = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  if (!req.body.subjectId && !req.body.subject) {
    throw httpError(400, 'subjectId is required.');
  }
  let subjectName = req.body.subject || null;
  if (req.body.subjectId) {
    const subject = await prisma.subject.findFirst({
      where: { id: req.body.subjectId, tenantId: tenant.id },
      select: { id: true, name: true }
    });
    if (!subject) throw httpError(404, 'Subject not found in this institution.');
    subjectName = subject.name;
  }
  const lesson = {
    id: randomUUID(),
    userId: req.user.id,
    subjectId: req.body.subjectId || null,
    subjectName,
    week: req.body.week || null,
    topic: String(req.body.topic || 'Lesson').trim(),
    notes: req.body.notes || '',
    status: req.body.status || 'Planned',
    date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  const lessons = await getTenantJson(LESSONS_KEY, tenant.id, []);
  const list = Array.isArray(lessons) ? [...lessons, lesson] : [lesson];
  await setTenantJson(LESSONS_KEY, tenant.id, list);
  return res.status(201).json({ success: true, message: 'Lesson tracked.', lesson });
});

const facultySchedule = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const facultyId =
    req.query.facultyId && (req.isSuperAdmin || normalizeRole(req.role) === 'college_admin')
      ? String(req.query.facultyId)
      : req.user.id;

  const periods = await prisma.routinePeriod.findMany({
    where: { facultyId, routine: { tenantId: tenant.id } },
    include: {
      routine: { include: { batch: { select: { id: true, name: true, departmentId: true } } } },
      subject: { select: { id: true, name: true, code: true } }
    }
  });

  const overrides = await getTenantJson(FACULTY_SCHEDULE_KEY, tenant.id, []);
  const mine = (Array.isArray(overrides) ? overrides : []).filter((entry) => entry.facultyId === facultyId);

  return res.json({
    success: true,
    facultyId,
    schedule: periods.map((period) => ({
      id: period.id,
      dayOfWeek: period.routine ? period.routine.dayOfWeek : null,
      periodNumber: period.periodNumber,
      startTime: period.startTime,
      endTime: period.endTime,
      subject: period.subject,
      batch: period.routine ? period.routine.batch : null
    })),
    overrides: mine
  });
});

const addFacultySchedule = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const facultyId =
    req.body.facultyId && (req.isSuperAdmin || normalizeRole(req.role) === 'college_admin')
      ? String(req.body.facultyId)
      : req.user.id;
  const entry = {
    id: randomUUID(),
    facultyId,
    title: String(req.body.title || req.body.subject || 'Office hours').trim(),
    dayOfWeek: req.body.dayOfWeek || 'Monday',
    startTime: req.body.startTime || null,
    endTime: req.body.endTime || null,
    room: req.body.room || null,
    note: req.body.note || '',
    createdAt: new Date().toISOString()
  };
  const overrides = await getTenantJson(FACULTY_SCHEDULE_KEY, tenant.id, []);
  const list = Array.isArray(overrides) ? [...overrides, entry] : [entry];
  await setTenantJson(FACULTY_SCHEDULE_KEY, tenant.id, list);
  return res.status(201).json({ success: true, message: 'Schedule entry added.', entry });
});

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createStream,
  updateStreamConfig,
  deleteStream,
  listSubjects,
  createSubjects,
  updateSubject,
  deleteSubject,
  departmentOverview,
  listClassrooms,
  createClassroom,
  enrollClassroom,
  unenrollClassroom,
  deleteClassroom,
  listBatches,
  createBatch,
  enrollBatch,
  myBatches,
  batchStudents,
  updateBatch,
  deleteBatch,
  listNotices,
  noticesByType,
  createNotice,
  reactToNotice,
  addNoticeComment,
  listNoticeComments,
  deleteNotice,
  getCalendar,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  listOrgCalendar,
  createOrgEvent,
  updateOrgEvent,
  deleteOrgEvent,
  getBatchRoutine,
  saveBatchRoutine,
  listLessons,
  createLesson,
  facultySchedule,
  addFacultySchedule
};
