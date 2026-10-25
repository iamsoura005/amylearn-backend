import {
  LayoutDashboard,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Library,
  Megaphone,
  Folder,
  CalendarDays,
  Sparkles,
  Bell,
  Calendar,
  CreditCard,
  Receipt,
  GraduationCap,
  FileText,
  MessageSquare,
  User,
  History,
  ListChecks,
  Clock,
  Landmark,
  BookMarked
} from 'lucide-react';

export const STUDENT_SECTIONS = [
  { id: 'general', label: null },
  { id: 'lms', label: 'Learning & Academics' },
  { id: 'erp', label: 'Resource Planning & Management' }
];

export const STUDENT_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'general', description: 'Your day at a glance' },
  { id: 'bento-hub', label: 'Campus hub', icon: LayoutGrid, section: 'general', description: 'Every module in one grid' },
  { id: 'courses', label: 'Courses', icon: BookOpen, section: 'lms', badge: '6', description: 'Modules, videos and notes' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, section: 'lms', badge: '2', description: 'Submissions and grades' },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, section: 'lms', description: 'Daily and subject-wise' },
  { id: 'digital-library', label: 'Digital library', icon: Library, section: 'lms', description: 'Notes, papers and e-books' },
  { id: 'dept-notices', label: 'Department notices', icon: Megaphone, section: 'lms', description: 'Updates from CSE' },
  { id: 'project-info', label: 'Project info', icon: Folder, section: 'lms', description: 'Capstone project workspace' },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays, section: 'lms', description: 'Weekly class routine' },
  { id: 'ai-study', label: 'AI study studio', icon: Sparkles, section: 'lms', badge: 'AI', description: 'Tutor, mind maps, summaries' },
  { id: 'notices', label: 'Notices', icon: Bell, section: 'lms', description: 'Campus announcements' },
  { id: 'org-calendar', label: 'Organisation calendar', icon: Calendar, section: 'erp', description: 'Academic and campus events' },
  { id: 'payment-details', label: 'Payment details', icon: CreditCard, section: 'erp', description: 'Saved methods and receipts' },
  { id: 'fees', label: 'Fees', icon: Receipt, section: 'erp', badge: '₹3,200', description: 'Dues and payment history' },
  { id: 'marks', label: 'Marks', icon: GraduationCap, section: 'erp', description: 'Internal and semester results' },
  { id: 'admit-card', label: 'Admit card', icon: FileText, section: 'erp', description: 'Hall ticket and seat details' },
  { id: 'exam-form', label: 'Exam form', icon: ListChecks, section: 'erp', description: 'Register for examinations' },
  { id: 'sem-feedback', label: 'Semester feedback', icon: MessageSquare, section: 'erp', description: 'Share course feedback' },
  { id: 'profile', label: 'Profile', icon: User, section: 'erp', description: 'Personal and academic details' },
  { id: 'payment-history', label: 'Payment history', icon: History, section: 'erp', description: 'Every fee transaction' }
];

export const STUDENT_NAV_ITEMS_WITH_SECTIONS = STUDENT_SECTIONS.map((section) => ({
  ...section,
  items: STUDENT_NAV_ITEMS.filter((item) => item.section === section.id)
}));

