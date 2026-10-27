'use strict';

const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError } = require('../utils/apiHelpers');
const { getTenantJson, setTenantJson } = require('../utils/systemConfig');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');

const COMPLETIONS_KEY = 'lms_completions';
const DOWNLOAD_KEY = 'lms_download';

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function staffOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

async function readCompletions(tenantId) {
  const stored = await getTenantJson(COMPLETIONS_KEY, tenantId, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

async function writeCompletions(tenantId, map) {
  await setTenantJson(COMPLETIONS_KEY, tenantId, map);
}

async function readDownloadToggles(tenantId) {
  const stored = await getTenantJson(DOWNLOAD_KEY, tenantId, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

async function writeDownloadToggles(tenantId, map) {
  await setTenantJson(DOWNLOAD_KEY, tenantId, map);
}

function decorateContent(content, completedIds, downloadToggles) {
  return {
    ...content,
    completed: completedIds.has(content.id),
    downloadable: downloadToggles[content.id] !== false,
    downloadEnabled: downloadToggles[content.id] !== false
  };
}

// ---------------------------------------------------------------------------
// GET /api/all-subjects
// ---------------------------------------------------------------------------
const allSubjects = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const subjects = await prisma.subject.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: [{ semester: 'asc' }, { code: 'asc' }]
  });
  return res.json({ success: true, count: subjects.length, subjects });
});

// ---------------------------------------------------------------------------
// GET|POST /api/classrooms/:id/modules  (id = subject id)
// ---------------------------------------------------------------------------
const listModules = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!subject) {
    const classroom = await prisma.classroom.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
    if (classroom) {
      return res.json({ success: true, subject: null, modules: [], message: 'This room has no course modules.' });
    }
    throw httpError(404, 'Course not found in this institution.');
  }

  const completions = await readCompletions(tenant.id);
  const completedIds = new Set((completions && completions[req.user.id]) || []);
  const downloadToggles = await readDownloadToggles(tenant.id);

  const modules = await prisma.classModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { orderNumber: 'asc' },
    include: { contents: { orderBy: { createdAt: 'asc' } } }
  });

  return res.json({
    success: true,
    subject,
    modules: modules.map((module) => ({
      ...module,
      contents: module.contents.map((content) => decorateContent(content, completedIds, downloadToggles))
    }))
  });
});

const createModule = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can create course modules.');
  const tenant = tenantOf(req);
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, tenantId: tenant.id } });
  if (!subject) throw httpError(404, 'Course not found in this institution.');
  if (!req.body.title) throw httpError(400, 'title is required.');

  const module = await prisma.classModule.create({
    data: {
      subjectId: subject.id,
      title: String(req.body.title).trim(),
      description: req.body.description || null,
      orderNumber: req.body.orderNumber ? Number(req.body.orderNumber) : 1
    }
  });
  return res.status(201).json({ success: true, message: 'Course module created.', module });
});

