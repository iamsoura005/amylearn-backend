'use strict';

const crypto = require('crypto');
const { prisma } = require('../config/prisma');
const { normalizeRole } = require('../config/systemRoles');
const { asyncHandler, httpError, daysBetween, numberOrZero, startOfDay } = require('../utils/apiHelpers');
const { encrypt, decrypt, maskSecret } = require('../utils/crypto');
const { requireTenant, requireAuthenticatedUser } = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');

const LOAN_DAYS = 14;
const FINE_PER_DAY = 10;

function tenantOf(req) {
  requireAuthenticatedUser(req);
  return requireTenant(req);
}

function staffOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

function librarianOf(req) {
  return req.isSuperAdmin || ['college_admin', 'faculty'].includes(normalizeRole(req.role));
}

function fineForCopy(copy, now = new Date()) {
  if (!copy || copy.status !== 'Issued' || !copy.dueDate) return 0;
  const overdue = Math.max(0, daysBetween(new Date(copy.dueDate), now));
  return overdue * FINE_PER_DAY;
}

function decorateCopy(copy) {
  if (!copy) return null;
  const daysOverdue = copy.status === 'Issued' && copy.dueDate
    ? Math.max(0, daysBetween(new Date(copy.dueDate), new Date()))
    : 0;
  return {
    ...copy,
    daysOverdue,
    fine: daysOverdue * FINE_PER_DAY
  };
}

async function resolveUserByIdentifier(tenantId, identifier) {
  if (!identifier) return null;
  const value = String(identifier).trim();
  return prisma.user.findFirst({
    where: {
      memberships: { some: { tenantId, status: 'active' } },
      OR: [
        { id: value },
        { email: value.toLowerCase() },
        { amylearnId: value },
        { studentProfiles: { some: { rollNumber: value } } }
      ]
    }
  });
}

// ---------------------------------------------------------------------------
// Digital resources
// ---------------------------------------------------------------------------
const listDigital = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const where = { tenantId: tenant.id };
  if (!staffOf(req)) where.status = 'Approved';
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.department) where.department = String(req.query.department);
  if (req.query.semester) where.semester = Number(req.query.semester);

  const resources = await prisma.digitalResource.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { addedBy: { select: { id: true, name: true } } }
  });

  const credentials = staffOf(req) ? await prisma.libraryCredential.findMany({ where: { tenantId: tenant.id } }) : [];
  const vault = credentials.map((credential) => ({
    id: credential.id,
    providerName: credential.providerName,
    loginId: maskSecret(decrypt(credential.loginId)),
    passwordMasked: maskSecret(decrypt(credential.password)),
    link: credential.link,
    note: credential.note,
    updatedAt: credential.updatedAt
  }));

  return res.json({ success: true, count: resources.length, resources, credentials: vault });
});

const addDigitalResource = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const title = String(req.body.title || '').trim();
  const url = String(req.body.url || '').trim();
  if (!title || !url) throw httpError(400, 'title and url are required.');

  const resource = await prisma.digitalResource.create({
    data: {
      tenantId: tenant.id,
      title,
      author: req.body.author || req.user.name,
      department: req.body.department || req.user.department || 'General',
      course: req.body.course || null,
      type: req.body.type || 'Notes',
      url,
      description: req.body.description || null,
      semester: req.body.semester ? Number(req.body.semester) : 1,
      status: staffOf(req) ? (req.body.status || 'Approved') : 'Pending',
      addedById: req.user.id,
      deleteAfter: req.body.deleteAfter ? new Date(req.body.deleteAfter) : null
    }
  });

  return res.status(201).json({
    success: true,
    message: staffOf(req) ? 'Digital resource published.' : 'Digital resource submitted for review.',
    resource
  });
});