export const TAB_DESCRIPTIONS = {
  overview: {
    description: 'Attendance, timetable, pending work and the next thing that needs your attention.',
    badge: 'Today',
    iconBg: 'bg-blue-50 text-brandBlue',
    cardBorder: 'hover:border-blue-200'
  },
  'bento-hub': {
    description: 'A card for every campus module — jump anywhere without hunting through menus.',
    badge: 'All modules',
    iconBg: 'bg-indigo-50 text-indigo-700',
    cardBorder: 'hover:border-indigo-200'
  },
  courses: {
    description: 'Six registered courses with modules, lecture videos and downloadable notes.',
    badge: '6 active',
    iconBg: 'bg-violet-50 text-violet-700',
    cardBorder: 'hover:border-violet-200'
  },
  assignments: {
    description: 'Submission windows, grading status and faculty remarks in one place.',
    badge: '2 due',
    iconBg: 'bg-amber-50 text-amber-700',
    cardBorder: 'hover:border-amber-200'
  },
  attendance: {
    description: 'Subject-wise percentages, class history and shortage warnings.',
    badge: '87%',
    iconBg: 'bg-emerald-50 text-emerald-700',
    cardBorder: 'hover:border-emerald-200'
  },
  'digital-library': {
    description: 'Approved campus notes, previous-year papers and curated e-books.',
    badge: '8 titles',
    iconBg: 'bg-teal-50 text-teal-700',
    cardBorder: 'hover:border-teal-200'
  },
  'dept-notices': {
    description: 'Notices from the Computer Science & Engineering department.',
    badge: '3 new',
    iconBg: 'bg-orange-50 text-orange-700',
    cardBorder: 'hover:border-orange-200'
  },
  'project-info': {
    description: 'Capstone abstract, guide, milestones and team responsibilities.',
    badge: 'In progress',
    iconBg: 'bg-rose-50 text-rose-700',
    cardBorder: 'hover:border-rose-200'
  },
  timetable: {
    description: 'The full Monday–Saturday routine with rooms and faculty.',
    badge: 'Week 9',
    iconBg: 'bg-sky-50 text-sky-700',
    cardBorder: 'hover:border-sky-200'
  },
  'ai-study': {
    description: 'A Socratic tutor, mind-map builder and file summariser built for your syllabus.',
    badge: 'AI',
    iconBg: 'bg-ai-50 text-ai-600',
    cardBorder: 'hover:border-ai-200'
  },
  notices: {
    description: 'Campus-wide announcements, reactions and threaded discussions.',
    badge: '4 unread',
    iconBg: 'bg-indigo-50 text-indigo-700',
    cardBorder: 'hover:border-indigo-200'
  },
  'org-calendar': {
    description: 'Exams, holidays, fests and deadlines across the academic year.',
    badge: 'Nov',
    iconBg: 'bg-blue-50 text-brandBlue',
    cardBorder: 'hover:border-blue-200'
  },
  'payment-details': {
    description: 'Saved payment methods, billing identity and downloadable receipts.',
    badge: 'Verified',
    iconBg: 'bg-emerald-50 text-emerald-700',
    cardBorder: 'hover:border-emerald-200'
  },
  fees: {
    description: 'Semester dues, exam fees and a clear breakdown of what is paid.',
    badge: '₹3,200 due',
    iconBg: 'bg-amber-50 text-amber-700',
    cardBorder: 'hover:border-amber-200'
  },
  marks: {
    description: 'Internal assessments, end-semester marks, grades and CGPA.',
    badge: 'CGPA 8.42',
    iconBg: 'bg-violet-50 text-violet-700',
    cardBorder: 'hover:border-violet-200'
  },
  'admit-card': {
    description: 'QR-verified hall ticket with exam centre, seat and instructions.',
    badge: 'Ready',
    iconBg: 'bg-rose-50 text-rose-700',
    cardBorder: 'hover:border-rose-200'
  },
  'exam-form': {
    description: 'Eligibility, regular and backlog papers, fee ledger and submission.',
    badge: 'Submitted',
    iconBg: 'bg-sky-50 text-sky-700',
    cardBorder: 'hover:border-sky-200'
  },
  'sem-feedback': {
    description: 'Anonymous course feedback that helps faculty improve the semester.',
    badge: 'Open',
    iconBg: 'bg-teal-50 text-teal-700',
    cardBorder: 'hover:border-teal-200'
  },
  profile: {
    description: 'Your identity, academic record and contact preferences.',
    badge: 'Verified',
    iconBg: 'bg-slate-100 text-slate-700',
    cardBorder: 'hover:border-slate-300'
  },
  'payment-history': {
    description: 'Every fee payment with receipt, mode and reference number.',
    badge: '4 payments',
    iconBg: 'bg-emerald-50 text-emerald-700',
    cardBorder: 'hover:border-emerald-200'
  }
};

export const MOCK_STUDENT = {
  id: 'stu-nbr-042',
  name: 'Aarav Sharma',
  firstName: 'Aarav',
  rollNumber: 'NBR2024CS042',
  email: 'aarav.sharma@student.nbr.edu',
  phone: '+91 98450 22118',
  department: 'Computer Science & Engineering',
  departmentShort: 'CSE',
  program: 'B.Tech · Computer Science & Engineering',
  semester: 5,
  section: 'A',
  batch: '2024 – 2028',
  advisor: 'Dr. Ananya Rao',
  cgpa: 8.42,
  attendance: 87,
  creditsEarned: 96,
  creditsTotal: 160,
  hostel: 'Kaveri Block · Room 214',
  bloodGroup: 'O+',
  joined: 'August 2024',
  councilRole: 'Class representative',
  address: '24, 3rd Cross, Jayanagar 4th Block, Bengaluru 560011'
};

export const MOCK_DASHBOARD_STATS = {
  attendance: 87,
  cgpa: 8.42,
  pendingFees: 3200,
  libraryDue: 2,
  assignmentsDue: 2,
  unreadNotices: 4,
  creditsEarned: 96
};

export const MOCK_TIMETABLE = [
  { id: 'p1', time: '09:00', end: '09:55', subject: 'Database Management Systems', code: 'CS501', room: 'C-204', faculty: 'Dr. Ananya Rao', type: 'Lecture', day: 'Monday', status: 'done' },
  { id: 'p2', time: '10:00', end: '11:40', subject: 'Operating Systems Lab', code: 'CS502L', room: 'Lab L-3', faculty: 'Prof. Karthik Subramanian', type: 'Lab', day: 'Monday', status: 'done' },
  { id: 'p3', time: '11:45', end: '12:40', subject: 'Computer Networks', code: 'CS503', room: 'C-204', faculty: 'Dr. Nandita Bose', type: 'Lecture', day: 'Monday', status: 'live' },
  { id: 'p4', time: '13:30', end: '14:25', subject: 'Software Engineering', code: 'CS504', room: 'C-101', faculty: 'Prof. Arvind Kulkarni', type: 'Lecture', day: 'Monday', status: 'upcoming' },
  { id: 'p5', time: '15:00', end: '15:50', subject: 'Discrete Mathematics Tutorial', code: 'CS505T', room: 'T-12', faculty: 'Dr. Sofia Fernandes', type: 'Tutorial', day: 'Monday', status: 'upcoming' }
];

