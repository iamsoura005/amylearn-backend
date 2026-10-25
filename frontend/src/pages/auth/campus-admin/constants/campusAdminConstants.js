import {
  LayoutDashboard,
  LayoutGrid,
  Users,
  UserPlus,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  GraduationCap,
  IndianRupee,
  Megaphone,
  BookOpen,
  Calendar,
  Settings,
  School,
  UserCog,
  Library,
  SlidersHorizontal
} from 'lucide-react';

export const MOCK_ADMIN = {
  name: 'Dr. Meera Iyer',
  email: 'admin.campus@amylearn.demo',
  designation: 'Chief Academic Administrator',
  employeeId: 'NBR-ADM-001',
  phone: '+91 98450 22114',
  joined: '2019-06-01'
};

export const ADMIN_SECTIONS = [
  { id: 'core', label: 'Workspace' },
  { id: 'academics', label: 'Academics' },
  { id: 'examinations', label: 'Examinations' },
  { id: 'people', label: 'People' },
  { id: 'communication', label: 'Communication' },
  { id: 'resources', label: 'Resources' },
  { id: 'system', label: 'System' }
];

export const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'core' },
  { id: 'bento-hub', label: 'Quick hub', icon: LayoutGrid, section: 'core' },
  { id: 'departments', label: 'Departments', icon: Building2, section: 'academics' },
  { id: 'timetable', label: 'Timetables', icon: CalendarCheck, section: 'academics' },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, section: 'academics' },
  { id: 'marks', label: 'Marks entry', icon: FileSpreadsheet, section: 'academics' },
  { id: 'fees', label: 'Fees & payments', icon: IndianRupee, section: 'academics' },
  { id: 'coe', label: 'COE · exam forms', icon: ClipboardCheck, section: 'examinations', badge: '23' },
  { id: 'exams', label: 'Exams & results', icon: GraduationCap, section: 'examinations' },
  { id: 'users', label: 'Users', icon: Users, section: 'people' },
  { id: 'account-creation', label: 'Account creation', icon: UserPlus, section: 'people' },
  { id: 'faculty-leaves', label: 'Faculty leaves', icon: CalendarDays, section: 'people', badge: '7' },
  { id: 'notices', label: 'Notices', icon: Megaphone, section: 'communication' },
  { id: 'staff-notices', label: 'Staff notices', icon: UserCog, section: 'communication' },
  { id: 'org-calendar', label: 'Org calendar', icon: Calendar, section: 'communication' },
  { id: 'digital-library', label: 'Digital library', icon: Library, section: 'resources' },
  { id: 'feature-manager', label: 'Feature manager', icon: SlidersHorizontal, section: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'system' }
];

export const MOCK_DASHBOARD_STATS = [
  { id: 'students', label: 'Active students', value: '1,240', hint: '+4.1% vs last term', tone: 'teal' },
  { id: 'faculty', label: 'Faculty members', value: '86', hint: '12 departments pooled', tone: 'blue' },
  { id: 'attendance', label: 'Campus attendance', value: '87.2%', hint: 'Yesterday · 32 classes', tone: 'emerald' },
  { id: 'fees', label: 'Fees collected', value: '₹48.6L', hint: '₹3.2L pending this term', tone: 'amber' }
];

export const MOCK_DEPARTMENTS = [
  {
    id: 'cse',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    hod: 'Dr. Ananya Rao',
    facultyCount: 22,
    studentCount: 384,
    subjects: 18,
    streams: ['B.Tech CSE', 'M.Tech CSE'],
    established: '2008',
    tone: 'teal'
  },
  {
    id: 'ece',
    code: 'ECE',
    name: 'Electronics & Communication',
    hod: 'Dr. Ravi Chandran',
    facultyCount: 16,
    studentCount: 212,
    subjects: 15,
    streams: ['B.Tech ECE'],
    established: '2008',
    tone: 'blue'
  },
  {
    id: 'eee',
    code: 'EEE',
    name: 'Electrical & Electronics',
    hod: 'Prof. Kavitha Menon',
    facultyCount: 11,
    studentCount: 128,
    subjects: 12,
    streams: ['B.Tech EEE'],
    established: '2010',
    tone: 'amber'
  },
  {
    id: 'me',
    code: 'ME',
    name: 'Mechanical Engineering',
    hod: 'Dr. Suresh Patil',
    facultyCount: 14,
    studentCount: 176,
    subjects: 13,
    streams: ['B.Tech ME'],
    established: '2008',
    tone: 'violet'
  },
  {
    id: 'ce',
    code: 'CE',
    name: 'Civil Engineering',
    hod: 'Prof. Lakshmi Narayanan',
    facultyCount: 12,
    studentCount: 154,
    subjects: 11,
    streams: ['B.Tech CE'],
    established: '2010',
    tone: 'emerald'
  },
  {
    id: 'aids',
    code: 'AI&DS',
    name: 'AI & Data Science',
    hod: 'Dr. Meghna Pillai',
    facultyCount: 11,
    studentCount: 186,
    subjects: 14,
    streams: ['B.Tech AI&DS'],
    established: '2019',
    tone: 'rose'
  }
];