const updateDigitalResourceStatus = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only staff can review digital resources.');
  const tenant = tenantOf(req);
  const resource = await prisma.digitalResource.findFirst({
    where: { id: req.params.id, tenantId: tenant.id }
  });
  if (!resource) throw httpError(404, 'Digital resource not found.');

  const status = String(req.body.status || 'Approved');
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    throw httpError(400, 'Status must be Approved, Rejected or Pending.');
  }
  const updated = await prisma.digitalResource.update({
    where: { id: resource.id },
    data: { status }
  });
  return res.json({ success: true, message: `Resource ${status.toLowerCase()}.`, resource: updated });
});

const updateDigitalResource = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const resource = await prisma.digitalResource.findFirst({
    where: { id: req.params.id, tenantId: tenant.id }
  });
  if (!resource) throw httpError(404, 'Digital resource not found.');
  if (!staffOf(req) && resource.addedById !== req.user.id) {
    throw httpError(403, 'You can only edit your own submissions.');
  }

  const updated = await prisma.digitalResource.update({
    where: { id: resource.id },
    data: {
      ...(req.body.title ? { title: String(req.body.title).trim() } : {}),
      ...(req.body.url ? { url: String(req.body.url).trim() } : {}),
      ...(req.body.author !== undefined ? { author: req.body.author } : {}),
      ...(req.body.department !== undefined ? { department: req.body.department } : {}),
      ...(req.body.course !== undefined ? { course: req.body.course } : {}),
      ...(req.body.type !== undefined ? { type: req.body.type } : {}),
      ...(req.body.description !== undefined ? { description: req.body.description } : {}),
      ...(req.body.semester !== undefined ? { semester: Number(req.body.semester) } : {})
    }
  });
  return res.json({ success: true, message: 'Resource updated.', resource: updated });
});

const deleteDigitalResource = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const resource = await prisma.digitalResource.findFirst({
    where: { id: req.params.id, tenantId: tenant.id }
  });
  if (!resource) throw httpError(404, 'Digital resource not found.');
  if (!staffOf(req) && resource.addedById !== req.user.id) {
    throw httpError(403, 'You can only delete your own submissions.');
  }
  await prisma.digitalResource.delete({ where: { id: resource.id } });
  return res.json({ success: true, message: 'Resource removed.' });
});

// ---------------------------------------------------------------------------
// Vault credentials (AES-256-GCM, never returned raw)
// ---------------------------------------------------------------------------
const upsertCredential = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only staff can manage library credentials.');
  const tenant = tenantOf(req);
  const providerName = String(req.body.providerName || '').trim();
  if (!providerName) throw httpError(400, 'providerName is required.');

  const existing = await prisma.libraryCredential.findFirst({
    where: { tenantId: tenant.id, providerName }
  });

  const data = {
    loginId: req.body.loginId !== undefined ? encrypt(String(req.body.loginId)) : existing ? existing.loginId : encrypt(''),
    password: req.body.password !== undefined ? encrypt(String(req.body.password)) : existing ? existing.password : encrypt(''),
    link: req.body.link !== undefined ? req.body.link : existing ? existing.link : null,
    note: req.body.note !== undefined ? req.body.note : existing ? existing.note : null,
    updatedAt: new Date()
  };

  const credential = existing
    ? await prisma.libraryCredential.update({ where: { id: existing.id }, data })
    : await prisma.libraryCredential.create({ data: { tenantId: tenant.id, providerName, ...data } });

  return res.json({
    success: true,
    message: existing ? 'Credential updated.' : 'Credential stored.',
    credential: {
      id: credential.id,
      providerName: credential.providerName,
      loginId: maskSecret(decrypt(credential.loginId)),
      passwordMasked: maskSecret(decrypt(credential.password)),
      link: credential.link,
      note: credential.note,
      updatedAt: credential.updatedAt
    }
  });
});

const deleteCredential = asyncHandler(async (req, res) => {
  if (!staffOf(req)) throw httpError(403, 'Only staff can manage library credentials.');
  const tenant = tenantOf(req);
  const providerName = String(req.body.providerName || req.query.providerName || '').trim();
  const id = req.body.id || req.params.id || null;

  const where = id
    ? { id: String(id), tenantId: tenant.id }
    : providerName
      ? { tenantId: tenant.id, providerName }
      : null;
  if (!where) throw httpError(400, 'Provide a credential id or providerName.');

  const credential = await prisma.libraryCredential.findFirst({ where });
  if (!credential) throw httpError(404, 'Credential not found.');
  await prisma.libraryCredential.delete({ where: { id: credential.id } });
  return res.json({ success: true, message: 'Credential removed.' });
});