// ---------------------------------------------------------------------------
// GET|POST /api/modules/:moduleId/content
// ---------------------------------------------------------------------------
const listContent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const module = await prisma.classModule.findUnique({
    where: { id: req.params.moduleId },
    include: { contents: { orderBy: { createdAt: 'asc' } } }
  });
  if (!module) throw httpError(404, 'Module not found.');
  const subject = await prisma.subject.findFirst({ where: { id: module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This module does not belong to your institution.');

  const completions = await readCompletions(tenant.id);
  const completedIds = new Set((completions && completions[req.user.id]) || []);
  const downloadToggles = await readDownloadToggles(tenant.id);

  return res.json({
    success: true,
    module: { ...module, contents: undefined },
    contents: module.contents.map((content) => decorateContent(content, completedIds, downloadToggles))
  });
});

const createContent = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can add module content.');
  const tenant = tenantOf(req);
  const module = await prisma.classModule.findUnique({ where: { id: req.params.moduleId } });
  if (!module) throw httpError(404, 'Module not found.');
  const subject = await prisma.subject.findFirst({ where: { id: module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This module does not belong to your institution.');
  if (!req.body.title || !req.body.url) throw httpError(400, 'title and url are required.');

  const content = await prisma.classContent.create({
    data: {
      moduleId: module.id,
      title: String(req.body.title).trim(),
      type: req.body.type || 'Video',
      url: String(req.body.url).trim(),
      duration: req.body.duration || null
    }
  });
  return res.status(201).json({ success: true, message: 'Module content added.', content });
});

// ---------------------------------------------------------------------------
// GET /api/content/:id
// ---------------------------------------------------------------------------
const getContent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const content = await prisma.classContent.findUnique({
    where: { id: req.params.id },
    include: { module: true }
  });
  if (!content) throw httpError(404, 'Content not found.');
  const subject = await prisma.subject.findFirst({ where: { id: content.module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This content does not belong to your institution.');

  const completions = await readCompletions(tenant.id);
  const completedIds = new Set((completions && completions[req.user.id]) || []);
  const downloadToggles = await readDownloadToggles(tenant.id);

  return res.json({ success: true, content: decorateContent(content, completedIds, downloadToggles) });
});

// ---------------------------------------------------------------------------
// PUT /api/content/:id/toggle-download
// ---------------------------------------------------------------------------
const toggleDownload = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can change download permissions.');
  const tenant = tenantOf(req);
  const content = await prisma.classContent.findUnique({ where: { id: req.params.id }, include: { module: true } });
  if (!content) throw httpError(404, 'Content not found.');
  const subject = await prisma.subject.findFirst({ where: { id: content.module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This content does not belong to your institution.');

  const toggles = await readDownloadToggles(tenant.id);
  const requested = req.body.downloadable === undefined ? toggles[content.id] === false : Boolean(req.body.downloadable);
  toggles[content.id] = requested;
  await writeDownloadToggles(tenant.id, toggles);

  return res.json({ success: true, message: `Downloads ${requested ? 'enabled' : 'disabled'} for this content.`, content: { ...content, downloadable: requested } });
});

// ---------------------------------------------------------------------------
// POST /api/content/:id/complete
// ---------------------------------------------------------------------------
const completeContent = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const content = await prisma.classContent.findUnique({ where: { id: req.params.id }, include: { module: true } });
  if (!content) throw httpError(404, 'Content not found.');
  const subject = await prisma.subject.findFirst({ where: { id: content.module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This content does not belong to your institution.');

  const completions = await readCompletions(tenant.id);
  const mine = new Set((completions && completions[req.user.id]) || []);
  const completed = req.body.completed === undefined ? !mine.has(content.id) : Boolean(req.body.completed);
  if (completed) mine.add(content.id);
  else mine.delete(content.id);
  completions[req.user.id] = Array.from(mine);
  await writeCompletions(tenant.id, completions);

  return res.json({
    success: true,
    message: completed ? 'Marked as completed.' : 'Marked as not completed.',
    content: decorateContent(content, mine, await readDownloadToggles(tenant.id))
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/content/:id
// ---------------------------------------------------------------------------
const deleteContent = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only faculty and administrators can delete content.');
  const tenant = tenantOf(req);
  const content = await prisma.classContent.findUnique({ where: { id: req.params.id }, include: { module: true } });
  if (!content) throw httpError(404, 'Content not found.');
  const subject = await prisma.subject.findFirst({ where: { id: content.module.subjectId, tenantId: tenant.id } });
  if (!subject) throw httpError(403, 'This content does not belong to your institution.');

  await prisma.classContent.delete({ where: { id: content.id } });
  return res.json({ success: true, message: 'Content deleted.' });
});

module.exports = {
  allSubjects,
  listModules,
  createModule,
  listContent,
  createContent,
  getContent,
  toggleDownload,
  completeContent,
  deleteContent
};