export const MOCK_STUDENTS = [
  { id: 'NBR2024CS042', name: 'Aarav Sharma', department: 'CSE', semester: 5, email: 'aarav.sharma@student.nbr.edu', attendance: 87, cgpa: 8.4, status: 'active' },
  { id: 'NBR2024CS043', name: 'Diya Patel', department: 'CSE', semester: 5, email: 'diya.patel@student.nbr.edu', attendance: 91, cgpa: 8.9, status: 'active' },
  { id: 'NBR2024CS061', name: 'Rohan Kulkarni', department: 'CSE', semester: 3, email: 'rohan.kulkarni@student.nbr.edu', attendance: 76, cgpa: 7.2, status: 'active' },
  { id: 'NBR2023EC018', name: 'Sneha Iyer', department: 'ECE', semester: 7, email: 'sneha.iyer@student.nbr.edu', attendance: 94, cgpa: 9.1, status: 'active' },
  { id: 'NBR2023EC022', name: 'Arjun Nair', department: 'ECE', semester: 7, email: 'arjun.nair@student.nbr.edu', attendance: 61, cgpa: 6.4, status: 'restricted' },
  { id: 'NBR2025ME007', name: 'Kavya Reddy', department: 'ME', semester: 3, email: 'kavya.reddy@student.nbr.edu', attendance: 83, cgpa: 7.8, status: 'active' },
  { id: 'NBR2025ME014', name: 'Vikram Singh', department: 'ME', semester: 3, email: 'vikram.singh@student.nbr.edu', attendance: 58, cgpa: 6.1, status: 'restricted' },
  { id: 'NBR2024CE031', name: 'Ananya Gupta', department: 'CE', semester: 5, email: 'ananya.gupta@student.nbr.edu', attendance: 88, cgpa: 8.2, status: 'active' },
  { id: 'NBR2024AI011', name: 'Ishaan Joshi', department: 'AI&DS', semester: 5, email: 'ishaan.joshi@student.nbr.edu', attendance: 92, cgpa: 9.3, status: 'active' },
  { id: 'NBR2023EE009', name: 'Priya Venkatesh', department: 'EEE', semester: 7, email: 'priya.venkatesh@student.nbr.edu', attendance: 79, cgpa: 7.6, status: 'active' },
  { id: 'NBR2025CS009', name: 'Advait Deshmukh', department: 'CSE', semester: 3, email: 'advait.deshmukh@student.nbr.edu', attendance: 85, cgpa: 8.0, status: 'active' },
  { id: 'NBR2024CE019', name: 'Meera Krishnan', department: 'CE', semester: 5, email: 'meera.krishnan@student.nbr.edu', attendance: 71, cgpa: 7.0, status: 'active' }
];

export const MOCK_FACULTY = [
  { id: 'FAC-CSE-001', name: 'Dr. Ananya Rao', department: 'CSE', designation: 'Professor & HOD', email: 'ananya.rao@nbr.edu', subjects: 2, load: 12, status: 'active' },
  { id: 'FAC-CSE-002', name: 'Prof. Karthik Subramanian', department: 'CSE', designation: 'Associate Professor', email: 'karthik.s@nbr.edu', subjects: 3, load: 16, status: 'active' },
  { id: 'FAC-CSE-003', name: 'Dr. Nandita Bose', department: 'CSE', designation: 'Assistant Professor', email: 'nandita.bose@nbr.edu', subjects: 3, load: 18, status: 'active' },
  { id: 'FAC-EC-001', name: 'Dr. Ravi Chandran', department: 'ECE', designation: 'Professor & HOD', email: 'ravi.c@nbr.edu', subjects: 2, load: 10, status: 'active' },
  { id: 'FAC-EC-002', name: 'Prof. Divya Suresh', department: 'ECE', designation: 'Assistant Professor', email: 'divya.s@nbr.edu', subjects: 4, load: 20, status: 'active' },
  { id: 'FAC-ME-001', name: 'Dr. Suresh Patil', department: 'ME', designation: 'Professor & HOD', email: 'suresh.patil@nbr.edu', subjects: 2, load: 10, status: 'active' },
  { id: 'FAC-EE-001', name: 'Prof. Kavitha Menon', department: 'EEE', designation: 'Professor & HOD', email: 'kavitha.m@nbr.edu', subjects: 3, load: 14, status: 'active' },
  { id: 'FAC-CE-001', name: 'Prof. Lakshmi Narayanan', department: 'CE', designation: 'Professor & HOD', email: 'lakshmi.n@nbr.edu', subjects: 2, load: 11, status: 'active' },
  { id: 'FAC-AI-001', name: 'Dr. Meghna Pillai', department: 'AI&DS', designation: 'Professor & HOD', email: 'meghna.p@nbr.edu', subjects: 2, load: 12, status: 'active' },
  { id: 'FAC-ME-002', name: 'Prof. Arvind Kulkarni', department: 'ME', designation: 'Associate Professor', email: 'arvind.k@nbr.edu', subjects: 3, load: 15, status: 'on-leave' }
];

