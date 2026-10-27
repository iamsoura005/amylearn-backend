'use strict';

const { prisma } = require('../config/prisma');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { getTenantJson, setTenantJson, updateTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const crypto = require('crypto');

const ASSIGNMENTS_KEY = 'course_assignments';
const SUBMISSIONS_KEY = 'assignment_submissions';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_ASSIGNMENTS = [
  {
    id: 'asg-cn-01',
    code: 'CS-501',
    course: 'Computer Networks',
    title: 'Subnetting & CIDR Analysis',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalMarks: 25,
    instructions: 'Calculate the subnets for 192.168.10.0/24 with 4 equal subnets. Include broadcast addresses and valid host ranges in a PDF document.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asg-dbms-02',
    code: 'CS-502',
    course: 'Database Management Systems',
    title: 'B+ Tree Indexing Simulation',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalMarks: 30,
    instructions: 'Implement node splitting and merging for degree-4 B+ tree with trace logs.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asg-os-03',
    code: 'CS-503',
    course: 'Operating Systems',
    title: 'Kernel Scheduler Comparison',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalMarks: 20,
    instructions: 'Benchmark CFS vs Round Robin scheduler latency under synthetic multi-threaded load.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asg-se-04',
    code: 'CS-504',
    course: 'Software Engineering',
    title: 'Microservices Architecture Spec',
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalMarks: 50,
    instructions: 'Submit C4 architecture diagrams and OpenAPI contract for the campus bookstore service.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

async function getOrSeedAssignments(tenantId) {
  let list = await getTenantJson(ASSIGNMENTS_KEY, tenantId, null);
  if (!list || !Array.isArray(list) || list.length === 0) {
    list = DEFAULT_ASSIGNMENTS;
    await setTenantJson(ASSIGNMENTS_KEY, tenantId, list);
  }
  return list;
}

// GET /api/assignments
const listAssignments = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const assignments = await getOrSeedAssignments(tenant.id);
  const submissionsMap = await getTenantJson(SUBMISSIONS_KEY, tenant.id, {});
  
  const studentSubmissions = submissionsMap[req.user.id] || {};

  const decorated = assignments.map((asg) => {
    const sub = studentSubmissions[asg.id];
    let status = 'Pending';
    if (sub) {
      status = sub.status || 'Submitted';
    } else {
      const due = new Date(asg.dueDate).getTime();
      if (Date.now() > due) {
        status = 'Overdue';
      }
    }

    return {
      id: asg.id,
      code: asg.code,
      course: asg.course,
      title: asg.title,
      dueDate: asg.dueDate,
      total: asg.totalMarks,
      instructions: asg.instructions,
      status,
      marks: sub ? sub.marks : null,
      submittedAt: sub ? sub.submittedAt : null,
      files: sub ? sub.files : [],
      note: sub ? sub.note : null,
      feedback: sub ? sub.feedback : null
    };
  });

  return res.json({
    success: true,
    count: decorated.length,
    assignments: decorated
  });
});

// POST /api/assignments/:id/submit
const submitAssignment = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const assignmentId = req.params.id;
  const assignments = await getOrSeedAssignments(tenant.id);
  const target = assignments.find((a) => a.id === assignmentId);
  if (!target) {
    throw httpError(404, 'Assignment not found in this institution.');
  }

  const { files, note } = req.body;
  if (!Array.isArray(files) || files.length === 0) {
    throw httpError(400, 'Attach at least one file to submit this assignment.');
  }

  const submissionEntry = {
    assignmentId,
    studentId: req.user.id,
    studentName: req.user.name,
    submittedAt: new Date().toISOString(),
    status: 'Submitted',
    files: files.map((f) => (typeof f === 'string' ? { name: f, url: f } : f)),
    note: note ? String(note).trim() : null,
    marks: null,
    feedback: null
  };

  await updateTenantJson(SUBMISSIONS_KEY, tenant.id, {}, (current) => {
    const map = current && typeof current === 'object' ? { ...current } : {};
    if (!map[req.user.id]) map[req.user.id] = {};
    map[req.user.id][assignmentId] = submissionEntry;
    return map;
  });

  return res.status(201).json({
    success: true,
    message: `Assignment "${target.title}" submitted successfully!`,
    submission: submissionEntry
  });
});

// POST /api/assignments (faculty / admin creation)
const createAssignment = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const { title, course, code, dueDate, totalMarks, instructions } = req.body;
  if (!title || !course) {
    throw httpError(400, 'title and course are required.');
  }

  const newAssignment = {
    id: `asg-${Date.now()}`,
    title: String(title).trim(),
    course: String(course).trim(),
    code: code ? String(code).trim().toUpperCase() : 'GEN-101',
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalMarks: totalMarks ? Number(totalMarks) : 25,
    instructions: instructions || 'Follow course guidelines and submit your report.',
    createdAt: new Date().toISOString()
  };

  await updateTenantJson(ASSIGNMENTS_KEY, tenant.id, DEFAULT_ASSIGNMENTS, (current) => {
    const list = Array.isArray(current) ? [...current] : [];
    list.unshift(newAssignment);
    return list;
  });

  return res.status(201).json({
    success: true,
    message: 'Assignment created successfully.',
    assignment: newAssignment
  });
});

// GET /api/assignments/all-submissions (faculty view)
const listAllSubmissions = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const submissionsMap = await getTenantJson(SUBMISSIONS_KEY, tenant.id, {});
  const assignments = await getOrSeedAssignments(tenant.id);

  const all = [];
  Object.entries(submissionsMap).forEach(([studentId, subs]) => {
    Object.values(subs || {}).forEach((sub) => {
      const asg = assignments.find((a) => a.id === sub.assignmentId) || {};
      all.push({
        ...sub,
        course: asg.course,
        assignmentTitle: asg.title,
        totalMarks: asg.totalMarks
      });
    });
  });

  return res.json({
    success: true,
    count: all.length,
    submissions: all
  });
});

// POST /api/assignments/grade (faculty grading)
const gradeSubmission = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const { studentId, assignmentId, marks, feedback } = req.body;
  if (!studentId || !assignmentId || marks === undefined) {
    throw httpError(400, 'studentId, assignmentId, and marks are required.');
  }

  let updated = null;
  await updateTenantJson(SUBMISSIONS_KEY, tenant.id, {}, (current) => {
    const map = current && typeof current === 'object' ? { ...current } : {};
    if (map[studentId] && map[studentId][assignmentId]) {
      map[studentId][assignmentId].marks = Number(marks);
      map[studentId][assignmentId].feedback = feedback || null;
      map[studentId][assignmentId].status = 'Graded';
      map[studentId][assignmentId].gradedAt = new Date().toISOString();
      updated = map[studentId][assignmentId];
    }
    return map;
  });

  if (!updated) {
    throw httpError(404, 'Submission not found to grade.');
  }

  return res.json({
    success: true,
    message: 'Submission graded successfully.',
    submission: updated
  });
});

module.exports = {
  listAssignments,
  submitAssignment,
  createAssignment,
  listAllSubmissions,
  gradeSubmission
};