export const MOCK_WEEK_TIMETABLE = [
  { day: 'Monday', periods: ['DBMS · C-204', 'OS Lab · L-3', 'Networks · C-204', 'Software Engg · C-101', 'Discrete Tutorial · T-12'] },
  { day: 'Tuesday', periods: ['Operating Systems · C-204', 'Computer Networks Lab · L-1', 'Elective AI · C-310', 'Library / Self study', '—'] },
  { day: 'Wednesday', periods: ['Software Engineering · C-101', 'DBMS Tutorial · T-08', 'Discrete Mathematics · C-204', 'Elective AI Lab · L-5', 'Mentor hour · C-204'] },
  { day: 'Thursday', periods: ['Computer Networks · C-204', 'Operating Systems · C-204', 'Software Engg Tutorial · T-11', 'Sports / Club hour', '—'] },
  { day: 'Friday', periods: ['DBMS Lab · L-2', 'Discrete Mathematics · C-204', 'Elective AI · C-310', 'Project review · C-310', '—'] },
  { day: 'Saturday', periods: ['Makeup / remedial classes', 'Placement training · Auditorium', '—', '—', '—'] }
];

export const MOCK_COURSES = [
  { id: 'dbms', code: 'CS501', title: 'Database Management Systems', faculty: 'Dr. Ananya Rao', credits: 4, progress: 72, modules: 8, next: 'Query optimisation & indexing', nextAt: 'Mon · 09:00', color: '#1E63D6', tint: 'bg-blue-50 text-blue-700' },
  { id: 'os', code: 'CS502', title: 'Operating Systems', faculty: 'Prof. Karthik Subramanian', credits: 4, progress: 64, modules: 7, next: 'Deadlock avoidance', nextAt: 'Tue · 10:00', color: '#7C4DFF', tint: 'bg-violet-50 text-violet-700' },
  { id: 'networks', code: 'CS503', title: 'Computer Networks', faculty: 'Dr. Nandita Bose', credits: 3, progress: 58, modules: 6, next: 'TCP congestion control', nextAt: 'Wed · 11:00', color: '#21C7C4', tint: 'bg-teal-50 text-teal-700' },
  { id: 'se', code: 'CS504', title: 'Software Engineering', faculty: 'Prof. Arvind Kulkarni', credits: 3, progress: 81, modules: 6, next: 'Sprint retrospectives', nextAt: 'Thu · 09:00', color: '#FF8A00', tint: 'bg-amber-50 text-amber-700' },
  { id: 'discrete', code: 'CS505', title: 'Discrete Mathematics', faculty: 'Dr. Sofia Fernandes', credits: 3, progress: 90, modules: 5, next: 'Graph colouring', nextAt: 'Fri · 10:00', color: '#0F766E', tint: 'bg-emerald-50 text-emerald-700' },
  { id: 'ai', code: 'CS506', title: 'Elective · Applied AI', faculty: 'Dr. Meghna Pillai', credits: 3, progress: 46, modules: 6, next: 'Attention mechanisms', nextAt: 'Fri · 14:00', color: '#E11D48', tint: 'bg-rose-50 text-rose-700' }
];

const doc = (id, title, duration) => ({
  id,
  title,
  type: 'Document',
  url: 'https://pdfobject.com/pdf/sample.pdf',
  duration,
  downloadEnabled: true,
  completed: false
});
const video = (id, title, duration, downloadEnabled = false) => ({
  id,
  title,
  type: 'Video',
  url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
  duration,
  downloadEnabled,
  completed: false
});