export const MOCK_ATTENDANCE_DEPT = [
  { dept: 'CSE', percent: 89, color: '#0F766E' },
  { dept: 'AI&DS', percent: 91, color: '#1E63D6' },
  { dept: 'ECE', percent: 85, color: '#7C3AED' },
  { dept: 'EEE', percent: 83, color: '#D97706' },
  { dept: 'ME', percent: 82, color: '#0891B2' },
  { dept: 'CE', percent: 86, color: '#059669' }
];

export const MOCK_ATTENDANCE_RECORDS = [
  { id: 'att-1', date: '2026-10-23', subject: 'Database Management Systems', code: 'CS501', department: 'CSE', semester: 5, faculty: 'Dr. Ananya Rao', total: 62, present: 56, percent: 90 },
  { id: 'att-2', date: '2026-10-23', subject: 'Operating Systems', code: 'CS502', department: 'CSE', semester: 5, faculty: 'Prof. Karthik Subramanian', total: 62, present: 51, percent: 82 },
  { id: 'att-3', date: '2026-10-23', subject: 'Signals & Systems', code: 'EC301', department: 'ECE', semester: 3, faculty: 'Prof. Divya Suresh', total: 54, present: 47, percent: 87 },
  { id: 'att-4', date: '2026-10-22', subject: 'Machine Learning', code: 'AI402', department: 'AI&DS', semester: 5, faculty: 'Dr. Meghna Pillai', total: 48, present: 45, percent: 94 },
  { id: 'att-5', date: '2026-10-22', subject: 'Thermodynamics', code: 'ME203', department: 'ME', semester: 3, faculty: 'Prof. Arvind Kulkarni', total: 41, present: 32, percent: 78 },
  { id: 'att-6', date: '2026-10-21', subject: 'Structural Analysis', code: 'CE401', department: 'CE', semester: 5, faculty: 'Prof. Lakshmi Narayanan', total: 38, present: 34, percent: 89 }
];

export const MOCK_TIMETABLE_BATCHES = [
  { id: 'cse5', label: 'CSE · Sem 5', department: 'CSE', semester: 5, rooms: 3 },
  { id: 'cse3', label: 'CSE · Sem 3', department: 'CSE', semester: 3, rooms: 2 },
  { id: 'ece7', label: 'ECE · Sem 7', department: 'ECE', semester: 7, rooms: 2 },
  { id: 'ai5', label: 'AI&DS · Sem 5', department: 'AI&DS', semester: 5, rooms: 1 },
  { id: 'me3', label: 'ME · Sem 3', department: 'ME', semester: 3, rooms: 2 },
  { id: 'ce5', label: 'CE · Sem 5', department: 'CE', semester: 5, rooms: 2 }
];

export const MOCK_BATCH_TIMETABLE = {
  'cse5': [
    { day: 'Monday', slots: [
      { time: '09:00 – 09:55', subject: 'Database Management Systems', code: 'CS501', faculty: 'Dr. Ananya Rao', room: 'AB-201' },
      { time: '10:00 – 10:55', subject: 'Operating Systems', code: 'CS502', faculty: 'Prof. Karthik Subramanian', room: 'AB-201' },
      { time: '11:10 – 12:05', subject: 'Software Engineering', code: 'CS504', faculty: 'Prof. Arvind Kulkarni', room: 'LH-2' },
      { time: '13:30 – 15:20', subject: 'DBMS Lab', code: 'CS511', faculty: 'Dr. Nandita Bose', room: 'Lab-4' }
    ] },
    { day: 'Tuesday', slots: [
      { time: '09:00 – 09:55', subject: 'Computer Networks', code: 'CS503', faculty: 'Dr. Nandita Bose', room: 'AB-203' },
      { time: '10:00 – 10:55', subject: 'Discrete Mathematics', code: 'CS505', faculty: 'Dr. Sofia Fernandes', room: 'AB-203' },
      { time: '11:10 – 12:05', subject: 'Applied AI', code: 'CS506', faculty: 'Dr. Meghna Pillai', room: 'LH-1' }
    ] },
    { day: 'Wednesday', slots: [
      { time: '09:00 – 09:55', subject: 'Database Management Systems', code: 'CS501', faculty: 'Dr. Ananya Rao', room: 'AB-201' },
      { time: '10:00 – 10:55', subject: 'Operating Systems', code: 'CS502', faculty: 'Prof. Karthik Subramanian', room: 'AB-201' },
      { time: '13:30 – 15:20', subject: 'Networks Lab', code: 'CS513', faculty: 'Dr. Nandita Bose', room: 'Lab-3' }
    ] },
    { day: 'Thursday', slots: [
      { time: '09:00 – 09:55', subject: 'Software Engineering', code: 'CS504', faculty: 'Prof. Arvind Kulkarni', room: 'LH-2' },
      { time: '11:10 – 12:05', subject: 'Computer Networks', code: 'CS503', faculty: 'Dr. Nandita Bose', room: 'AB-203' },
      { time: '13:30 – 14:25', subject: 'Discrete Mathematics', code: 'CS505', faculty: 'Dr. Sofia Fernandes', room: 'AB-203' }
    ] },
    { day: 'Friday', slots: [
      { time: '10:00 – 10:55', subject: 'Applied AI', code: 'CS506', faculty: 'Dr. Meghna Pillai', room: 'LH-1' },
      { time: '11:10 – 12:05', subject: 'Database Management Systems', code: 'CS501', faculty: 'Dr. Ananya Rao', room: 'AB-201' }
    ] }
  ]
};

