import {
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Library,
  Megaphone,
  User,
  Users
} from 'lucide-react';

export const MOCK_FACULTY = {
  name: 'Prof. Karthik Subramanian',
  email: 'faculty.campus@amylearn.demo',
  employeeId: 'FAC-CSE-002',
  designation: 'Associate Professor',
  department: 'CSE',
  phone: '+91 98450 55127',
  joined: '2016-07-14',
  specialization: 'Operating Systems, Distributed Computing'
};

export const FACULTY_SECTIONS = [
  { id: 'core', label: 'Workspace' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'communication', label: 'Communication' },
  { id: 'resources', label: 'Resources' },
  { id: 'account', label: 'Account' }
];

export const FACULTY_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'core' },
  { id: 'timetable', label: 'My timetable', icon: CalendarCheck, section: 'teaching' },
  { id: 'attendance', label: 'Mark attendance', icon: ClipboardCheck, section: 'teaching', badge: '2' },
  { id: 'students', label: 'My students', icon: Users, section: 'teaching' },
  { id: 'notices', label: 'Notices', icon: Megaphone, section: 'communication' },
  { id: 'org-calendar', label: 'Org calendar', icon: Calendar, section: 'communication' },
  { id: 'digital-library', label: 'Library & vault', icon: Library, section: 'resources' },
  { id: 'profile', label: 'My profile', icon: User, section: 'account' }
];

export const MOCK_FACULTY_STATS = [
  { id: 'courses', label: 'Courses this term', value: '3', hint: '2 theory · 1 lab', tone: 'indigo' },
  { id: 'students', label: 'Students taught', value: '124', hint: 'Across 3 classes', tone: 'emerald' },
  { id: 'attendance', label: 'Classes marked', value: '38/42', hint: 'This month · 90%', tone: 'blue' },
  { id: 'pending', label: 'Pending reviews', value: '9', hint: 'Assignments & exam forms', tone: 'amber' }
];

export const MOCK_FACULTY_COURSES = [
  { id: 'cs502', code: 'CS502', subject: 'Operating Systems', class: 'CSE · Sem 5', students: 62, type: 'Theory', room: 'AB-201' },
  { id: 'cs504', code: 'CS504', subject: 'Software Engineering', class: 'CSE · Sem 5', students: 62, type: 'Theory', room: 'LH-2' },
  { id: 'cs511', code: 'CS511', subject: 'DBMS Lab', class: 'CSE · Sem 5', students: 31, type: 'Lab', room: 'Lab-4' }
];

export const MOCK_FACULTY_TIMETABLE = {
  Monday: [
    { time: '10:00 – 10:55', subject: 'Operating Systems', code: 'CS502', class: 'CSE Sem 5', room: 'AB-201' },
    { time: '13:30 – 15:20', subject: 'DBMS Lab', code: 'CS511', class: 'CSE Sem 5', room: 'Lab-4' }
  ],
  Tuesday: [
    { time: '09:00 – 09:55', subject: 'Software Engineering', code: 'CS504', class: 'CSE Sem 5', room: 'LH-2' }
  ],
  Wednesday: [
    { time: '10:00 – 10:55', subject: 'Operating Systems', code: 'CS502', class: 'CSE Sem 5', room: 'AB-201' }
  ],
  Thursday: [
    { time: '09:00 – 09:55', subject: 'Software Engineering', code: 'CS504', class: 'CSE Sem 5', room: 'LH-2' },
    { time: '11:10 – 12:05', subject: 'Operating Systems', code: 'CS502', class: 'CSE Sem 5', room: 'AB-201' }
  ],
  Friday: [
    { time: '13:30 – 15:20', subject: 'DBMS Lab', code: 'CS511', class: 'CSE Sem 5', room: 'Lab-4' }
  ]
};

