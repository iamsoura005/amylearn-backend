'use strict';

const { toFrontendRole } = require('./systemRoles');

/**
 * Master menu catalogue. Each entry is rendered as a sidebar/tab item and can be
 * hidden or relabelled per tenant through SystemConfig menu overrides.
 */
const MASTER_FEATURES = Object.freeze({
  student: [
    {
      key: 'courses',
      title: 'Courses',
      icon: 'BookOpen',
      description: 'Semester subjects, lecture modules and learning material.'
    },
    {
      key: 'assignments',
      title: 'Assignments',
      icon: 'ClipboardList',
      description: 'Pending submissions, due dates and faculty feedback.'
    },
    {
      key: 'attendance',
      title: 'Attendance',
      icon: 'CalendarCheck',
      description: 'Subject-wise attendance percentage and daily register.'
    },
    {
      key: 'library',
      title: 'Library',
      icon: 'Library',
      description: 'Physical circulation and the digital resource vault.'
    },
    {
      key: 'dept_notices',
      title: 'Department Notices',
      icon: 'Megaphone',
      description: 'Announcements published by your department.'
    },
    {
      key: 'org_calendar',
      title: 'Organisation Calendar',
      icon: 'CalendarDays',
      description: 'Institution events, holidays and academic milestones.'
    },
    {
      key: 'payment_details',
      title: 'Payment Details',
      icon: 'CreditCard',
      description: 'Saved payment methods and recent transactions.'
    },
    {
      key: 'fees',
      title: 'Fees',
      icon: 'Wallet',
      description: 'Semester dues, exam fees and outstanding balances.'
    },
    {
      key: 'update_info',
      title: 'Update Information',
      icon: 'UserCog',
      description: 'Keep your personal and academic profile current.'
    },
    {
      key: 'results',
      title: 'Results',
      icon: 'BarChart3',
      description: 'Published marks, grades and semester performance.'
    },
    {
      key: 'feedback',
      title: 'Semester Feedback',
      icon: 'MessageSquareHeart',
      description: 'Share structured feedback for each subject.'
    },
    {
      key: 'exam_form',
      title: 'Exam Form',
      icon: 'FileText',
      description: 'Submit regular or backlog examination forms.'
    },
    {
      key: 'timetable',
      title: 'Timetable',
      icon: 'CalendarClock',
      description: 'Weekly class routine with rooms and faculty.'
    },
    {
      key: 'admit_card',
      title: 'Admit Card',
      icon: 'QrCode',
      description: 'Download the QR-verified examination admit card.'
    }
  ],
  faculty: [
    {
      key: 'my_classes',
      title: 'My Classes',
      icon: 'Presentation',
      description: 'Batches, subjects and scheduled periods you teach.'
    },
    {
      key: 'attendance_marking',
      title: 'Attendance Marking',
      icon: 'ClipboardCheck',
      description: 'Mark daily period attendance for your batch.'
    },
    {
      key: 'upload_marks',
      title: 'Upload Marks',
      icon: 'Upload',
      description: 'Bulk upload internal and examination marks.'
    },
    {
      key: 'upload_content',
      title: 'Upload Content',
      icon: 'CloudUpload',
      description: 'Publish lecture videos, notes and documents to the LMS.'
    },
    {
      key: 'question_bank',
      title: 'Question Bank',
      icon: 'Database',
      description: 'Curate previous papers and model question sets.'
    },
    {
      key: 'library',
      title: 'Library',
      icon: 'Library',
      description: 'Digital vault access and physical circulation desk.'
    },
    {
      key: 'leave_apply',
      title: 'Apply for Leave',
      icon: 'CalendarMinus',
      description: 'Request casual or medical leave and track approval.'
    },
    {
      key: 'dept_notices',
      title: 'Department Notices',
      icon: 'Megaphone',
      description: 'Departmental announcements and discussions.'
    },
    {
      key: 'staff_notices',
      title: 'Staff Notices',
      icon: 'BellRing',
      description: 'Institution-wide notices for staff members.'
    },
    {
      key: 'coe_manage',
      title: 'COE Manage',
      icon: 'ShieldCheck',
      description: 'Examination forms, eligibility and result workflows.'
    },
    {
      key: 'org_calendar',
      title: 'Organisation Calendar',
      icon: 'CalendarDays',
      description: 'Institution events, holidays and academic milestones.'
    },
    {
      key: 'timetable',
      title: 'Timetable',
      icon: 'CalendarClock',
      description: 'Your teaching schedule across batches.'
    }
  ],
  college_admin: [
    {
      key: 'staff_notices',
      title: 'Staff Notices',
      icon: 'BellRing',
      description: 'Publish and moderate notices for staff members.'
    },
    {
      key: 'settings',
      title: 'AmyLearn College Settings',
      icon: 'Settings',
      description: 'Branding, academic preferences and portal configuration.'
    },
    {
      key: 'leave_manager',
      title: 'Leave Manager',
      icon: 'CalendarCheck2',
      description: 'Review and action faculty leave applications.'
    },
    {
      key: 'library',
      title: 'Library',
      icon: 'Library',
      description: 'Circulation desk, digital vault and provider credentials.'
    },
    {
      key: 'approvals',
      title: 'Approvals',
      icon: 'BadgeCheck',
      description: 'Approve resources, memberships and platform requests.'
    },
    {
      key: 'timetable',
      title: 'Timetable',
      icon: 'CalendarClock',
      description: 'Build batch routines and room allocations.'
    },
    {
      key: 'org_calendar',
      title: 'Organisation Calendar',
      icon: 'CalendarDays',
      description: 'Institution events, holidays and academic milestones.'
    },
    {
      key: 'manage_users',
      title: 'Manage Users',
      icon: 'Users',
      description: 'Search, suspend and remove campus accounts.'
    },
    {
      key: 'account_creation',
      title: 'Account Creation',
      icon: 'UserPlus',
      description: 'Invite students, faculty and administrative staff.'
    },
    {
      key: 'fees_exam_records',
      title: 'Fees & Exam Records',
      icon: 'Receipt',
      description: 'Fee ledger reconciliation and examination records.'
    },
    {
      key: 'manage_departments',
      title: 'Manage Departments',
      icon: 'Building2',
      description: 'Departments, streams, subjects and curriculum settings.'
    },
    {
      key: 'admin_roles',
      title: 'Admin Roles',
      icon: 'ShieldCheck',
      description: 'Assign granular administrative roles to campus staff.'
    },
    {
      key: 'coe_manage',
      title: 'COE Manage',
      icon: 'GraduationCap',
      description: 'Eligibility, exam forms and result publication.'
    },
    {
      key: 'exam_management',
      title: 'Exam Management',
      icon: 'FileSpreadsheet',
      description: 'Exam sessions, paper allocation and seating.'
    },
    {
      key: 'university_marks',
      title: 'University Marks',
      icon: 'Award',
      description: 'Consolidated university marks and grade sheets.'
    }
  ]
});