export const MOCK_EXAM_SESSIONS = [
  {
    id: 'nov-2026',
    name: 'End Semester · November 2026',
    type: 'Semester end',
    status: 'published',
    formDeadline: '2026-11-04',
    startDate: '2026-11-16',
    endDate: '2026-12-02',
    papers: [
      { id: 'p1', subject: 'Database Management Systems', code: 'CS501', date: '2026-11-17', time: '09:30 – 12:30', department: 'CSE', semester: 5, hall: 'Main Hall A' },
      { id: 'p2', subject: 'Operating Systems', code: 'CS502', date: '2026-11-19', time: '09:30 – 12:30', department: 'CSE', semester: 5, hall: 'Main Hall A' },
      { id: 'p3', subject: 'Computer Networks', code: 'CS503', date: '2026-11-21', time: '14:00 – 17:00', department: 'CSE', semester: 5, hall: 'Block B Hall' },
      { id: 'p4', subject: 'Signals & Systems', code: 'EC301', date: '2026-11-18', time: '09:30 – 12:30', department: 'ECE', semester: 3, hall: 'Block B Hall' },
      { id: 'p5', subject: 'Machine Learning', code: 'AI402', date: '2026-11-20', time: '14:00 – 17:00', department: 'AI&DS', semester: 5, hall: 'Main Hall B' },
      { id: 'p6', subject: 'Structural Analysis', code: 'CE401', date: '2026-11-24', time: '09:30 – 12:30', department: 'CE', semester: 5, hall: 'Block C Hall' }
    ]
  },
  {
    id: 'aug-2026',
    name: 'Backlog · August 2026',
    type: 'Backlog',
    status: 'result-published',
    formDeadline: '2026-08-02',
    startDate: '2026-08-10',
    endDate: '2026-08-18',
    papers: []
  }
];

export const MOCK_EXAM_FORMS = [
  { id: 'ef-101', rollNumber: 'NBR2024CS042', name: 'Aarav Sharma', department: 'CSE', semester: 5, type: 'Regular', subjects: 6, fee: 2000, status: 'pending', submitted: '2026-10-20' },
  { id: 'ef-102', rollNumber: 'NBR2023EC018', name: 'Sneha Iyer', department: 'ECE', semester: 7, type: 'Regular', subjects: 5, fee: 1800, status: 'pending', submitted: '2026-10-21' },
  { id: 'ef-103', rollNumber: 'NBR2024AI011', name: 'Ishaan Joshi', department: 'AI&DS', semester: 5, type: 'Regular', subjects: 6, fee: 2000, status: 'verified', submitted: '2026-10-19' },
  { id: 'ef-104', rollNumber: 'NBR2023EC022', name: 'Arjun Nair', department: 'ECE', semester: 7, type: 'Backlog', subjects: 2, fee: 400, status: 'pending', submitted: '2026-10-22' },
  { id: 'ef-105', rollNumber: 'NBR2024CE031', name: 'Ananya Gupta', department: 'CE', semester: 5, type: 'Regular', subjects: 6, fee: 2000, status: 'rejected', submitted: '2026-10-18', reason: 'Attendance below eligibility threshold' },
  { id: 'ef-106', rollNumber: 'NBR2024CE019', name: 'Meera Krishnan', department: 'CE', semester: 5, type: 'Regular', subjects: 6, fee: 2000, status: 'approved', submitted: '2026-10-16' },
  { id: 'ef-107', rollNumber: 'NBR2023EE009', name: 'Priya Venkatesh', department: 'EEE', semester: 7, type: 'Regular', subjects: 5, fee: 1800, status: 'verified', submitted: '2026-10-21' }
];