export const MOCK_COURSE_MODULES = {
  dbms: [
    { id: 'dbms-m1', title: 'Relational model & algebra', description: 'Relations, keys, integrity constraints and relational algebra.', contents: [video('dbms-c1', 'Relational model walkthrough', '12:40'), doc('dbms-c2', 'Relational algebra cheat sheet', '6 pages'), video('dbms-c3', 'Keys and constraints', '18:05', true)] },
    { id: 'dbms-m2', title: 'SQL & query execution', description: 'Joins, subqueries, execution plans and indexing basics.', contents: [video('dbms-c4', 'Joins explained visually', '22:15'), doc('dbms-c5', 'SQL practice set 1', '14 questions')] },
    { id: 'dbms-m3', title: 'Normalisation & design', description: 'Functional dependencies through BCNF with worked problems.', contents: [video('dbms-c6', 'Normalisation from 1NF to BCNF', '27:10'), doc('dbms-c7', 'Normalisation decision tree', '2 pages')] }
  ],
  os: [
    { id: 'os-m1', title: 'Processes & scheduling', description: 'Process states, context switching and scheduling algorithms.', contents: [video('os-c1', 'Scheduling algorithms compared', '19:30'), doc('os-c2', 'Gantt chart practice', '8 questions')] },
    { id: 'os-m2', title: 'Synchronisation', description: 'Locks, semaphores, monitors and classic problems.', contents: [video('os-c3', 'Producer–consumer with semaphores', '21:05'), doc('os-c4', 'Synchronisation worksheet', '10 questions')] },
    { id: 'os-m3', title: 'Deadlocks & memory', description: 'Deadlock conditions, Banker’s algorithm and paging.', contents: [video('os-c5', 'Banker’s algorithm step by step', '16:45')] }
  ],
  networks: [
    { id: 'net-m1', title: 'Layered models', description: 'OSI and TCP/IP layers with encapsulation examples.', contents: [video('net-c1', 'Encapsulation in 10 minutes', '10:20'), doc('net-c2', 'Layer reference table', '3 pages')] },
    { id: 'net-m2', title: 'Transport layer', description: 'TCP state machine, flow control and congestion.', contents: [video('net-c3', 'TCP three-way handshake', '14:10'), doc('net-c4', 'Congestion control notes', '6 pages')] }
  ],
  se: [
    { id: 'se-m1', title: 'Requirements & design', description: 'User stories, acceptance criteria and design reviews.', contents: [video('se-c1', 'Writing testable user stories', '13:00'), doc('se-c2', 'SRS template', '4 pages')] },
    { id: 'se-m2', title: 'Agile delivery', description: 'Sprints, retrospectives and release readiness.', contents: [video('se-c3', 'A healthy sprint retrospective', '11:25')] }
  ],
  discrete: [
    { id: 'dm-m1', title: 'Logic & proofs', description: 'Propositional logic, quantifiers and proof techniques.', contents: [video('dm-c1', 'Proof by contradiction', '15:35'), doc('dm-c2', 'Proof strategy sheet', '2 pages')] },
    { id: 'dm-m2', title: 'Graphs & combinatorics', description: 'Trees, colouring, Euler paths and counting.', contents: [video('dm-c3', 'Graph colouring intuition', '17:20')] }
  ],
  ai: [
    { id: 'ai-m1', title: 'Foundations of ML', description: 'Supervised learning, loss functions and evaluation.', contents: [video('ai-c1', 'Bias–variance trade-off', '18:00'), doc('ai-c2', 'Evaluation metrics table', '3 pages')] },
    { id: 'ai-m2', title: 'Neural networks', description: 'Backpropagation, embedding and attention.', contents: [video('ai-c3', 'Attention without the maths panic', '24:15')] }
  ]
};

export const MOCK_ASSIGNMENTS = [
  { id: 'a1', title: 'Query optimisation report', course: 'DBMS', code: 'CS501', due: '2026-10-28', status: 'Pending', marks: null, total: 20, type: 'Report', faculty: 'Dr. Ananya Rao' },
  { id: 'a2', title: 'Scheduling simulator', course: 'Operating Systems', code: 'CS502', due: '2026-10-30', status: 'Pending', marks: null, total: 25, type: 'Code + writeup', faculty: 'Prof. Karthik Subramanian' },
  { id: 'a3', title: 'Subnetting problem set', course: 'Computer Networks', code: 'CS503', due: '2026-11-02', status: 'Submitted', marks: null, total: 15, type: 'Problem set', faculty: 'Dr. Nandita Bose' },
  { id: 'a4', title: 'Sprint retrospective reflection', course: 'Software Engineering', code: 'CS504', due: '2026-11-05', status: 'Submitted', marks: null, total: 10, type: 'Reflection', faculty: 'Prof. Arvind Kulkarni' },
  { id: 'a5', title: 'Graph colouring exercises', course: 'Discrete Mathematics', code: 'CS505', due: '2026-10-18', status: 'Graded', marks: 18, total: 20, type: 'Problem set', faculty: 'Dr. Sofia Fernandes' },
  { id: 'a6', title: 'Attention mechanism lab', course: 'Applied AI', code: 'CS506', due: '2026-11-12', status: 'Pending', marks: null, total: 20, type: 'Lab', faculty: 'Dr. Meghna Pillai' }
];

