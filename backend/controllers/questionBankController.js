'use strict';

const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { getTenantJson, setTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const { uploadBuffer, isCloudinaryConfigured } = require('../utils/cloudinaryHelper');

const QUESTIONS_KEY = 'question_bank';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function staffOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

async function readQuestions(tenantId) {
  const stored = await getTenantJson(QUESTIONS_KEY, tenantId, []);
  return Array.isArray(stored) ? stored : [];
}

// POST /api/coe/upload-question  (multipart: file, or JSON metadata)
const uploadQuestion = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can upload questions.');
  const tenant = tenantOf(req);

  const subjectId = req.body.subjectId || req.body.subject || null;
  let subject = null;
  if (subjectId) {
    subject = await prisma.subject.findFirst({ where: { id: String(subjectId), tenantId: tenant.id } });
    if (!subject) throw httpError(404, 'Subject not found in this institution.');
  }

  const title = String(req.body.title || (req.file ? req.file.originalname : '')).trim();
  if (!title) throw httpError(400, 'Provide a title or attach a file.');

  let fileUrl = req.body.url || null;
  let publicId = null;
  if (req.file && req.file.buffer && isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadBuffer(req.file.buffer, {
        folder: `amylearn/questions/${tenant.id}`,
        resourceType: 'raw',
        filename: req.file.originalname
      });
      fileUrl = uploaded.secure_url;
      publicId = uploaded.public_id;
    } catch (error) {
      // Metadata is still useful even when storage is unavailable.
      fileUrl = fileUrl || null;
    }
  }

  const question = {
    id: crypto.randomUUID(),
    tenantId: tenant.id,
    title,
    subjectId: subject ? subject.id : null,
    subjectName: subject ? subject.name : req.body.subjectName || null,
    subjectCode: subject ? subject.code : req.body.subjectCode || null,
    department: req.body.department || (subject ? subject.departmentId : null),
    semester: req.body.semester ? Number(req.body.semester) : subject ? subject.semester : null,
    examType: req.body.examType || req.body.type || 'End Semester',
    year: req.body.year || null,
    difficulty: req.body.difficulty || 'Mixed',
    solutionUrl: req.body.solutionUrl || null,
    notes: req.body.notes || null,
    fileName: req.file ? req.file.originalname : null,
    mimeType: req.file ? req.file.mimetype : null,
    fileSize: req.file ? req.file.size : null,
    fileUrl,
    publicId,
    uploadedBy: req.user.id,
    uploadedByName: req.user.name,
    createdAt: new Date().toISOString()
  };

  const questions = await readQuestions(tenant.id);
  questions.push(question);
  await setTenantJson(QUESTIONS_KEY, tenant.id, questions);

  return res.status(201).json({
    success: true,
    message: 'Question paper added to the question bank.',
    question,
    stored: Boolean(fileUrl)
  });
});

// GET /api/coe/questions
const listQuestions = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  let questions = await readQuestions(tenant.id);
  if (req.query.subjectId) questions = questions.filter((entry) => entry.subjectId === String(req.query.subjectId));
  if (req.query.department) questions = questions.filter((entry) => entry.department === String(req.query.department));
  if (req.query.semester) questions = questions.filter((entry) => Number(entry.semester) === Number(req.query.semester));
  if (req.query.examType) {
    const type = String(req.query.examType).toLowerCase();
    questions = questions.filter((entry) => String(entry.examType).toLowerCase() === type);
  }
  if (req.query.search) {
    const search = String(req.query.search).toLowerCase();
    questions = questions.filter(
      (entry) =>
        String(entry.title || '').toLowerCase().includes(search) ||
        String(entry.subjectName || '').toLowerCase().includes(search)
    );
  }
  questions = questions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return res.json({ success: true, count: questions.length, questions, items: questions });
});

// DELETE /api/coe/question/:id
const deleteQuestion = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can delete questions.');
  const tenant = tenantOf(req);
  const questions = await readQuestions(tenant.id);
  const target = questions.find((entry) => entry.id === req.params.id);
  if (!target) throw httpError(404, 'Question paper not found.');
  if (
    target.uploadedBy !== req.user.id &&
    !req.isSuperAdmin &&
    normalizeRole(req.role) !== 'college_admin'
  ) {
    throw httpError(403, 'You can only delete question papers you uploaded.');
  }
  await setTenantJson(
    QUESTIONS_KEY,
    tenant.id,
    questions.filter((entry) => entry.id !== target.id)
  );
  return res.json({ success: true, message: 'Question paper removed.' });
});

module.exports = { uploadQuestion, listQuestions, deleteQuestion, readQuestions, QUESTIONS_KEY };