export const MOCK_LEAVE_REQUESTS = [
  { id: 'lv-1', faculty: 'Prof. Arvind Kulkarni', department: 'ME', type: 'Medical', from: '2026-10-28', to: '2026-10-30', days: 3, reason: 'Medical procedure scheduled', status: 'pending', applied: '2026-10-22' },
  { id: 'lv-2', faculty: 'Prof. Divya Suresh', department: 'ECE', type: 'Personal', from: '2026-11-03', to: '2026-11-03', days: 1, reason: 'Family function', status: 'pending', applied: '2026-10-24' },
  { id: 'lv-3', faculty: 'Dr. Sofia Fernandes', department: 'CSE', type: 'Conference', from: '2026-11-10', to: '2026-11-12', days: 3, reason: 'Presenting paper at ICET 2026', status: 'approved', applied: '2026-10-15' },
  { id: 'lv-4', faculty: 'Prof. Lakshmi Narayanan', department: 'CE', type: 'Personal', from: '2026-11-05', to: '2026-11-06', days: 2, reason: 'Travel to hometown', status: 'pending', applied: '2026-10-23' },
  { id: 'lv-5', faculty: 'Dr. Meghna Pillai', department: 'AI&DS', type: 'Conference', from: '2026-12-01', to: '2026-12-03', days: 3, reason: 'Keynote at NeurIPS workshop', status: 'approved', applied: '2026-10-10' },
  { id: 'lv-6', faculty: 'Prof. Kavitha Menon', department: 'EEE', type: 'Medical', from: '2026-10-20', to: '2026-10-21', days: 2, reason: 'Fever — advised rest', status: 'rejected', applied: '2026-10-19' },
  { id: 'lv-7', faculty: 'Dr. Ravi Chandran', department: 'ECE', type: 'Personal', from: '2026-11-14', to: '2026-11-14', days: 1, reason: 'Daughter’s school event', status: 'pending', applied: '2026-10-25' }
];

export const MOCK_MARKS_BATCHES = [
  { id: 'ia2-cse5', label: 'CSE · Sem 5 · Internal Assessment 2', department: 'CSE', semester: 5, exam: 'Internal Assessment 2', status: 'in-progress', entered: '3/6 subjects', deadline: '2026-10-30' },
  { id: 'ia2-ai5', label: 'AI&DS · Sem 5 · Internal Assessment 2', department: 'AI&DS', semester: 5, exam: 'Internal Assessment 2', status: 'open', entered: '0/5 subjects', deadline: '2026-10-30' },
  { id: 'ia2-ece7', label: 'ECE · Sem 7 · Internal Assessment 2', department: 'ECE', semester: 7, exam: 'Internal Assessment 2', status: 'locked', entered: '5/5 subjects', deadline: '2026-10-28' },
  { id: 'prac-me3', label: 'ME · Sem 3 · Lab Internals', department: 'ME', semester: 3, exam: 'Lab Internals', status: 'open', entered: '0/4 subjects', deadline: '2026-11-06' }
];

export const MOCK_MARKS_ENTRIES = [
  { id: 'mk-1', rollNumber: 'NBR2024CS042', name: 'Aarav Sharma', subject: 'DBMS · CS501', maxMarks: 50, obtained: 42 },
  { id: 'mk-2', rollNumber: 'NBR2024CS042', name: 'Aarav Sharma', subject: 'OS · CS502', maxMarks: 50, obtained: 38 },
  { id: 'mk-3', rollNumber: 'NBR2024CS043', name: 'Diya Patel', subject: 'DBMS · CS501', maxMarks: 50, obtained: 46 },
  { id: 'mk-4', rollNumber: 'NBR2024CS043', name: 'Diya Patel', subject: 'OS · CS502', maxMarks: 50, obtained: 44 },
  { id: 'mk-5', rollNumber: 'NBR2024CS061', name: 'Rohan Kulkarni', subject: 'DBMS · CS501', maxMarks: 50, obtained: 31 },
  { id: 'mk-6', rollNumber: 'NBR2024AI011', name: 'Ishaan Joshi', subject: 'Machine Learning · AI402', maxMarks: 50, obtained: 48 }
];

