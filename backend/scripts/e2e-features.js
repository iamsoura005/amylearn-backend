'use strict';

/**
 * `npm run e2e` — feature-level end-to-end pass against a running, seeded
 * backend. Exercises notices, attendance, LMS completion, library checkout /
 * return with fines, leave workflow and the COE eligibility surface.
 */

const axios = require('axios');

const BASE = process.env.E2E_BASE || 'http://localhost:4000';
const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const api = axios.create({ baseURL: BASE, timeout: 10000, validateStatus: () => true });
const auth = (token, tenant = 'NBR') => ({
  Authorization: `Bearer ${token}`,
  'x-tenant-id': tenant
});

async function signin(identifier, password, collegeCode) {
  const { data } = await api.post('/api/auth/signin', { email: identifier, password, collegeCode });
  return data.token;
}

async function main() {
  // Health gate
  let healthy = false;
  try {
    const { data } = await api.get('/health?db=true');
    healthy = data && data.db && data.db.ok;
  } catch (error) {
    healthy = false;
  }
  if (!healthy) {
    // eslint-disable-next-line no-console
    console.error('[e2e] Backend or database is not available. Run `npm run dev-db`, seed, then `npm run dev`.');
    process.exit(1);
  }

  const studentToken = await signin('NBR2024CS042', 'campus@student123', 'NBR');
  const facultyToken = await signin('faculty.campus@amylearn.demo', 'campus@faculty123', 'NBR');
  const adminToken = await signin('admin.campus@amylearn.demo', 'campus@admin123', 'NBR');
  record('sign in as student / faculty / admin', Boolean(studentToken && facultyToken && adminToken));

  // --- Notices -----------------------------------------------------------
  try {
    const { data, status } = await api.get('/api/notices', { headers: auth(studentToken) });
    record('notices: list', status === 200 && data.success, `count=${data.count}`);
  } catch (error) {
    record('notices: list', false, error.message);
  }

  let noticeId = null;
  try {
    const { data, status } = await api.post(
      '/api/notices',
      { type: 'departmental', department: 'Computer Science & Engineering', category: 'Announcement', title: 'E2E smoke notice', content: 'Posted by the e2e suite.' },
      { headers: auth(adminToken) }
    );
    noticeId = data.notice && data.notice.id;
    record('notices: create (admin)', status === 201 && Boolean(noticeId));
  } catch (error) {
    record('notices: create (admin)', false, error.message);
  }

  if (noticeId) {
    try {
      const { status } = await api.patch(`/api/notices/${noticeId}/react`, {}, { headers: auth(studentToken) });
      record('notices: react (student)', status === 200);
    } catch (error) {
      record('notices: react (student)', false, error.message);
    }
    try {
      const { status } = await api.post(`/api/notices/${noticeId}/comments`, { text: 'Understood, thank you.' }, { headers: auth(studentToken) });
      record('notices: comment (student)', status === 200 || status === 201);
    } catch (error) {
      record('notices: comment (student)', false, error.message);
    }
  }

  // --- Attendance --------------------------------------------------------
  let subjectId = null;
  try {
    const { data } = await api.get('/api/attendance/faculty/init', { headers: auth(facultyToken) });
    const batch = (data.batches || [])[0];
    subjectId = batch && (batch.subjects || [])[0] && (batch.subjects || [])[0].id;
    record('attendance: faculty init', data.success === true && Boolean(subjectId), `batches=${(data.batches || []).length}`);
  } catch (error) {
    record('attendance: faculty init', false, error.message);
  }

  if (subjectId) {
    try {
      const { data, status } = await api.get('/api/attendance/faculty/init', { headers: auth(facultyToken) });
      const batch = (data.batches || [])[0];
      const students = (data.students || []).slice(0, 1).map((student) => ({ studentId: student.id, status: 'Present' }));
      const marked = await api.post(
        '/api/attendance/mark',
        { batchId: batch.id, subjectId, date: new Date().toISOString(), records: students },
        { headers: auth(facultyToken) }
      );
      record('attendance: mark', marked.status === 201 && marked.data.success, `records=${marked.data.attendance && marked.data.attendance.records.length}`);
    } catch (error) {
      record('attendance: mark', false, error.message);
    }
  }

  // --- LMS ---------------------------------------------------------------
  try {
    const { data, status } = await api.get('/api/all-subjects', { headers: auth(studentToken) });
    record('lms: all-subjects', status === 200 && data.success, `count=${data.count}`);
  } catch (error) {
    record('lms: all-subjects', false, error.message);
  }

  // --- Library -----------------------------------------------------------
  let copyId = null;
  try {
    const { data } = await api.get('/api/library/physical', { headers: auth(studentToken) });
    const available = (data.books || []).flatMap((book) => (book.copies || []).filter((copy) => copy.status === 'Available'));
    copyId = available[0] && available[0].copyId;
    record('library: physical list', data.success === true && Boolean(copyId), `books=${(data.books || []).length}`);
  } catch (error) {
    record('library: physical list', false, error.message);
  }

  if (copyId) {
    try {
      const { data, status } = await api.post(
        '/api/library/physical/checkout',
        { copyId, userId: 'NBR2024CS042' },
        { headers: auth(adminToken) }
      );
      const dueDate = data.dueDate;
      record('library: checkout', status === 200 && Boolean(dueDate), `due=${dueDate}`);
    } catch (error) {
      record('library: checkout', false, error.message);
    }
    try {
      const { data, status } = await api.post('/api/library/physical/return', { copyId }, { headers: auth(adminToken) });
      record('library: return', status === 200 && data.success, `fine=${data.fine}`);
    } catch (error) {
      record('library: return', false, error.message);
    }
  }

  // --- Leave -------------------------------------------------------------
  try {
    const { data, status } = await api.post(
      '/api/leave/apply',
      { type: 'Casual', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), reason: 'E2E smoke leave' },
      { headers: auth(facultyToken) }
    );
    record('leave: apply (faculty)', status === 201 && data.success, `status=${data.application && data.application.status}`);
  } catch (error) {
    record('leave: apply (faculty)', false, error.message);
  }

  try {
    const { data, status } = await api.get('/api/leave/admin/requests', { headers: auth(adminToken) });
    record('leave: admin requests', status === 200 && data.success, `count=${data.count}`);
  } catch (error) {
    record('leave: admin requests', false, error.message);
  }

  // --- COE ---------------------------------------------------------------
  try {
    const { data, status } = await api.get('/api/coe/student/eligibility/NBR2024CS042', { headers: auth(adminToken) });
    record('coe: eligibility', status === 200 && data.success, `semester=${data.semester}`);
  } catch (error) {
    record('coe: eligibility', false, error.message);
  }

  try {
    const { data, status } = await api.get('/api/coe/sessions/all', { headers: auth(studentToken) });
    record('coe: sessions', status === 200 && data.success, `count=${data.count}`);
  } catch (error) {
    record('coe: sessions', false, error.message);
  }

  const failed = results.filter((result) => !result.ok);
  // eslint-disable-next-line no-console
  console.log(`\n${results.length - failed.length}/${results.length} e2e checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[e2e] Harness failed:', error.message);
  process.exit(1);
});