// ---------------------------------------------------------------------------
// Physical circulation
// ---------------------------------------------------------------------------
const listPhysical = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const where = { tenantId: tenant.id };
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.search) {
    where.OR = [
      { title: { contains: String(req.query.search) } },
      { author: { contains: String(req.query.search) } },
      { isbn: { contains: String(req.query.search) } }
    ];
  }

  const books = await prisma.physicalBook.findMany({
    where,
    orderBy: { title: 'asc' },
    include: {
      copies: {
        orderBy: { copyId: 'asc' },
        include: { issuedTo: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  return res.json({
    success: true,
    count: books.length,
    books: books.map((book) => ({
      ...book,
      copies: book.copies.map((copy) => decorateCopy(copy)),
      availableCopies: book.copies.filter((copy) => copy.status === 'Available').length,
      totalCopies: book.copies.length
    }))
  });
});

const physicalUser = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const user = await resolveUserByIdentifier(tenant.id, req.params.identifier);
  if (!user) throw httpError(404, 'No member matches this identifier.');
  if (!staffOf(req) && user.id !== req.user.id) {
    throw httpError(403, 'You can only view your own loans.');
  }

  const copies = await prisma.bookCopy.findMany({
    where: { issuedToId: user.id },
    include: { book: true },
    orderBy: { dueDate: 'asc' }
  });

  const loans = copies.map((copy) => decorateCopy(copy));
  return res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    loans,
    count: loans.length,
    totalFine: loans.reduce((sum, loan) => sum + numberOrZero(loan.fine), 0)
  });
});

const copyDetails = asyncHandler(async (req, res) => {
  const tenant = tenantOf(req);
  const copy = await prisma.bookCopy.findUnique({
    where: { copyId: req.params.copyId },
    include: { book: true, issuedTo: { select: { id: true, name: true, email: true } } }
  });
  if (!copy) throw httpError(404, 'Book copy not found.');
  const book = await prisma.physicalBook.findFirst({ where: { id: copy.bookId, tenantId: tenant.id } });
  if (!book) throw httpError(403, 'This copy does not belong to your institution.');
  return res.json({ success: true, copy: decorateCopy(copy) });
});

const checkout = asyncHandler(async (req, res) => {
  if (!librarianOf(req)) throw httpError(403, 'Only staff can check out books.');
  const tenant = tenantOf(req);
  const copyRef = req.body.copyId || req.params.copyId;
  if (!copyRef) throw httpError(400, 'copyId is required.');

  const copy = await prisma.bookCopy.findUnique({ where: { copyId: String(copyRef) } });
  if (!copy) throw httpError(404, 'Book copy not found.');
  const book = await prisma.physicalBook.findFirst({ where: { id: copy.bookId, tenantId: tenant.id } });
  if (!book) throw httpError(403, 'This copy does not belong to your institution.');
  if (copy.status === 'Issued') throw httpError(409, 'This copy is already issued.');

  const borrower = await resolveUserByIdentifier(tenant.id, req.body.userId || req.body.identifier || req.body.issuedToId);
  if (!borrower) throw httpError(404, 'Borrower not found in this institution.');

  const issuedDate = new Date();
  const dueDate = new Date(issuedDate.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);
  const updated = await prisma.bookCopy.update({
    where: { id: copy.id },
    data: { status: 'Issued', issuedToId: borrower.id, issuedDate, dueDate }
  });

  return res.json({
    success: true,
    message: `Book issued to ${borrower.name}. Due in ${LOAN_DAYS} days.`,
    copy: decorateCopy({ ...updated, book }),
    dueDate,
    loanDays: LOAN_DAYS
  });
});

