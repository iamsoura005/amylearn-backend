const q = (value) => encodeURIComponent(value ?? '');

export const AUTH = {
  CHECK_EMAIL: '/api/auth/check-email',
  SEND_VERIFICATION: '/api/auth/send-verification',
  VERIFY_EMAIL: '/api/auth/verify-email',
  ROLE_SIGNUP: '/api/auth/role-signup',
  SIGNIN: '/api/auth/signin',
  SIGNOUT: '/api/auth/signout',
  VERIFY_TOKEN: '/api/auth/verify-token',
  PUBLIC_COLLEGES: '/api/auth/public/colleges',
  CHANGE_PASSWORD: '/api/auth/change-password'
};

export const IT_ADMIN = {
  LOGIN: '/it-admin/login',
  SIGNOUT: '/it-admin/signout',
  COLLEGES: '/it-admin/colleges',
  COLLEGE_STATUS: (id) => `/it-admin/colleges/${q(id)}/status`,
  COLLEGE: (id) => `/it-admin/colleges/${q(id)}`,
  COLLEGE_REQUESTS: '/it-admin/college-requests',
  MANAGER_REQUESTS: '/it-admin/manager-requests',
  USERS: '/it-admin/users',
  TENANTS_LIST: '/it-admin/tenants-list',
  MENU_CONFIG: (tenantId) => `/it-admin/menu-config/${q(tenantId)}`,
  MENU_CONFIG_SAVE: '/it-admin/menu-config',
  COLLEGE_ADMINS: (id) => `/it-admin/colleges/${q(id)}/admins`,
  COLLEGE_ADMIN: (id, userId) => `/it-admin/colleges/${q(id)}/admins/${q(userId)}`,
  GLOBAL_ROLES: '/it-admin/global-roles',
  GLOBAL_ROLE: (key) => `/it-admin/global-roles/${q(key)}`,
  CUSTOM_ROLES: (id) => `/it-admin/colleges/${q(id)}/custom-roles`,
  CUSTOM_ROLE_LABEL: (id, roleKey) => `/it-admin/colleges/${q(id)}/custom-roles/${q(roleKey)}/label`,
  CUSTOM_ROLE: (id, roleKey) => `/it-admin/colleges/${q(id)}/custom-roles/${q(roleKey)}`
};

export const SESSION = {
  INFO: '/session/info',
  MENU: '/session/menu'
};

export const CAMPUS_ADMIN = {
  SETTINGS: '/api/college-admin/settings',
  MY_ROLES: '/api/college-admin/my-roles',
  AVAILABLE_ROLES: '/api/college-admin/available-roles',
  ADMIN_ROLES: '/api/college-admin/admin-roles',
  REQUESTS: '/api/college-admin/requests',
  REQUEST_ACTION: (id, action) => `/api/college-admin/requests/${q(id)}/${q(action)}`,
  USERS: (role) => `/api/college-admin/users/${q(role)}`,
  USER_STATUS: (id) => `/api/college-admin/users/${q(id)}/status`,
  USER: (id) => `/api/college-admin/users/${q(id)}`,
  FEES: '/api/college-admin/fees',
  MARKS: '/api/college-admin/marks'
};

export const STUDENT = {
  DASHBOARD: '/api/student/dashboard',
  COURSES: '/api/student/courses',
  ADMIT_CARD: '/api/student/admit-card',
  FEES: '/api/student/fees',
  EXAM_FORM: '/api/student/exam-form',
  SEM_FEEDBACK: '/api/student/sem-feedback',
  PROJECT_INFO: '/api/student/project-info',
  PAYMENT_HISTORY: '/api/student/payment-history'
};

export const AI = {
  CHAT: '/api/ai/chat',
  SUMMARIZE_FILE: '/api/ai/summarize-file',
  TRANSCRIBE_VIDEO: '/api/ai/transcribe-video'
};

export const ACADEMIC = {
  DEPARTMENTS: '/api/departments',
  DEPARTMENT: (id) => `/api/departments/${q(id)}`,
  STREAMS: (deptId) => `/api/departments/${q(deptId)}/streams`,
  STREAM_CONFIG: (deptId, streamId) => `/api/departments/${q(deptId)}/streams/${q(streamId)}/config`,
  STREAM: (deptId, streamId) => `/api/departments/${q(deptId)}/streams/${q(streamId)}`,
  SUBJECTS: (deptId) => `/api/departments/${q(deptId)}/subjects`,
  SUBJECT: (id) => `/api/departments/subjects/${q(id)}`,
  OVERVIEW: (id) => `/api/departments/${q(id)}/overview`
};

export const CLASSROOMS = {
  BASE: '/api/classrooms',
  ENROLL: (id) => `/api/classrooms/${q(id)}/enroll`,
  UNENROLL: (id) => `/api/classrooms/${q(id)}/unenroll`,
  BY_ID: (id) => `/api/classrooms/${q(id)}`
};

export const BATCHES = {
  BASE: '/api/batches',
  ENROLL: (batchId) => `/api/batches/${q(batchId)}/enroll`,
  MY: '/api/batches/my-batches',
  STUDENTS: (batchId) => `/api/batches/${q(batchId)}/students`,
  BY_ID: (id) => `/api/batches/${q(id)}`
};

export const NOTICES = {
  BASE: '/api/notices',
  BY_TYPE: (type) => `/api/notices/${q(type)}`,
  REACT: (id) => `/api/notices/${q(id)}/react`,
  COMMENTS: (id) => `/api/notices/${q(id)}/comments`,
  BY_ID: (id) => `/api/notices/${q(id)}`
};