export const MOCK_FEE_STRUCTURES = [
  { id: 'fee-1', stream: 'B.Tech CSE', semester: 5, tuition: 62000, lab: 6000, library: 2000, exam: 2400, misc: 3000, total: 75400 },
  { id: 'fee-2', stream: 'B.Tech AI&DS', semester: 5, tuition: 58000, lab: 8000, library: 2000, exam: 2400, misc: 3000, total: 73400 },
  { id: 'fee-3', stream: 'B.Tech ECE', semester: 7, tuition: 56000, lab: 6000, library: 2000, exam: 2400, misc: 3000, total: 69400 },
  { id: 'fee-4', stream: 'M.Tech CSE', semester: 3, tuition: 82000, lab: 10000, library: 2500, exam: 3000, misc: 3000, total: 100500 }
];

export const MOCK_FEE_COLLECTIONS = [
  { id: 'fc-1', department: 'CSE', semester: 'Sem 5', total: 28953600, collected: 27648000, pending: 1305600, defaulters: 17, percent: 95 },
  { id: 'fc-2', department: 'AI&DS', semester: 'Sem 5', total: 13652400, collected: 12904800, pending: 747600, defaulters: 10, percent: 95 },
  { id: 'fc-3', department: 'ECE', semester: 'Sem 7', total: 14712800, collected: 14014200, pending: 698600, defaulters: 9, percent: 95 },
  { id: 'fc-4', department: 'ME', semester: 'Sem 3', total: 12214400, collected: 11238400, pending: 976000, defaulters: 14, percent: 92 },
  { id: 'fc-5', department: 'CE', semester: 'Sem 5', total: 11611600, collected: 10939600, pending: 672000, defaulters: 8, percent: 94 },
  { id: 'fc-6', department: 'EEE', semester: 'Sem 7', total: 8883200, collected: 8360600, pending: 522600, defaulters: 6, percent: 94 }
];

export const MOCK_FEE_DEFAULTERS = [
  { id: 'fd-1', rollNumber: 'NBR2025ME014', name: 'Vikram Singh', department: 'ME', semester: 3, due: 75400, daysOverdue: 24, noticesSent: 2 },
  { id: 'fd-2', rollNumber: 'NBR2023EC022', name: 'Arjun Nair', department: 'ECE', semester: 7, due: 69400, daysOverdue: 18, noticesSent: 1 },
  { id: 'fd-3', rollNumber: 'NBR2025ME007', name: 'Kavya Reddy', department: 'ME', semester: 3, due: 37700, daysOverdue: 12, noticesSent: 1 },
  { id: 'fd-4', rollNumber: 'NBR2024CE019', name: 'Meera Krishnan', department: 'CE', semester: 5, due: 75400, daysOverdue: 9, noticesSent: 0 },
  { id: 'fd-5', rollNumber: 'NBR2024CS061', name: 'Rohan Kulkarni', department: 'CSE', semester: 3, due: 37700, daysOverdue: 6, noticesSent: 0 }
];

export const MOCK_NOTICES = [
  { id: 'n-1', title: 'End Semester examination timetable published', department: 'COE', category: 'Examinations', date: '2026-10-24', priority: 'high', pinned: true, body: 'The end semester timetable for November 2026 is now published. Students must verify their hall allotments on the exam portal and report discrepancies to the COE office before 4 November.' },
  { id: 'n-2', title: 'Internal Assessment 2 marks entry window open', department: 'Academics', category: 'Academics', date: '2026-10-22', priority: 'medium', pinned: false, body: 'Faculty are requested to complete IA-2 marks entry before 30 October. HODs must verify and lock batches by 1 November.' },
  { id: 'n-3', title: 'Campus Wi-Fi maintenance on Sunday morning', department: 'IT Services', category: 'Infrastructure', date: '2026-10-21', priority: 'low', pinned: false, body: 'Campus Wi-Fi will be unavailable on Sunday 1 November from 06:00 to 09:00 for scheduled upgrades.' },
  { id: 'n-4', title: 'Library overdue fine amnesty week', department: 'Library', category: 'General', date: '2026-10-20', priority: 'low', pinned: false, body: 'Return overdue books during 26–31 October to receive a full fine waiver.' },
  { id: 'n-5', title: 'Tech fest registrations closing soon', department: 'Student Affairs', category: 'Events', date: '2026-10-18', priority: 'medium', pinned: false, body: 'Last date to register teams for TechNova 2026 is 30 October. Faculty mentors must approve team lists in the portal.' },
  { id: 'n-6', title: 'Semester feedback window for odd semesters', department: 'IQAC', category: 'Academics', date: '2026-10-15', priority: 'medium', pinned: false, body: 'Students can submit semester feedback until 20 November. Feedback is anonymous and used for accreditation reporting.' }
];