export const MOCK_FACULTY_STUDENTS = [
  { id: 'NBR2024CS042', name: 'Aarav Sharma', course: 'CS502', attendance: 87, ia1: 38, ia2: 42, status: 'active' },
  { id: 'NBR2024CS043', name: 'Diya Patel', course: 'CS502', attendance: 91, ia1: 44, ia2: 46, status: 'active' },
  { id: 'NBR2024CS044', name: 'Kabir Malhotra', course: 'CS502', attendance: 82, ia1: 33, ia2: 36, status: 'active' },
  { id: 'NBR2024CS045', name: 'Nisha Verma', course: 'CS502', attendance: 88, ia1: 40, ia2: 41, status: 'active' },
  { id: 'NBR2024CS046', name: 'Aditya Rao', course: 'CS502', attendance: 74, ia1: 29, ia2: 31, status: 'active' },
  { id: 'NBR2024CS047', name: 'Riya Kapoor', course: 'CS502', attendance: 93, ia1: 45, ia2: 47, status: 'active' },
  { id: 'NBR2024CS048', name: 'Varun Shetty', course: 'CS502', attendance: 68, ia1: 24, ia2: 27, status: 'restricted' },
  { id: 'NBR2024CS049', name: 'Anika Menon', course: 'CS502', attendance: 84, ia1: 36, ia2: 39, status: 'active' }
];

export const MOCK_ATTENDANCE_SESSIONS = [
  { id: 'att-cs502', course: 'Operating Systems · CS502', class: 'CSE Sem 5', date: '2026-10-26', time: '10:00 – 10:55', students: MOCK_FACULTY_STUDENTS, marked: false },
  { id: 'att-cs504', course: 'Software Engineering · CS504', class: 'CSE Sem 5', date: '2026-10-26', time: '09:00 – 09:55', students: MOCK_FACULTY_STUDENTS.slice(0, 4), marked: false },
  { id: 'att-cs502-y', course: 'Operating Systems · CS502', class: 'CSE Sem 5', date: '2026-10-23', time: '10:00 – 10:55', students: [], marked: true }
];

export const MOCK_FACULTY_LOANS = [
  { id: 'ln-1', title: 'Operating System Concepts — Silberschatz', due: '2026-11-06', type: 'Book' },
  { id: 'ln-2', title: 'IEEE Xplore — CSE department access', due: '2026-12-31', type: 'Digital vault' }
];

export const MOCK_FACULTY_LEAVES = [
  { id: 'lv-1', from: '2026-11-10', to: '2026-11-12', reason: 'Presenting paper at ICET 2026', status: 'approved' }
];

export const MOCK_FACULTY_NOTICES = [
  { id: 'fn-1', title: 'End Semester examination timetable published', department: 'COE', category: 'Examinations', date: '2026-10-24', pinned: true, body: 'The end semester timetable for November 2026 is now published. Faculty on duty must confirm their invigilation slots.' },
  { id: 'fn-2', title: 'Internal Assessment 2 marks entry window open', department: 'Academics', category: 'Academics', date: '2026-10-22', pinned: false, body: 'Complete IA-2 marks entry before 30 October. HOD verification begins 1 November.' },
  { id: 'fn-3', title: 'Faculty appraisal documents due', department: 'HR', category: 'HR', date: '2026-10-23', pinned: false, body: 'Self-appraisal forms for the current cycle are due by 7 November.' },
  { id: 'fn-4', title: 'Library overdue fine amnesty week', department: 'Library', category: 'General', date: '2026-10-20', pinned: false, body: 'Return overdue books during 26–31 October for a full fine waiver.' },
  { id: 'fn-5', title: 'Tech fest faculty mentor meet', department: 'Student Affairs', category: 'Events', date: '2026-10-18', pinned: false, body: 'Faculty mentors must approve team lists in the portal by 30 October.' }
];

export const MOCK_FACULTY_ORG_EVENTS = [
  { id: 'fe-1', title: 'IA-2 marks entry deadline', type: 'deadline', date: '2026-10-30', time: '17:00', venue: 'Portal', organizer: 'Academics', tone: 'amber' },
  { id: 'fe-2', title: 'NAAC preparatory committee meeting', type: 'meeting', date: '2026-10-28', time: '15:00', venue: 'Board Room 2', organizer: 'IQAC', tone: 'teal' },
  { id: 'fe-3', title: 'TechNova 2026 inauguration', type: 'event', date: '2026-11-06', time: '09:30', venue: 'Main Auditorium', organizer: 'Student Affairs', tone: 'violet' },
  { id: 'fe-4', title: 'ICET 2026 — paper presentation', type: 'event', date: '2026-11-10', time: '11:00', venue: 'Seminar Hall 1', organizer: 'R&D Cell', tone: 'blue' },
  { id: 'fe-5', title: 'End semester exams begin', type: 'exam', date: '2026-11-16', time: '09:30', venue: 'All halls', organizer: 'COE', tone: 'rose' }
];
