'use strict';

const { z } = require('zod');

const email = z
  .string({ required_error: 'Email is required.' })
  .trim()
  .min(3)
  .max(254)
  .email('Enter a valid email address.');

const password = z
  .string({ required_error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(128);

const optionalString = (max = 255) => z.string().trim().max(max).optional().nullable();

const roleEnum = z.enum([
  'student',
  'faculty',
  'college_admin',
  'it_user',
  'it_admin',
  'amylearn_manager',
  'amylearn_admin',
  'campus_student',
  'campus_admin',
  'super_admin'
]);

const tenantRef = z.string().trim().min(1).max(120);

const checkEmailSchema = z.object({ email }).strict();

const sendVerificationSchema = z
  .object({
    email,
    name: optionalString(120)
  })
  .strict();

const verifyEmailSchema = z
  .object({
    email,
    code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be 6 digits.')
  })
  .strict();

const roleSignupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
    email,
    password,
    role: roleEnum.default('student'),
    collegeCode: tenantRef.optional(),
    tenantId: tenantRef.optional(),
    department: optionalString(120),
    rollNumber: optionalString(60),
    employeeId: optionalString(60),
    designation: optionalString(120),
    phone: optionalString(30)
  })
  .strict();

const signinSchema = z
  .object({
    email: z.string().trim().min(2, 'Enter your email or roll number.').max(254).optional(),
    identifier: z.string().trim().min(2).max(254).optional(),
    rollNumber: z.string().trim().min(2).max(254).optional(),
    password: z.string().min(1, 'Password is required.'),
    role: roleEnum.optional(),
    collegeCode: tenantRef.optional(),
    tenantId: tenantRef.optional()
  })
  .strict()
  .refine((data) => Boolean(data.email || data.identifier || data.rollNumber), {
    message: 'Email or roll number is required.',
    path: ['email']
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: password
  })
  .strict();

const tenantCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    collegeCode: z.string().trim().min(2).max(20).toUpperCase(),
    subdomain: z.string().trim().min(2).max(40).toLowerCase().optional().nullable(),
    type: z.enum(['college', 'individual']).optional(),
    location: optionalString(160),
    category: optionalString(80),
    logoUrl: optionalString(500),
    featured: z.boolean().optional(),
    status: z.enum(['active', 'suspended']).optional()
  })
  .strict();

const tenantUpdateSchema = tenantCreateSchema.partial().strict();

const idParamSchema = z.object({ id: z.string().trim().min(1) });

const departmentSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    code: optionalString(20),
    headOfDepartment: optionalString(120)
  })
  .strict();

const streamSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    code: optionalString(20),
    curriculumType: z.enum(['Semester', 'Trimester']).optional(),
    totalTerms: z.coerce.number().int().min(1).max(16).optional(),
    oddStartMonth: optionalString(20),
    oddEndMonth: optionalString(20),
    evenStartMonth: optionalString(20),
    evenEndMonth: optionalString(20)
  })
  .strict();

const streamConfigSchema = z
  .object({
    isConfigured: z.boolean().optional(),
    isLocked: z.boolean().optional(),
    curriculumType: z.enum(['Semester', 'Trimester']).optional(),
    totalTerms: z.coerce.number().int().min(1).max(16).optional(),
    oddStartMonth: optionalString(20),
    oddEndMonth: optionalString(20),
    evenStartMonth: optionalString(20),
    evenEndMonth: optionalString(20)
  })
  .strict();

const subjectSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    code: z.string().trim().min(2).max(30).toUpperCase(),
    type: optionalString(30),
    credits: z.coerce.number().int().min(0).max(20).optional(),
    semester: z.coerce.number().int().min(1).max(16),
    year: z.coerce.number().int().min(1).max(6).optional(),
    isActive: z.boolean().optional()
  })
  .strict();

const noticeSchema = z
  .object({
    type: z.enum(['staff', 'departmental']),
    title: z.string().trim().min(3).max(200),
    content: z.string().trim().min(3).max(20000),
    department: optionalString(160),
    category: optionalString(60)
  })
  .strict();

const commentSchema = z
  .object({
    text: z.string().trim().min(1).max(4000),
    parentId: optionalString(64)
  })
  .strict();

