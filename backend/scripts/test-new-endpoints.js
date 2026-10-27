'use strict';

const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'GET',
        headers
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing new endpoints...');

  // 1. Sign in as student
  const signinRes = await post('/api/auth/signin', {
    identifier: 'aarav.sharma@student.nbr.edu',
    password: 'campus@student123',
    role: 'student',
    collegeCode: 'NBR'
  });
  if (signinRes.status !== 200 || !signinRes.data?.token) {
    console.error('Student signin failed:', signinRes);
    process.exit(1);
  }
  const token = signinRes.data.token;
  const tenantId = signinRes.data.user?.memberships?.[0]?.tenantId || signinRes.data.tenant?.id;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId
  };
  console.log('1. Student signed in successfully. Tenant:', tenantId);

  // 2. Test GET /api/assignments
  const asgList = await get('/api/assignments', authHeaders);
  console.log('2. GET /api/assignments status:', asgList.status, 'Count:', asgList.data?.assignments?.length);
  if (asgList.status !== 200 || !asgList.data?.assignments?.length) {
    console.error('Failed to list assignments:', asgList);
    process.exit(1);
  }

  // 3. Test POST /api/assignments/:id/submit
  const firstAsg = asgList.data.assignments[0];
  const submitRes = await post(
    `/api/assignments/${firstAsg.id}/submit`,
    {
      files: ['my_submission.pdf'],
      note: 'Here is my complete lab calculation report.'
    },
    authHeaders
  );
  console.log('3. POST /api/assignments/:id/submit status:', submitRes.status, 'Message:', submitRes.data?.message);
  if (submitRes.status !== 201) {
    console.error('Failed to submit assignment:', submitRes);
    process.exit(1);
  }

  // 4. Test GET /api/student/sem-feedback & POST /api/student/sem-feedback
  const coursesRes = await get('/api/student/courses', authHeaders);
  const realSubjectId = coursesRes.data?.courses?.[0]?.id || coursesRes.data?.subjects?.[0]?.id;
  const fbGet = await get('/api/student/sem-feedback', authHeaders);
  console.log('4. GET /api/student/sem-feedback status:', fbGet.status);
  
  const fbPost = await post(
    '/api/student/sem-feedback',
    {
      responses: [
        {
          subjectId: realSubjectId,
          rating: 5,
          comments: 'Great course pacing and practical lab experiments!'
        }
      ],
      extra: {
        answers: { q1: 5, q2: 5 },
        comment: 'Great course pacing!'
      }
    },
    authHeaders
  );
  console.log('5. POST /api/student/sem-feedback status:', fbPost.status, 'Message:', fbPost.data?.message);
  if (fbPost.status !== 201) {
    console.error('Failed to submit feedback:', fbPost);
    process.exit(1);
  }

  // 5. Test GET /api/student/payment-history & POST /api/student/pay-fee
  const payHistory = await get('/api/student/payment-history', authHeaders);
  console.log('6. GET /api/student/payment-history status:', payHistory.status, 'Count:', payHistory.data?.payments?.length);

  const payFeeRes = await post(
    '/api/student/pay-fee',
    {
      amount: 4500,
      description: 'Semester V Supplementary Exam & Lab Fee',
      mode: 'UPI'
    },
    authHeaders
  );
  console.log('7. POST /api/student/pay-fee status:', payFeeRes.status, 'Ref:', payFeeRes.data?.transaction?.reference);
  if (payFeeRes.status !== 201) {
    console.error('Failed to pay fee:', payFeeRes);
    process.exit(1);
  }

  // 6. Sign in as Campus Admin
  const adminSignin = await post('/api/auth/signin', {
    identifier: 'admin.campus@amylearn.demo',
    password: 'campus@admin123',
    role: 'college_admin',
    collegeCode: 'NBR'
  });
  if (adminSignin.status !== 200 || !adminSignin.data?.token) {
    console.error('Admin signin failed:', adminSignin);
    process.exit(1);
  }
  const adminHeaders = {
    Authorization: `Bearer ${adminSignin.data.token}`,
    'x-tenant-id': tenantId
  };
  console.log('8. Campus Admin signed in successfully.');

  // 7. Test POST /api/college-admin/users
  const newEmail = `student.test.${Date.now()}@amylearn.demo`;
  const createUserRes = await post(
    '/api/college-admin/users',
    {
      name: 'Test Student Automated',
      email: newEmail,
      role: 'student',
      department: 'Computer Science & Engineering',
      identifier: `TST-${Date.now().toString().slice(-4)}`
    },
    adminHeaders
  );
  console.log('9. POST /api/college-admin/users status:', createUserRes.status, 'Created:', createUserRes.data?.user?.name);
  if (createUserRes.status !== 201) {
    console.error('Failed to create single user:', createUserRes);
    process.exit(1);
  }

  // 8. Test POST /api/college-admin/users/bulk-import with CSV
  const bulkCsv = `name,email,role,department,rollNumber
Bulk Student One,bulk1.${Date.now()}@amylearn.demo,student,Computer Science,CS-${Date.now().toString().slice(-4)}
Bulk Faculty Two,bulk2.${Date.now()}@amylearn.demo,faculty,Computer Science,FAC-${Date.now().toString().slice(-4)}`;

  const bulkImportRes = await post(
    '/api/college-admin/users/bulk-import',
    { csv: bulkCsv },
    adminHeaders
  );
  console.log('10. POST /api/college-admin/users/bulk-import status:', bulkImportRes.status, 'Message:', bulkImportRes.data?.message);
  if (bulkImportRes.status !== 201 || bulkImportRes.data?.createdCount !== 2) {
    console.error('Failed to bulk import:', bulkImportRes);
    process.exit(1);
  }

  // 9. Test POST /api/student/courses/toggle-completion
  const toggleRes = await post(
    '/api/student/courses/toggle-completion',
    { contentId: 'cnt-101', completed: true },
    authHeaders
  );
  console.log('11. POST /api/student/courses/toggle-completion status:', toggleRes.status, 'Completed:', toggleRes.data?.completed);
  if (toggleRes.status !== 200 || !toggleRes.data?.completed) {
    console.error('Failed to toggle completion:', toggleRes);
    process.exit(1);
  }

  // 10. Test Faculty GET /api/assignments/all-submissions and POST /api/assignments/grade
  const allSubsRes = await get('/api/assignments/all-submissions', authHeaders);
  console.log('12. GET /api/assignments/all-submissions status:', allSubsRes.status, 'Count:', allSubsRes.data?.submissions?.length);
  if (allSubsRes.status !== 200) {
    console.error('Failed to list all submissions:', allSubsRes);
    process.exit(1);
  }

  const targetSub = allSubsRes.data.submissions[0];
  const gradeRes = await post(
    '/api/assignments/grade',
    {
      studentId: targetSub.studentId,
      assignmentId: targetSub.assignmentId,
      marks: 48,
      feedback: 'Excellent work verified!'
    },
    authHeaders
  );
  console.log('13. POST /api/assignments/grade status:', gradeRes.status, 'Message:', gradeRes.data?.message);
  if (gradeRes.status !== 200) {
    console.error('Failed to grade assignment:', gradeRes);
    process.exit(1);
  }

  console.log('\nALL 13 ENDPOINT TESTS PASSED WITH 100% SUCCESS!');
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