export const MOCK_STAFF_NOTICES = [
  { id: 'sn-1', title: 'Faculty appraisal documents due', department: 'HR', category: 'HR', date: '2026-10-23', priority: 'high', pinned: true, audience: 'All faculty', body: 'Self-appraisal forms for the current cycle are due by 7 November.' },
  { id: 'sn-2', title: 'Payroll: November salary crediting date', department: 'Finance', category: 'Finance', date: '2026-10-20', priority: 'low', pinned: false, audience: 'All staff', body: 'Salaries will be credited on 31 October. Reimbursement claims must be filed by 25 October.' },
  { id: 'sn-3', title: 'NAAC preparatory committee meeting', department: 'IQAC', category: 'Academics', date: '2026-10-19', priority: 'medium', pinned: false, audience: 'Committee members', body: 'Meeting on 28 October, 3 PM, Board Room 2. Attendance mandatory.' },
  { id: 'sn-4', title: 'New laboratory booking policy', department: 'Academics', category: 'Policy', date: '2026-10-16', priority: 'medium', pinned: false, audience: 'Lab in-charges', body: 'All lab slots must be booked through the portal at least 48 hours in advance.' }
];

export const MOCK_ORG_EVENTS = [
  { id: 'ev-1', title: 'TechNova 2026 inauguration', type: 'event', date: '2026-11-06', time: '09:30', venue: 'Main Auditorium', organizer: 'Student Affairs', tone: 'violet' },
  { id: 'ev-2', title: 'End semester exams begin', type: 'exam', date: '2026-11-16', time: '09:30', venue: 'All halls', organizer: 'COE', tone: 'rose' },
  { id: 'ev-3', title: 'IA-2 marks entry deadline', type: 'deadline', date: '2026-10-30', time: '17:00', venue: 'Portal', organizer: 'Academics', tone: 'amber' },
  { id: 'ev-4', title: 'Convocation rehearsal', type: 'meeting', date: '2026-11-21', time: '11:00', venue: 'Main Auditorium', organizer: 'Administration', tone: 'teal' },
  { id: 'ev-5', title: 'Annual sports meet', type: 'event', date: '2026-11-28', time: '08:00', venue: 'Sports Ground', organizer: 'Physical Education', tone: 'emerald' },
  { id: 'ev-6', title: 'Research symposium', type: 'event', date: '2026-12-05', time: '10:00', venue: 'Seminar Hall 1', organizer: 'R&D Cell', tone: 'blue' }
];

export const MOCK_LIBRARY_APPROVALS = [
  { id: 'lib-1', kind: 'digital', title: 'IEEE Xplore — Department access', requestedBy: 'Dr. Ananya Rao', department: 'CSE', purpose: 'Research literature access for PG students', status: 'pending', requested: '2026-10-21' },
  { id: 'lib-2', kind: 'digital', title: 'SpringerLink eBooks — 12 titles', requestedBy: 'Dr. Meghna Pillai', department: 'AI&DS', purpose: 'Course reference for Machine Learning', status: 'pending', requested: '2026-10-22' },
  { id: 'lib-3', kind: 'physical', title: '“Clean Architecture” × 4 copies', requestedBy: 'Prof. Karthik Subramanian', department: 'CSE', purpose: 'Software Engineering course text', status: 'approved', requested: '2026-10-15' },
  { id: 'lib-4', kind: 'digital', title: 'Turnitin instructor seats — 6', requestedBy: 'IQAC Office', department: 'Administration', purpose: 'Plagiarism checks for project reports', status: 'pending', requested: '2026-10-24' },
  { id: 'lib-5', kind: 'physical', title: 'Fluid Mechanics lab manuals × 30', requestedBy: 'Prof. Arvind Kulkarni', department: 'ME', purpose: 'Lab coursework for Sem 3', status: 'rejected', requested: '2026-10-18' }
];

export const MOCK_FEATURE_FLAGS = [
  { id: 'ai_tutor', label: 'Amy AI tutor', description: 'Socratic tutoring chat across portals', defaultOn: true, roles: ['student', 'faculty'] },
  { id: 'ai_mindmaps', label: 'AI mind maps', description: 'Mermaid mind map generation from syllabus', defaultOn: true, roles: ['student'] },
  { id: 'ai_file_summary', label: 'File summarisation', description: 'PDF/DOCX/image summarisation in AI studio', defaultOn: true, roles: ['student', 'faculty'] },
  { id: 'ai_video_breakdown', label: 'Lecture video breakdown', description: 'Auto chaptering of uploaded lectures', defaultOn: false, roles: ['student', 'faculty'] },
  { id: 'lms_courses', label: 'LMS course modules', description: 'Module-wise course content and videos', defaultOn: true, roles: ['student', 'faculty'] },
  { id: 'library_loans', label: 'Library loans', description: 'Physical book loans with fines', defaultOn: true, roles: ['student', 'faculty'] },
  { id: 'digital_vault', label: 'Digital vault', description: 'Encrypted credential vault with approvals', defaultOn: true, roles: ['student', 'faculty'] },
  { id: 'exam_forms', label: 'Exam forms & COE', description: 'Regular/backlog exam form workflow', defaultOn: true, roles: ['student', 'admin'] },
  { id: 'admit_cards', label: 'QR admit cards', description: 'Printable QR + barcode admit cards', defaultOn: true, roles: ['student'] },
  { id: 'sem_feedback', label: 'Semester feedback', description: 'Anonymous course feedback collection', defaultOn: true, roles: ['student'] },
  { id: 'attendance_tracking', label: 'Attendance tracking', description: 'Daily subject-wise attendance', defaultOn: true, roles: ['student', 'faculty', 'admin'] },
  { id: 'fees_module', label: 'Fees & payments', description: 'Fee ledger, reminders and collections', defaultOn: true, roles: ['student', 'admin'] },
  { id: 'notices', label: 'Notices & reactions', description: 'Notice feed with reactions and comments', defaultOn: true, roles: ['all'] },
  { id: 'org_calendar', label: 'Org calendar', description: 'Institution event calendar', defaultOn: true, roles: ['all'] },
  { id: 'staff_notices', label: 'Staff notices', description: 'Internal staff communication board', defaultOn: true, roles: ['admin', 'faculty'] }
];