export const MOCK_ATTENDANCE_SUBJECTS = [
  { id: 'dbms', subject: 'Database Management Systems', code: 'CS501', attended: 34, total: 39, percent: 87, faculty: 'Dr. Ananya Rao' },
  { id: 'os', subject: 'Operating Systems', code: 'CS502', attended: 30, total: 35, percent: 86, faculty: 'Prof. Karthik Subramanian' },
  { id: 'networks', subject: 'Computer Networks', code: 'CS503', attended: 26, total: 31, percent: 84, faculty: 'Dr. Nandita Bose' },
  { id: 'se', subject: 'Software Engineering', code: 'CS504', attended: 28, total: 30, percent: 93, faculty: 'Prof. Arvind Kulkarni' },
  { id: 'discrete', subject: 'Discrete Mathematics', code: 'CS505', attended: 18, total: 20, percent: 90, faculty: 'Dr. Sofia Fernandes' },
  { id: 'ai', subject: 'Elective · Applied AI', code: 'CS506', attended: 14, total: 17, percent: 82, faculty: 'Dr. Meghna Pillai' }
];

export const MOCK_ATTENDANCE_HISTORY = [
  { date: '2026-10-26', subject: 'Computer Networks', status: 'Present', time: '11:45' },
  { date: '2026-10-26', subject: 'Operating Systems Lab', status: 'Present', time: '10:00' },
  { date: '2026-10-25', subject: 'Database Management Systems', status: 'Present', time: '09:00' },
  { date: '2026-10-24', subject: 'Software Engineering', status: 'Late', time: '13:30' },
  { date: '2026-10-23', subject: 'Discrete Mathematics', status: 'Present', time: '15:00' },
  { date: '2026-10-23', subject: 'Computer Networks', status: 'Absent', time: '11:45' },
  { date: '2026-10-22', subject: 'Applied AI', status: 'Present', time: '14:00' }
];

export const MOCK_MARKS = [
  { id: 'm1', subject: 'Database Management Systems', code: 'CS501', credits: 4, internal: 27, external: 58, total: 85, grade: 'A', status: 'Published' },
  { id: 'm2', subject: 'Operating Systems', code: 'CS502', credits: 4, internal: 25, external: 54, total: 79, grade: 'B+', status: 'Published' },
  { id: 'm3', subject: 'Computer Networks', code: 'CS503', credits: 3, internal: 24, external: 51, total: 75, grade: 'B+', status: 'Published' },
  { id: 'm4', subject: 'Software Engineering', code: 'CS504', credits: 3, internal: 28, external: 60, total: 88, grade: 'A', status: 'Published' },
  { id: 'm5', subject: 'Discrete Mathematics', code: 'CS505', credits: 3, internal: 29, external: 62, total: 91, grade: 'A+', status: 'Published' },
  { id: 'm6', subject: 'Applied AI', code: 'CS506', credits: 3, internal: 22, external: null, total: null, grade: '—', status: 'Pending' }
];

export const MOCK_FEES = [
  { id: 'f1', term: 'Semester 5 · Tuition', amount: 62500, paid: 62500, dueDate: '2026-08-05', status: 'Paid', receipt: 'NBR-FEE-2026-0912' },
  { id: 'f2', term: 'Semester 5 · Examination', amount: 2400, paid: 2400, dueDate: '2026-10-30', status: 'Paid', receipt: 'NBR-EXAM-2026-0417' },
  { id: 'f3', term: 'Semester 5 · Laboratory', amount: 3200, paid: 0, dueDate: '2026-11-05', status: 'Pending', receipt: null },
  { id: 'f4', term: 'Library deposit (refundable)', amount: 1000, paid: 1000, dueDate: '2026-08-05', status: 'Paid', receipt: 'NBR-LIB-2026-0231' }
];

export const MOCK_PAYMENTS = [
  { id: 'pay1', date: '2026-08-02', description: 'Semester 5 tuition', amount: 62500, mode: 'UPI · HDFC', status: 'Success', reference: 'TXN8841202091' },
  { id: 'pay2', date: '2026-08-02', description: 'Library deposit', amount: 1000, mode: 'UPI · HDFC', status: 'Success', reference: 'TXN8841202092' },
  { id: 'pay3', date: '2026-10-20', description: 'Semester 5 examination fee', amount: 2400, mode: 'Net banking · ICICI', status: 'Success', reference: 'TXN9104422187' },
  { id: 'pay4', date: '2026-02-11', description: 'Semester 4 tuition', amount: 61000, mode: 'UPI · HDFC', status: 'Success', reference: 'TXN7762019120' }
];

export const MOCK_PAYMENT_METHODS = [
  { id: 'pm1', label: 'UPI · HDFC Bank', detail: 'rohan.iyer@okhdfcbank', type: 'UPI', primary: true },
  { id: 'pm2', label: 'ICICI Net Banking', detail: '•••• 4412', type: 'Bank', primary: false },
  { id: 'pm3', label: 'Campus wallet', detail: '₹1,250 balance', type: 'Wallet', primary: false }
];