const chatSchema = z
  .object({
    message: z.string().trim().min(1, 'Message is required.').max(8000),
    context: z
      .object({
        userName: optionalString(120),
        classroomName: optionalString(160),
        subject: optionalString(160)
      })
      .partial()
      .optional(),
    mode: z.enum(['tutor', 'mindmap', 'default']).optional()
  })
  .strict();

const transcribeSchema = z
  .object({
    videoUrl: z.string().trim().url('Enter a valid video URL.')
  })
  .strict();

const leaveApplySchema = z
  .object({
    type: z.enum(['Casual', 'Medical', 'Earned', 'Maternity', 'Other']).default('Casual'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().min(3).max(4000)
  })
  .strict()
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date.',
    path: ['endDate']
  });

const leaveActionSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'approved', 'rejected']),
    note: optionalString(1000)
  })
  .strict();

const attendanceRecordSchema = z.object({
  studentId: z.string().trim().min(1),
  status: z.enum(['Present', 'Absent', 'Late']).default('Present')
});

const attendanceMarkSchema = z
  .object({
    batchId: z.string().trim().min(1),
    subjectId: z.string().trim().min(1),
    date: z.coerce.date().optional(),
    periodId: optionalString(64),
    records: z.array(attendanceRecordSchema).min(1, 'At least one attendance record is required.')
  })
  .strict();

const examFormSchema = z
  .object({
    studentId: z.string().trim().min(1).optional(),
    sessionId: z.string().trim().min(1),
    type: z.enum(['regular', 'backlog']).default('regular'),
    papers: z.array(z.string().trim().min(1)).default([]),
    subjects: z.array(z.string().trim().min(1)).optional(),
    feeAmount: z.coerce.number().min(0).optional(),
    paymentMode: optionalString(40),
    remarks: optionalString(1000)
  })
  .strict();

const feedbackSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    sessionId: optionalString(64),
    responses: z
      .array(
        z.object({
          subjectId: z.string().trim().min(1),
          rating: z.coerce.number().min(1).max(5),
          comments: optionalString(2000)
        })
      )
      .min(1)
  })
  .strict();

const checkoutSchema = z
  .object({
    copyId: z.string().trim().min(1),
    userId: optionalString(64),
    identifier: optionalString(120)
  })
  .strict();

const returnSchema = z.object({ copyId: z.string().trim().min(1) }).strict();

const digitalResourceSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    author: z.string().trim().min(2).max(160),
    department: z.string().trim().min(2).max(160),
    course: optionalString(160),
    type: optionalString(40),
    url: z.string().trim().url('Enter a valid resource URL.'),
    description: optionalString(2000),
    semester: z.coerce.number().int().min(1).max(16).optional()
  })
  .strict();

const credentialSchema = z
  .object({
    providerName: z.string().trim().min(2).max(160),
    loginId: z.string().trim().min(1).max(300),
    password: z.string().min(1).max(500),
    link: optionalString(500),
    note: optionalString(1000)
  })
  .strict();

module.exports = {
  z,
  email,
  password,
  roleEnum,
  optionalString,
  schemas: {
    checkEmail: checkEmailSchema,
    sendVerification: sendVerificationSchema,
    verifyEmail: verifyEmailSchema,
    roleSignup: roleSignupSchema,
    signin: signinSchema,
    changePassword: changePasswordSchema,
    tenantCreate: tenantCreateSchema,
    tenantUpdate: tenantUpdateSchema,
    idParam: idParamSchema,
    department: departmentSchema,
    stream: streamSchema,
    streamConfig: streamConfigSchema,
    subject: subjectSchema,
    notice: noticeSchema,
    comment: commentSchema,
    chat: chatSchema,
    transcribe: transcribeSchema,
    leaveApply: leaveApplySchema,
    leaveAction: leaveActionSchema,
    attendanceMark: attendanceMarkSchema,
    examForm: examFormSchema,
    feedback: feedbackSchema,
    checkout: checkoutSchema,
    returnBook: returnSchema,
    digitalResource: digitalResourceSchema,
    credential: credentialSchema
  }
};