export const MOCK_INSTITUTION_SETTINGS = {
  name: 'Northbridge University',
  code: 'NBR',
  address: '14 Lakeview Campus Road, Bengaluru 560001',
  phone: '+91 80 4221 7000',
  email: 'office@nbr.edu',
  semesterType: 'Semester',
  academicYear: '2026-27',
  attendanceThreshold: 75,
  gradingScheme: '10-point CGPA',
  finePerDay: 10,
  loanDays: 14,
  sessionHours: { student: 24, campusAdmin: 12 },
  timezone: 'Asia/Kolkata'
};

export const MOCK_ACCOUNT_TEMPLATES = [
  { id: 'students', label: 'Student bulk import', format: 'CSV · rollNumber, name, email, department, semester', sample: 'NBR2026CS101,Aditi Verma,aditi.v@student.nbr.edu,CSE,1', count: 'Up to 500 rows' },
  { id: 'faculty', label: 'Faculty bulk import', format: 'CSV · employeeId, name, email, department, designation', sample: 'FAC-CSE-101,Dr. Ramesh Bhat,ramesh.bhat@nbr.edu,CSE,Assistant Professor', count: 'Up to 100 rows' }
];

export const MOCK_QUICK_ACTIONS = [
  { id: 'publish-notice', label: 'Publish a notice', hint: 'Broadcast to students & faculty', tab: 'notices', tone: 'teal' },
  { id: 'verify-forms', label: 'Verify exam forms', hint: '23 forms awaiting review', tab: 'coe', tone: 'amber' },
  { id: 'mark-attendance', label: 'Review attendance', hint: 'Campus average 87.2%', tab: 'attendance', tone: 'emerald' },
  { id: 'enter-marks', label: 'Marks entry', hint: 'IA-2 window open', tab: 'marks', tone: 'violet' },
  { id: 'approve-leaves', label: 'Approve faculty leaves', hint: '7 pending requests', tab: 'faculty-leaves', tone: 'rose' },
  { id: 'library-queue', label: 'Library approvals', hint: '3 requests in queue', tab: 'digital-library', tone: 'blue' },
  { id: 'fee-defaulters', label: 'Fee defaulters', hint: '₹3.2L pending', tab: 'fees', tone: 'orange' },
  { id: 'exam-schedule', label: 'Exam schedule', hint: 'Nov 2026 session live', tab: 'exams', tone: 'sky' }
];

export const ADMIN_TAB_DESCRIPTIONS = {
  overview: 'Campus pulse — students, attendance, fees and exam readiness at a glance.',
  'bento-hub': 'Frequent admin actions grouped in one place.',
  departments: 'Departments, streams, subjects and HOD assignments.',
  timetable: 'Batch-wise timetables for the current term.',
  attendance: 'Department-wise attendance snapshots and class records.',
  marks: 'Internal assessment marks entry and batch locking.',
  fees: 'Fee structures, collections and defaulter tracking.',
  coe: 'Exam form verification, eligibility checks and approvals.',
  exams: 'Exam sessions, paper schedules and result publishing.',
  users: 'Students and faculty across departments with status control.',
  'account-creation': 'Create accounts individually or import in bulk.',
  'faculty-leaves': 'Faculty leave requests with approval workflow.',
  notices: 'Student-facing notices with reactions and comments.',
  'staff-notices': 'Internal notices for faculty and staff.',
  'org-calendar': 'Institution-wide events, exams and deadlines.',
  'digital-library': 'Library resources, loan queue and digital vault approvals.',
  'feature-manager': 'Turn campus features on or off per role.',
  settings: 'Institution profile, session policies and grading defaults.'
};