const FEATURE_KEYS = Object.freeze(
  Array.from(new Set(Object.values(MASTER_FEATURES).flat().map((item) => item.key)))
);

function normalizeMenuOverrides(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { global: { hidden: [], labels: {} }, roles: {} };
  }
  const globalOverrides = {
    hidden: Array.isArray(raw.hidden) ? raw.hidden : [],
    labels: raw.labels && typeof raw.labels === 'object' ? raw.labels : {}
  };
  const roles = {};
  Object.keys(raw).forEach((key) => {
    if (['hidden', 'labels', 'roles'].includes(key)) return;
    const value = raw[key];
    if (value && typeof value === 'object') {
      roles[key] = {
        hidden: Array.isArray(value.hidden) ? value.hidden : [],
        labels: value.labels && typeof value.labels === 'object' ? value.labels : {}
      };
    }
  });
  if (raw.roles && typeof raw.roles === 'object') {
    Object.entries(raw.roles).forEach(([role, value]) => {
      if (!value || typeof value !== 'object') return;
      roles[role] = {
        hidden: Array.isArray(value.hidden) ? value.hidden : [],
        labels: value.labels && typeof value.labels === 'object' ? value.labels : {}
      };
    });
  }
  return { global: globalOverrides, roles };
}

/**
 * Role-filtered menu, honouring tenant overrides.
 */
function getMenuForRole(role, overrides = {}, flags = {}) {
  const canonical = toFrontendRole(role);
  let catalogueRole = 'student';
  if (canonical === 'faculty') catalogueRole = 'faculty';
  else if (['campus_admin', 'amylearn_admin', 'amylearn_manager'].includes(canonical)) {
    catalogueRole = 'college_admin';
  }

  const menu = MASTER_FEATURES[catalogueRole] || MASTER_FEATURES.student;
  const normalized = normalizeMenuOverrides(overrides);
  const roleOverride =
    normalized.roles[role] || normalized.roles[canonical] || normalized.roles[catalogueRole] || null;

  const hidden = new Set([...(normalized.global.hidden || []), ...((roleOverride && roleOverride.hidden) || [])]);
  const labels = { ...(normalized.global.labels || {}), ...((roleOverride && roleOverride.labels) || {}) };

  return menu
    .filter((item) => !hidden.has(item.key))
    .filter((item) => flags[item.key] !== false)
    .map((item) => ({
      ...item,
      title: labels[item.key] || item.title
    }));
}

function defaultFeatureFlags() {
  const flags = {};
  FEATURE_KEYS.forEach((key) => {
    flags[key] = true;
  });
  return flags;
}

function defaultFeatureMatrix() {
  const matrix = {};
  Object.entries(MASTER_FEATURES).forEach(([role, items]) => {
    matrix[role] = items.reduce((acc, item) => {
      acc[item.key] = true;
      return acc;
    }, {});
  });
  return matrix;
}

module.exports = {
  MASTER_FEATURES,
  FEATURE_KEYS,
  getMenuForRole,
  normalizeMenuOverrides,
  defaultFeatureFlags,
  defaultFeatureMatrix
};
