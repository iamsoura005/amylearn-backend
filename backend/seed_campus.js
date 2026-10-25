'use strict';

/**
 * AmyLearn demo campus seed (idempotent).
 *
 * Creates the Northbridge University demo tenant with the full demo roster:
 * platform admin + manager, campus admin, faculty, students, departments,
 * streams, subjects, batches, classrooms, routines, notices, an exam session,
 * library books and LMS modules. Safe to run repeatedly.
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('./config/prisma');

const log = (message) => {
  // eslint-disable-next-line no-console
  console.log(`[seed] ${message}`);
};

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function upsertUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return existing;
  return prisma.user.create({ data });
}

async function upsertMembership(userId, tenantId, role) {
  const existing = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } }
  });
  if (existing) return existing;
  return prisma.membership.create({ data: { userId, tenantId, role, status: 'active' } });
}

async function upsertTenant(data) {
  const existing = await prisma.tenant.findFirst({
    where: { OR: [{ name: data.name }, ...(data.collegeCode ? [{ collegeCode: data.collegeCode }] : [])] }
  });
  if (existing) return existing;
  return prisma.tenant.create({ data });
}

async function upsertDepartment(tenantId, name, code, headOfDepartment) {
  const existing = await prisma.department.findFirst({ where: { tenantId, name } });
  if (existing) return existing;
  return prisma.department.create({ data: { tenantId, name, code, headOfDepartment } });
}

async function upsertSubject(tenantId, departmentId, data) {
  const existing = await prisma.subject.findFirst({ where: { tenantId, code: data.code } });
  if (existing) return existing;
  return prisma.subject.create({ data: { tenantId, departmentId, ...data } });
}

async function runSeed() {
  log('Seeding AmyLearn demo campus…');

  // -------------------------------------------------------------------------
  // Platform accounts
  // -------------------------------------------------------------------------
  const platformAdmin = await upsertUser({
    email: 'admin.support@amylearn.app',
    amylearnId: 'ADM-0001',
    name: 'AmyLearn Platform Admin',
    password: await hash('amylearn@admin123'),
    role: 'it_admin',
    department: 'System Administration',
    college: null
  });
  await prisma.iTAdminProfile.upsert({
    where: { userId: platformAdmin.id },
    update: {},
    create: { userId: platformAdmin.id }
  });

  const platformManager = await upsertUser({
    email: 'manager.ops@amylearn.app',
    amylearnId: 'MGR-0001',
    name: 'AmyLearn Platform Manager',
    password: await hash('amylearn@mgr123'),
    role: 'it_user',
    department: 'IT Support',
    college: null
  });
  await prisma.iTUserProfile.upsert({
    where: { userId: platformManager.id },
    update: {},
    create: { userId: platformManager.id }
  });

  // -------------------------------------------------------------------------
  // Demo tenant
  // -------------------------------------------------------------------------
  const tenant = await upsertTenant({
    name: 'Northbridge University',
    type: 'college',
    subdomain: 'northbridge',
    collegeCode: 'NBR',
    location: 'India',
    category: 'University',
    featured: true,
    status: 'active',
    logoUrl: '/webdata/clg-logo/AmyLearn_demo.png'
  });
  log(`Tenant: ${tenant.name} (${tenant.collegeCode})`);

  // -------------------------------------------------------------------------
  // Departments & streams
  // -------------------------------------------------------------------------
  const departments = {};
  const departmentRows = [
    ['Computer Science & Engineering', 'CSE', 'Dr. Ananya Rao'],
    ['Electronics & Communication', 'ECE', 'Dr. Ravi Chandran'],
    ['Mechanical Engineering', 'ME', 'Dr. Suresh Patil'],
    ['Civil Engineering', 'CE', 'Dr. Lakshmi Menon'],
    ['AI & Data Science', 'AI&DS', 'Dr. Ananya Rao'],
    ['Electrical & Electronics', 'EEE', 'Dr. Vikram Iyer']
  ];
  for (const [name, code, head] of departmentRows) {
    departments[code] = await upsertDepartment(tenant.id, name, code, head);
  }
  log(`Departments: ${Object.keys(departments).length}`);

  for (const code of Object.keys(departments)) {
    const streamExists = await prisma.stream.findFirst({
      where: { departmentId: departments[code].id, name: `B.Tech ${code}` }
    });
    if (!streamExists) {
      await prisma.stream.create({
        data: {
          departmentId: departments[code].id,
          name: `B.Tech ${code}`,
          code,
          isConfigured: true,
          isLocked: true,
          curriculumType: 'Semester',
          totalTerms: 8,
          oddStartMonth: 'July',
          oddEndMonth: 'December',
          evenStartMonth: 'January',
          evenEndMonth: 'June'
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // Subjects (CSE focus + a few from other departments)
  // -------------------------------------------------------------------------
  const subjectRows = [
    // [dept, code, name, semester, credits, type]
    ['CSE', 'CS301', 'Data Structures & Algorithms', 3, 4, 'Theory'],
    ['CSE', 'CS302', 'Computer Organisation', 3, 3, 'Theory'],
    ['CSE', 'CS303', 'Discrete Mathematics', 3, 3, 'Theory'],
    ['CSE', 'CS351', 'Data Structures Lab', 3, 2, 'Practical'],
    ['CSE', 'CS501', 'Database Management Systems', 5, 4, 'Theory'],
    ['CSE', 'CS502', 'Operating Systems', 5, 3, 'Theory'],
    ['CSE', 'CS503', 'Computer Networks', 5, 3, 'Theory'],
    ['CSE', 'CS504', 'Machine Learning', 5, 4, 'Theory'],
    ['CSE', 'CS551', 'DBMS Lab', 5, 2, 'Practical'],
    ['AI&DS', 'AI501', 'Deep Learning Foundations', 5, 4, 'Theory'],
    ['ECE', 'EC501', 'Digital Signal Processing', 5, 4, 'Theory'],
    ['ME', 'ME501', 'Thermodynamics', 5, 4, 'Theory'],
    ['CE', 'CE501', 'Structural Analysis', 5, 4, 'Theory'],
    ['EEE', 'EE501', 'Power Systems', 5, 4, 'Theory']
  ];
  const subjects = {};
  for (const [deptCode, code, name, semester, credits, type] of subjectRows) {
    subjects[code] = await upsertSubject(tenant.id, departments[deptCode].id, {
      name,
      code,
      semester,
      credits,
      type,
      year: 2026,
      isActive: true
    });
  }
  log(`Subjects: ${Object.keys(subjects).length}`);

  // -------------------------------------------------------------------------
  // Campus accounts
  // -------------------------------------------------------------------------
  const campusAdmin = await upsertUser({
    email: 'admin.campus@amylearn.demo',
    amylearnId: 'NBR-CADM-0001',
    name: 'Campus Administrator',
    password: await hash('campus@admin123'),
    role: 'college_admin',
    department: 'Administration',
    college: tenant.name
  });
  await upsertMembership(campusAdmin.id, tenant.id, 'college_admin');
  await prisma.adminProfile.upsert({
    where: { userId: campusAdmin.id },
    update: { tenantId: tenant.id },
    create: { userId: campusAdmin.id, tenantId: tenant.id }
  });

  const faculty = await upsertUser({
    email: 'faculty.campus@amylearn.demo',
    amylearnId: 'NBR-FAC-0002',
    name: 'Prof. Karthik Subramanian',
    password: await hash('campus@faculty123'),
    role: 'faculty',
    department: 'Computer Science & Engineering',
    college: tenant.name
  });
  await upsertMembership(faculty.id, tenant.id, 'faculty');
  await prisma.facultyProfile.upsert({
    where: { userId: faculty.id },
    update: { tenantId: tenant.id, departmentId: departments.CSE.id },
    create: {
      userId: faculty.id,
      tenantId: tenant.id,
      employeeId: 'FAC-CSE-002',
      departmentId: departments.CSE.id,
      designation: 'Associate Professor'
    }
  });

  // -------------------------------------------------------------------------
  // Batches & students
  // -------------------------------------------------------------------------
  const batch = await prisma.batch.findFirst({ where: { tenantId: tenant.id, name: 'CSE 2024-2028' } });
  const cseBatch =
    batch ||
    (await prisma.batch.create({
      data: {
        tenantId: tenant.id,
        name: 'CSE 2024-2028',
        startYear: 2024,
        endYear: 2028,
        departmentId: departments.CSE.id
      }
    }));

  const studentRows = [
    ['NBR2024CS042', 'Aarav Sharma', 'aarav.sharma@student.nbr.edu'],
    ['NBR2024CS043', 'Diya Patel', 'diya.patel@student.nbr.edu'],
    ['NBR2024CS061', 'Rohan Kulkarni', 'rohan.kulkarni@student.nbr.edu']
  ];
  for (const [rollNumber, name, email] of studentRows) {
    // eslint-disable-next-line no-await-in-loop
    const student = await upsertUser({
      email,
      amylearnId: rollNumber,
      name,
      password: await hash('campus@student123'),
      role: 'student',
      department: 'Computer Science & Engineering',
      college: tenant.name
    });
    // eslint-disable-next-line no-await-in-loop
    await upsertMembership(student.id, tenant.id, 'student');
    // eslint-disable-next-line no-await-in-loop
    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: { tenantId: tenant.id, departmentId: departments.CSE.id, batchId: cseBatch.id },
      create: {
        userId: student.id,
        tenantId: tenant.id,
        rollNumber,
        departmentId: departments.CSE.id,
        batchId: cseBatch.id
      }
    });
  }
  log('Students: 3 seeded');

  // -------------------------------------------------------------------------
  // Classrooms
  // -------------------------------------------------------------------------
  const classroomRows = [
    ['LH-101', 'Main Block', 80],
    ['LH-204', 'Main Block', 60],
    ['CS-LAB-1', 'Computing Block', 40],
    ['CS-LAB-2', 'Computing Block', 40]
  ];
  for (const [roomNumber, building, capacity] of classroomRows) {
    const existing = await prisma.classroom.findFirst({ where: { tenantId: tenant.id, roomNumber } });
    if (!existing) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.classroom.create({ data: { tenantId: tenant.id, roomNumber, building, capacity } });
    }
  }
  log(`Classrooms: ${classroomRows.length}`);

  // -------------------------------------------------------------------------
  // Notices
  // -------------------------------------------------------------------------
  const noticeRows = [
    {
      type: 'staff',
      category: 'Announcement',
      title: 'Mid-semester examination schedule released',
      content:
        'The mid-semester examination schedule for Semester 5 is now available. Check your examination allocation under the COE section and reach out to your class mentor for any clashes.',
      department: null
    },
    {
      type: 'departmental',
      department: 'Computer Science & Engineering',
      category: 'Event',
      title: 'CSE TechFest 2026 registrations open',
      content:
        'Registrations for TechFest 2026 are open. Teams of up to four members can register in the department office before the end of the month.',
      department: 'Computer Science & Engineering'
    },
    {
      type: 'staff',
      category: 'Announcement',
      title: 'Library fine amnesty week',
      content:
        'The central library is running a fine amnesty week. Return overdue books this week to have pending fines waived.',
      department: null
    }
  ];
  for (const row of noticeRows) {
    const existing = await prisma.notice.findFirst({ where: { tenantId: tenant.id, title: row.title } });
    if (!existing) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.notice.create({
        data: {
          tenantId: tenant.id,
          type: row.type,
          department: row.department,
          category: row.category,
          posterId: campusAdmin.id,
          posterName: campusAdmin.name,
          posterRole: 'Campus Admin',
          title: row.title,
          content: row.content
        }
      });
    }
  }
  log(`Notices: ${noticeRows.length}`);

  // -------------------------------------------------------------------------
  // Exam session
  // -------------------------------------------------------------------------
  const sessionExists = await prisma.examSession.findFirst({
    where: { tenantId: tenant.id, name: 'Mid Semester Examination — Autumn 2026' }
  });
  if (!sessionExists) {
    await prisma.examSession.create({
      data: {
        tenantId: tenant.id,
        name: 'Mid Semester Examination — Autumn 2026',
        startDate: new Date('2026-11-16T00:00:00.000Z'),
        endDate: new Date('2026-11-28T00:00:00.000Z'),
        status: 'Upcoming'
      }
    });
  }

  // -------------------------------------------------------------------------
  // Library
  // -------------------------------------------------------------------------
  const libraryRows = [
    ['Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Computer Science'],
    ['Operating System Concepts', 'Abraham Silberschatz', '9781119456339', 'Computer Science'],
    ['Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'Computer Science'],
    ['Digital Signal Processing', 'Sanjit K. Mitra', '9780073380490', 'Electronics']
  ];
  for (const [title, author, isbn, category] of libraryRows) {
    const existingBook = await prisma.physicalBook.findFirst({ where: { tenantId: tenant.id, title } });
    if (!existingBook) {
      // eslint-disable-next-line no-await-in-loop
      const book = await prisma.physicalBook.create({
        data: { tenantId: tenant.id, title, author, isbn, category, baseId: `BK-${title.slice(0, 4).toUpperCase()}` }
      });
      // eslint-disable-next-line no-await-in-loop
      await prisma.bookCopy.createMany({
        data: [
          { bookId: book.id, copyId: `${isbn}-C1`, status: 'Available' },
          { bookId: book.id, copyId: `${isbn}-C2`, status: 'Available' }
        ]
      });
    }
  }
  log(`Library books: ${libraryRows.length}`);

  const digitalResources = [
    {
      title: 'DBMS Lecture Notes — Unit 1',
      author: 'Prof. Karthik Subramanian',
      department: 'Computer Science & Engineering',
      type: 'Notes',
      url: 'https://example.com/dbms-unit1.pdf',
      semester: 5,
      status: 'Approved'
    },
    {
      title: 'Operating Systems Previous Year Papers',
      author: 'CSE Department',
      department: 'Computer Science & Engineering',
      type: 'Papers',
      url: 'https://example.com/os-papers.pdf',
      semester: 5,
      status: 'Approved'
    }
  ];
  for (const row of digitalResources) {
    const existingResource = await prisma.digitalResource.findFirst({ where: { tenantId: tenant.id, title: row.title } });
    if (!existingResource) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.digitalResource.create({
        data: {
          tenantId: tenant.id,
          title: row.title,
          author: row.author,
          department: row.department,
          type: row.type,
          url: row.url,
          semester: row.semester,
          status: row.status,
          addedById: faculty.id
        }
      });
    }
  }
  log(`Digital resources: ${digitalResources.length}`);

  // -------------------------------------------------------------------------
  // LMS modules & content
  // -------------------------------------------------------------------------
  const lmsRows = [
    {
      subjectCode: 'CS501',
      module: 'Introduction to Databases',
      contents: [
        { title: 'What is a DBMS?', type: 'Video', url: 'https://res.cloudinary.com/demo/video/upload/v1/dbms-intro.mp4', duration: '12:40' },
        { title: 'ER Model Basics', type: 'Document', url: 'https://example.com/er-model.pdf', duration: null }
      ]
    },
    {
      subjectCode: 'CS502',
      module: 'Processes & Scheduling',
      contents: [
        { title: 'Process Lifecycle', type: 'Video', url: 'https://res.cloudinary.com/demo/video/upload/v1/os-processes.mp4', duration: '15:05' },
        { title: 'Scheduling Algorithms', type: 'Document', url: 'https://example.com/scheduling.pdf', duration: null }
      ]
    }
  ];
  for (const row of lmsRows) {
    const subject = subjects[row.subjectCode];
    if (!subject) continue;
    const existingModule = await prisma.classModule.findFirst({
      where: { subjectId: subject.id, title: row.module }
    });
    if (existingModule) continue;
    // eslint-disable-next-line no-await-in-loop
    const module = await prisma.classModule.create({
      data: { subjectId: subject.id, title: row.module, orderNumber: 1 }
    });
    for (const [index, content] of row.contents.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.classContent.create({
        data: {
          moduleId: module.id,
          title: content.title,
          type: content.type,
          url: content.url,
          duration: content.duration,
          createdAt: new Date(Date.now() + index * 1000)
        }
      });
    }
  }
  log('LMS modules: seeded');

  // -------------------------------------------------------------------------
  // Routine (one day for the CSE batch)
  // -------------------------------------------------------------------------
  const routineExists = await prisma.routine.findFirst({
    where: { tenantId: tenant.id, batchId: cseBatch.id, dayOfWeek: 'Monday' }
  });
  if (!routineExists) {
    const routine = await prisma.routine.create({
      data: { tenantId: tenant.id, batchId: cseBatch.id, dayOfWeek: 'Monday' }
    });
    const periods = [
      { subjectId: subjects.CS501.id, startTime: '09:00', endTime: '09:55' },
      { subjectId: subjects.CS502.id, startTime: '10:00', endTime: '10:55' },
      { subjectId: subjects.CS503.id, startTime: '11:00', endTime: '11:55' },
      { subjectId: subjects.CS551.id, startTime: '13:00', endTime: '14:55' }
    ];
    for (const [index, period] of periods.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.routinePeriod.create({
        data: {
          routineId: routine.id,
          periodNumber: index + 1,
          subjectId: period.subjectId,
          facultyId: faculty.id,
          startTime: period.startTime,
          endTime: period.endTime
        }
      });
    }
  }
  log('Routine: Monday seeded for CSE 2024-2028');

  log('Demo campus seed complete.');
  log('Platform admin: admin.support@amylearn.app / amylearn@admin123');
  log('Platform manager: manager.ops@amylearn.app / amylearn@mgr123');
  log('Campus admin: admin.campus@amylearn.demo / campus@admin123');
  log('Faculty: faculty.campus@amylearn.demo / campus@faculty123');
  log('Student: NBR2024CS042 / campus@student123');
}

module.exports = { runSeed };

if (require.main === module) {
  runSeed()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      // eslint-disable-next-line no-console
      console.error('[seed] Failed:', error.message);
      await prisma.$disconnect();
      process.exit(1);
    });
}