const returnBook = asyncHandler(async (req, res) => {
  if (!librarianOf(req)) throw httpError(403, 'Only staff can process returns.');
  const tenant = tenantOf(req);
  const copyRef = req.body.copyId || req.params.copyId;
  if (!copyRef) throw httpError(400, 'copyId is required.');

  const copy = await prisma.bookCopy.findUnique({
    where: { copyId: String(copyRef) },
    include: { book: true, issuedTo: { select: { id: true, name: true, email: true } } }
  });
  if (!copy) throw httpError(404, 'Book copy not found.');
  const book = await prisma.physicalBook.findFirst({ where: { id: copy.bookId, tenantId: tenant.id } });
  if (!book) throw httpError(403, 'This copy does not belong to your institution.');
  if (copy.status !== 'Issued') throw httpError(409, 'This copy is not currently issued.');

  const fine = fineForCopy(copy);
  const updated = await prisma.bookCopy.update({
    where: { id: copy.id },
    data: { status: 'Available', issuedToId: null, issuedDate: null, dueDate: null }
  });

  if (fine > 0 && copy.issuedTo && copy.issuedTo.email) {
    await emailService.sendOverdueBookEmail({
      email: copy.issuedTo.email,
      name: copy.issuedTo.name,
      bookTitle: copy.book ? copy.book.title : 'Library book',
      dueDate: copy.dueDate,
      daysOverdue: Math.max(0, daysBetween(new Date(copy.dueDate), new Date())),
      fine
    });
  }

  return res.json({
    success: true,
    message: fine > 0 ? `Book returned. Overdue fine: ₹${fine}.` : 'Book returned on time.',
    fine,
    copy: { ...updated, book: copy.book }
  });
});

const deleteCopy = asyncHandler(async (req, res) => {
  if (!librarianOf(req)) throw httpError(403, 'Only staff can remove book copies.');
  const tenant = tenantOf(req);
  const copy = await prisma.bookCopy.findUnique({ where: { copyId: req.params.copyId } });
  if (!copy) throw httpError(404, 'Book copy not found.');
  const book = await prisma.physicalBook.findFirst({ where: { id: copy.bookId, tenantId: tenant.id } });
  if (!book) throw httpError(403, 'This copy does not belong to your institution.');
  await prisma.bookCopy.delete({ where: { id: copy.id } });
  return res.json({ success: true, message: 'Book copy removed.' });
});

// ---------------------------------------------------------------------------
// Overdue scan (used by the cron cleanup endpoint)
// ---------------------------------------------------------------------------
async function scanOverdueBooks() {
  const now = new Date();
  const overdue = await prisma.bookCopy.findMany({
    where: { status: 'Issued', dueDate: { lt: now } },
    include: { book: true, issuedTo: { select: { id: true, name: true, email: true } } }
  });
  let alertsSent = 0;
  for (const copy of overdue) {
    if (!copy.issuedTo || !copy.issuedTo.email) continue;
    const daysOverdue = Math.max(0, daysBetween(new Date(copy.dueDate), now));
    const fine = daysOverdue * FINE_PER_DAY;
    // eslint-disable-next-line no-await-in-loop
    const result = await emailService.sendOverdueBookEmail({
      email: copy.issuedTo.email,
      name: copy.issuedTo.name,
      bookTitle: copy.book ? copy.book.title : 'Library book',
      dueDate: copy.dueDate,
      daysOverdue,
      fine
    });
    if (result && result.success) alertsSent += 1;
  }
  return { overdue, alertsSent };
}

module.exports = {
  listDigital,
  addDigitalResource,
  updateDigitalResourceStatus,
  updateDigitalResource,
  deleteDigitalResource,
  upsertCredential,
  deleteCredential,
  listPhysical,
  physicalUser,
  copyDetails,
  checkout,
  returnBook,
  deleteCopy,
  scanOverdueBooks,
  fineForCopy,
  LOAN_DAYS,
  FINE_PER_DAY
};