export const MOCK_NOTICES = [
  {
    id: 'n1',
    title: 'Odd semester examination timetable published',
    content:
      'The examination timetable for the odd semester (November 2026) is now available. Please verify your registered papers in the exam form tab. Hall tickets will be released after fee reconciliation.',
    type: 'staff',
    category: 'Examination',
    department: 'Examinations Office',
    poster: 'Examinations Office',
    posterRole: 'COE',
    date: '2026-10-24T09:30:00',
    pinned: true,
    reactions: 42,
    comments: 8
  },
  {
    id: 'n2',
    title: 'Library extends hours during examination weeks',
    content:
      'The central library will remain open until 11:00 PM from 9 November to 20 November. Bring your student ID for after-hours access. Group discussion rooms can be booked at the circulation desk.',
    type: 'staff',
    category: 'Library',
    department: 'Central Library',
    poster: 'Central Library',
    posterRole: 'Library',
    date: '2026-10-23T16:10:00',
    pinned: false,
    reactions: 18,
    comments: 3
  },
  {
    id: 'n3',
    title: 'Campus placement drive · Phase 1 registration',
    content:
      'Final-year and pre-final-year students can register for the Phase 1 placement drive until 5 November. Update your resume in the profile tab and verify your contact number before registering.',
    type: 'staff',
    category: 'Placement',
    department: 'Training & Placement',
    poster: 'Training & Placement Cell',
    posterRole: 'TPO',
    date: '2026-10-21T11:05:00',
    pinned: false,
    reactions: 63,
    comments: 12
  },
  {
    id: 'n4',
    title: 'Semester 5 laboratory fee window closes 5 November',
    content:
      'A laboratory fee of ₹3,200 is pending for Semester 5. Pay through the fees tab before 5 November to avoid a late fee. Contact the accounts office for reimbursement queries.',
    type: 'departmental',
    category: 'Finance',
    department: 'Computer Science & Engineering',
    poster: 'Department Accounts',
    posterRole: 'Admin',
    date: '2026-10-20T10:00:00',
    pinned: false,
    reactions: 9,
    comments: 2
  },
  {
    id: 'n5',
    title: 'CSE seminar · Retrieval-augmented generation in campus search',
    content:
      'Join Dr. Meghna Pillai on 30 October at 3:00 PM in the C-310 seminar hall for a practical walkthrough of retrieval-augmented generation, evaluation and failure modes.',
    type: 'departmental',
    category: 'Seminar',
    department: 'Computer Science & Engineering',
    poster: 'Dr. Meghna Pillai',
    posterRole: 'Faculty',
    date: '2026-10-19T13:25:00',
    pinned: false,
    reactions: 27,
    comments: 5
  }
];

export const MOCK_DEPT_NOTICES = MOCK_NOTICES.filter((notice) => notice.type === 'departmental').concat([
  {
    id: 'n6',
    title: 'Capstone review 2 · slot booking',
    content:
      'Second capstone reviews will run from 3 to 7 November. Book a 20-minute slot with your guide and upload the updated report at least 24 hours before the review.',
    type: 'departmental',
    category: 'Project',
    department: 'Computer Science & Engineering',
    poster: 'Capstone Committee',
    posterRole: 'Faculty',
    date: '2026-10-18T09:15:00',
    pinned: true,
    reactions: 14,
    comments: 4
  }
]);

export const MOCK_NOTICE_COMMENTS = {
  n1: [
    { id: 'c1', user: 'Aarohi Desai', role: 'Student', text: 'Will the backlog paper dates also be published today?', date: '2026-10-24T10:05:00', replies: [{ id: 'r1', user: 'Examinations Office', role: 'COE', text: 'Yes — backlog dates are included on page 2 of the PDF.', date: '2026-10-24T10:20:00' }] },
    { id: 'c2', user: 'Vikram Shetty', role: 'Student', text: 'Thanks. Is the reporting time the same for all centres?', date: '2026-10-24T11:12:00', replies: [] }
  ],
  n4: [
    { id: 'c3', user: 'Rohan Iyer', role: 'Student', text: 'Can the lab fee be paid in two instalments?', date: '2026-10-20T12:20:00', replies: [{ id: 'r2', user: 'Department Accounts', role: 'Admin', text: 'Yes, visit the accounts office before 1 November to split it.', date: '2026-10-20T14:02:00' }] }
  ]
};