export const COE = {
  SESSIONS: '/api/coe/sessions/all',
  SESSION: '/api/coe/session',
  SESSION_BY_ID: (id) => `/api/coe/session/${q(id)}`,
  ELIGIBILITY: (studentId) => `/api/coe/student/eligibility/${q(studentId)}`,
  SUBMIT_FORM_STUDENT: '/api/coe/student/submit-form',
  ALLOCATION_STUDENT: (studentId) => `/api/coe/allocation/student/${q(studentId)}`,
  ALLOCATION_BATCH: (batchId) => `/api/coe/allocation/batch/${q(batchId)}`,
  ALLOCATION: '/api/coe/allocation',
  UPLOAD_QUESTION: '/api/coe/upload-question',
  QUESTIONS: '/api/coe/questions',
  QUESTION: (id) => `/api/coe/question/${q(id)}`,
  ACTIVE_SESSION: '/api/coe/active-session',
  SUBMIT_EXAM_FORM: '/api/coe/submit-exam-form',
  MY_FORMS: (studentId) => `/api/coe/my-forms/${q(studentId)}`,
  UPLOAD_MARKS: '/api/coe/upload-marks',
  PUBLISH_RESULTS: '/api/coe/publish-results',
  RESULTS: (rollNo) => `/api/coe/results/${q(rollNo)}`,
  MY_RESULTS: '/api/coe/my-results',
  STUDENT_RESULTS: (userId) => `/api/coe/student/results/${q(userId)}`,
  ADMIN_EXAM_FORMS: '/api/coe/admin/exam-forms',
  ADMIN_SEMESTER_FEES: '/api/coe/admin/semester-fees',
  ADMIN_EXAM_STATUS: '/api/coe/admin/exam-status',
  ADMIN_RESET_FORM: (formId) => `/api/coe/admin/reset-form/${q(formId)}`,
  FEEDBACK_DATA: (userId) => `/api/coe/student/feedback-data/${q(userId)}`,
  SUBMIT_FEEDBACK: '/api/coe/student/submit-feedback',
  ADMIT_CARD: (studentUserId) => `/api/coe/admit-card/${q(studentUserId)}`,
  UPDATE_FORM_PAYMENT: (id) => `/api/coe/student/update-form-payment/${q(id)}`,
  PAYMENT_HISTORY: (userId) => `/api/coe/student/payment-history/${q(userId)}`
};

export const SYSTEM = {
  FEATURES: '/api/features',
  DASHBOARD_MENU: '/api/dashboard/menu'
};

export const LEAVE = {
  APPLY: '/api/leave/apply',
  FACULTY: '/api/leave/faculty',
  HISTORY: (userId) => `/api/leave/history/${q(userId)}`,
  ADMIN_REQUESTS: '/api/leave/admin/requests',
  ACTION: (id) => `/api/leave/admin/action/${q(id)}`
};

export const TIMETABLE = {
  CALENDAR: '/api/calendar',
  EVENTS: '/api/calendar/events',
  EVENT: (id) => `/api/calendar/events/${q(id)}`,
  ORG_CALENDAR: '/api/calendar/org',
  ORG_EVENT: (id) => `/api/calendar/org/${q(id)}`,
  ROUTINE: (batchId) => `/api/routine/batch/${q(batchId)}`,
  LESSONS: '/api/lessons',
  FACULTY_SCHEDULE: '/api/faculty/schedule'
};

export const LMS = {
  ALL_SUBJECTS: '/api/all-subjects',
  MODULES: (classroomId) => `/api/classrooms/${q(classroomId)}/modules`,
  CONTENT: (moduleId) => `/api/modules/${q(moduleId)}/content`,
  CONTENT_BY_ID: (id) => `/api/content/${q(id)}`,
  TOGGLE_DOWNLOAD: (id) => `/api/content/${q(id)}/toggle-download`,
  COMPLETE: (id) => `/api/content/${q(id)}/complete`,
  DELETE_CONTENT: (id) => `/api/content/${q(id)}`
};

export const LIBRARY = {
  DIGITAL: '/api/library/digital',
  DIGITAL_RESOURCE: '/api/library/digital/resource',
  DIGITAL_STATUS: (id) => `/api/library/digital/resource/${q(id)}/status`,
  DIGITAL_CREDENTIAL: '/api/library/digital/credential',
  DIGITAL_BY_ID: (id) => `/api/library/digital/resource/${q(id)}`,
  PHYSICAL: '/api/library/physical',
  PHYSICAL_USER: (identifier) => `/api/library/physical/user/${q(identifier)}`,
  PHYSICAL_COPY: (copyId) => `/api/library/physical/copy/${q(copyId)}`,
  CHECKOUT: '/api/library/physical/checkout',
  RETURN: '/api/library/physical/return',
  DELETE_COPY: (copyId) => `/api/library/physical/copy/${q(copyId)}`
};

export const ATTENDANCE = {
  FACULTY_INIT: '/api/attendance/faculty/init',
  REPORT: '/api/attendance/report',
  MY_RECORDS: '/api/attendance/my-records',
  MY_ATTENDANCE: '/api/attendance/my-attendance',
  MARK: '/api/attendance/mark',
  WEEKLY_REPORTS: '/api/attendance/weekly-reports',
  GENERATE_WEEKLY: '/api/attendance/weekly-reports/generate'
};

export const QUESTION_BANK = {
  UPLOAD: '/api/coe/upload-question',
  LIST: '/api/coe/questions',
  DELETE: (id) => `/api/coe/question/${q(id)}`
};

export default {
  AUTH,
  IT_ADMIN,
  SESSION,
  CAMPUS_ADMIN,
  STUDENT,
  AI,
  ACADEMIC,
  CLASSROOMS,
  BATCHES,
  NOTICES,
  COE,
  SYSTEM,
  LEAVE,
  TIMETABLE,
  LMS,
  LIBRARY,
  ATTENDANCE,
  QUESTION_BANK
};