export const MOCK_DIGITAL_RESOURCES = [
  { id: 'd1', title: 'DBMS · Complete unit-wise notes', author: 'Dr. Ananya Rao', department: 'CSE', type: 'Notes', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-09-12' },
  { id: 'd2', title: 'Operating Systems · Previous year papers', author: 'Examinations Office', department: 'CSE', type: 'PYQ', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-09-02' },
  { id: 'd3', title: 'Computer Networks · Lab manual', author: 'Dr. Nandita Bose', department: 'CSE', type: 'Manual', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-08-28' },
  { id: 'd4', title: 'Discrete Mathematics · Graph theory primer', author: 'Dr. Sofia Fernandes', department: 'CSE', type: 'Notes', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-08-20' },
  { id: 'd5', title: 'Applied AI · Attention and transformers', author: 'Dr. Meghna Pillai', department: 'CSE', type: 'Slides', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-10-01' },
  { id: 'd6', title: 'Software Engineering · SRS template pack', author: 'Prof. Arvind Kulkarni', department: 'CSE', type: 'Template', semester: 5, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-08-30' },
  { id: 'd7', title: 'DSA revision handbook', author: 'Campus Library', department: 'CSE', type: 'E-book', semester: 3, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-06-15' },
  { id: 'd8', title: 'Network security · Reading list', author: 'Dr. Nandita Bose', department: 'CSE', type: 'Reading list', semester: 6, status: 'Approved', url: 'https://pdfobject.com/pdf/sample.pdf', added: '2026-10-08' }
];

export const MOCK_LIBRARY_LOANS = [
  { id: 'l1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', copyId: 'NBR-CS-0412', status: 'Issued', issuedDate: '2026-10-15', dueDate: '2026-10-29', fine: 0 },
  { id: 'l2', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', copyId: 'NBR-CS-0188', status: 'Issued', issuedDate: '2026-10-19', dueDate: '2026-11-02', fine: 0 },
  { id: 'l3', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', copyId: 'NBR-CS-0264', status: 'Overdue', issuedDate: '2026-10-06', dueDate: '2026-10-20', fine: 60 },
  { id: 'l4', title: 'Clean Code', author: 'Robert C. Martin', copyId: 'NBR-CS-0331', status: 'Returned', issuedDate: '2026-09-02', dueDate: '2026-09-16', fine: 0 }
];

export const MOCK_ORG_EVENTS = [
  { id: 'e1', date: '2026-10-28', title: 'Capstone review 2 · slot booking closes', type: 'deadline', time: '5:00 PM', venue: 'CSE office' },
  { id: 'e2', date: '2026-10-30', title: 'CSE seminar · Retrieval-augmented generation', type: 'event', time: '3:00 PM', venue: 'C-310' },
  { id: 'e3', date: '2026-11-01', title: 'Campus holiday · Founders’ Day', type: 'holiday', time: 'All day', venue: '—' },
  { id: 'e4', date: '2026-11-05', title: 'Semester 5 laboratory fee closes', type: 'deadline', time: '11:59 PM', venue: 'Online' },
  { id: 'e5', date: '2026-11-09', title: 'Odd semester examinations begin', type: 'exam', time: '9:00 AM', venue: 'Block B' },
  { id: 'e6', date: '2026-11-12', title: 'Placement drive · Phase 1', type: 'event', time: '9:30 AM', venue: 'Auditorium' },
  { id: 'e7', date: '2026-11-20', title: 'Odd semester examinations end', type: 'exam', time: '5:00 PM', venue: 'Block B' },
  { id: 'e8', date: '2026-11-27', title: 'TechnoVerse campus fest', type: 'event', time: '10:00 AM', venue: 'Main ground' },
  { id: 'e9', date: '2026-12-04', title: 'Semester results · provisional', type: 'event', time: '10:00 AM', venue: 'Portal' }
];

export const MOCK_EXAM_FORM = {
  session: 'Odd Semester Examinations · November 2026',
  sessionId: 'exam-odd-2026',
  deadline: '2026-10-30',
  submitted: true,
  submittedAt: '2026-10-20T14:32:00',
  paymentStatus: 'Paid',
  fee: 2400,
  receipt: 'NBR-EXAM-2026-0417',
  eligibleRegular: 5,
  eligibleBacklog: 1,
  cgpa: 8.42,
  attendance: 87,
  papers: [
    { id: 'p1', code: 'CS501', title: 'Database Management Systems', credits: 4, type: 'Regular', date: '2026-11-09', session: '09:00 – 12:00' },
    { id: 'p2', code: 'CS502', title: 'Operating Systems', credits: 4, type: 'Regular', date: '2026-11-11', session: '09:00 – 12:00' },
    { id: 'p3', code: 'CS503', title: 'Computer Networks', credits: 3, type: 'Regular', date: '2026-11-13', session: '09:00 – 12:00' },
    { id: 'p4', code: 'CS504', title: 'Software Engineering', credits: 3, type: 'Regular', date: '2026-11-16', session: '09:00 – 12:00' },
    { id: 'p5', code: 'CS505', title: 'Discrete Mathematics', credits: 3, type: 'Regular', date: '2026-11-18', session: '09:00 – 12:00' },
    { id: 'p6', code: 'CS301', title: 'Data Structures (backlog)', credits: 4, type: 'Backlog', date: '2026-11-20', session: '09:00 – 12:00' }
  ]
};

export const MOCK_ADMIT_CARD = {
  examName: 'Odd Semester Examinations · November 2026',
  studentName: 'Rohan Iyer',
  rollNumber: 'NBR2024CS042',
  program: 'B.Tech · Computer Science & Engineering',
  semester: 5,
  centre: 'Northbridge University · Block B',
  centreCode: 'NBR-B2',
  seatNumber: 'B-214',
  room: 'Room 214, Second floor',
  reportingTime: '08:30 AM',
  qrValue: 'NBR2024CS042|ODD2026|NBR-B2|B-214',
  barcodeValue: 'NBR2024CS042',
  photoInitials: 'RI',
  papers: [
    { code: 'CS501', title: 'Database Management Systems', date: '2026-11-09', time: '09:00 – 12:00' },
    { code: 'CS502', title: 'Operating Systems', date: '2026-11-11', time: '09:00 – 12:00' },
    { code: 'CS503', title: 'Computer Networks', date: '2026-11-13', time: '09:00 – 12:00' },
    { code: 'CS504', title: 'Software Engineering', date: '2026-11-16', time: '09:00 – 12:00' },
    { code: 'CS505', title: 'Discrete Mathematics', date: '2026-11-18', time: '09:00 – 12:00' },
    { code: 'CS301', title: 'Data Structures (backlog)', date: '2026-11-20', time: '09:00 – 12:00' }
  ],
  instructions: [
    'Bring a valid college ID along with this admit card.',
    'Report to the exam centre at least 30 minutes before the session begins.',
    'Mobile phones, smart watches and programmable calculators are not permitted.',
    'Use only blue or black ink. Write your roll number on every answer sheet.',
    'The QR code is verified at the hall entrance; do not fold or damage it.'
  ]
};

export const MOCK_FEEDBACK_QUESTIONS = [
  { id: 'q1', category: 'Teaching', prompt: 'The faculty explained concepts clearly and used relevant examples.' },
  { id: 'q2', category: 'Teaching', prompt: 'Course materials and references supported the learning outcomes.' },
  { id: 'q3', category: 'Assessment', prompt: 'Assignments and internals fairly reflected what was taught.' },
  { id: 'q4', category: 'Pace', prompt: 'The pace of the course allowed time for doubt clarification.' },
  { id: 'q5', category: 'Environment', prompt: 'The classroom and lab environment supported focused learning.' },
  { id: 'q6', category: 'Overall', prompt: 'Overall, this semester met my expectations.' }
];

export const MOCK_PROJECT = {
  title: 'Retrieval-augmented campus knowledge assistant',
  guide: 'Dr. Meghna Pillai',
  status: 'In progress',
  phase: 'Review 2 preparation',
  team: [
    { name: 'Rohan Iyer', role: 'Lead · retrieval & evaluation', initials: 'RI' },
    { name: 'Aarohi Desai', role: 'Frontend & UX', initials: 'AD' },
    { name: 'Vikram Shetty', role: 'Data pipeline', initials: 'VS' },
    { name: 'Sana Qureshi', role: 'Evaluation & documentation', initials: 'SQ' }
  ],
  abstract:
    'A retrieval-augmented assistant that answers questions over approved campus documents — syllabi, examination rules and laboratory manuals — with citations back to the source paragraph. The system evaluates retrieval quality separately from answer fluency so that failures remain diagnosable.',
  milestones: [
    { id: 'ms1', label: 'Problem framing & literature review', due: '2026-08-22', status: 'Completed' },
    { id: 'ms2', label: 'Corpus collection & cleaning', due: '2026-09-12', status: 'Completed' },
    { id: 'ms3', label: 'Hybrid retriever baseline', due: '2026-10-10', status: 'Completed' },
    { id: 'ms4', label: 'Review 1 · demo and feedback', due: '2026-10-16', status: 'Completed' },
    { id: 'ms5', label: 'Evaluation harness & ablations', due: '2026-11-03', status: 'In progress' },
    { id: 'ms6', label: 'Review 2 · report and demo', due: '2026-11-07', status: 'Upcoming' },
    { id: 'ms7', label: 'Final submission', due: '2026-11-28', status: 'Upcoming' }
  ],
  deliverables: ['Working demo', 'Evaluation report', 'Reproducible pipeline', 'Final presentation'],
  repoNote: 'Source code is maintained in the campus Git workspace; link shared with the guide.'
};

export const MOCK_EXAM_SESSIONS = [
  { id: 's1', name: 'Odd Semester Examinations · November 2026', start: '2026-11-09', end: '2026-11-20', status: 'Upcoming', papers: 6 },
  { id: 's2', name: 'Mid Semester Assessments · September 2026', start: '2026-09-14', end: '2026-09-19', status: 'Completed', papers: 6 }
];

export const MOCK_AI_STARTERS = [
  'Explain query optimisation with a simple example',
  'Quiz me on deadlock avoidance',
  'Make a mind map for TCP congestion control',
  'Build a 5-day revision plan for my exams'
];

export const STUDENT_QUICK_LINKS = [
  { id: 'timetable', label: 'Today’s timetable', icon: Clock },
  { id: 'fees', label: 'Pay fees', icon: Landmark },
  { id: 'admit-card', label: 'Admit card', icon: BookMarked },
  { id: 'ai-study', label: 'Ask AI tutor', icon: Sparkles }
];
