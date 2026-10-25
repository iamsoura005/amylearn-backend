import { Building2, ClipboardList, LayoutDashboard, LifeBuoy, Settings, Users } from 'lucide-react';

export const MOCK_IT_ADMIN = {
  name: 'Aisha Verma',
  email: 'admin.support@amylearn.app',
  designation: 'Platform Administrator',
  employeeId: 'AL-ADM-001'
};

export const IT_SECTIONS = [
  { id: 'core', label: 'Console' },
  { id: 'tenants', label: 'Tenants' },
  { id: 'people', label: 'People' },
  { id: 'support', label: 'Support' },
  { id: 'system', label: 'System' }
];

export const IT_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'core' },
  { id: 'institutions', label: 'Institutions', icon: Building2, section: 'tenants', badge: '8' },
  { id: 'users', label: 'Platform staff', icon: Users, section: 'people' },
  { id: 'requests', label: 'Support requests', icon: LifeBuoy, section: 'support', badge: '5' },
  { id: 'audit', label: 'Audit log', icon: ClipboardList, section: 'support' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'system' }
];

export const MOCK_PLATFORM_STATS = [
  { id: 'campuses', label: 'Live campuses', value: '6', hint: '+1 onboarding', tone: 'blue' },
  { id: 'students', label: 'Students served', value: '8,214', hint: 'Across all tenants', tone: 'teal' },
  { id: 'uptime', label: 'Platform uptime', value: '99.98%', hint: 'Last 30 days', tone: 'emerald' },
  { id: 'tickets', label: 'Open requests', value: '5', hint: '3 high priority', tone: 'amber' }
];

export const MOCK_INSTITUTIONS = [
  { id: 'nbr', code: 'NBR', name: 'Northbridge University', city: 'Bengaluru', plan: 'Enterprise', students: 1240, seats: 2000, status: 'live', joined: '2024-04-12', admin: 'Dr. Meera Iyer' },
  { id: 'glx', code: 'GLX', name: 'Galaxy Institute of Technology', city: 'Hyderabad', plan: 'Enterprise', students: 1832, seats: 2500, status: 'live', joined: '2024-01-08', admin: 'Prof. Ritu Malhotra' },
  { id: 'svp', code: 'SVP', name: 'Surya Valley Polytechnic', city: 'Pune', plan: 'Growth', students: 640, seats: 800, status: 'live', joined: '2024-08-21', admin: 'Mr. Amit Desai' },
  { id: 'mrg', code: 'MRG', name: 'Meridian School of Management', city: 'Chennai', plan: 'Growth', students: 380, seats: 500, status: 'live', joined: '2025-02-03', admin: 'Dr. Kavya Sridhar' },
  { id: 'hvn', code: 'HVN', name: 'Haven College of Arts & Science', city: 'Kochi', plan: 'Essential', students: 520, seats: 600, status: 'live', joined: '2025-06-17', admin: 'Ms. Anna Mathew' },
  { id: 'ptr', code: 'PTR', name: 'Pratham Institute of Design', city: 'Mumbai', plan: 'Essential', students: 210, seats: 300, status: 'live', joined: '2025-09-05', admin: "Mr. Neil D'Souza" },
  { id: 'crb', code: 'CRB', name: 'Crestview Business School', city: 'New Delhi', plan: 'Growth', students: 0, seats: 450, status: 'onboarding', joined: '2026-10-11', admin: 'Pending assignment' },
  { id: 'omk', code: 'OMK', name: 'Omkara Medical College', city: 'Lucknow', plan: 'Enterprise', students: 0, seats: 1200, status: 'suspended', joined: '2024-11-30', admin: 'Dr. Farhan Ali' }
];

export const MOCK_PLATFORM_STAFF = [
  { id: 'stf-1', name: 'Rohan Iyer', email: 'manager.ops@amylearn.app', role: 'amylearn_manager', label: 'Operations manager', tenants: 'All', status: 'active', lastActive: '2026-10-25' },
  { id: 'stf-2', name: 'Tanvi Kulkarni', email: 'tanvi.support@amylearn.app', role: 'it_user', label: 'Support engineer', tenants: 'All', status: 'active', lastActive: '2026-10-25' },
  { id: 'stf-3', name: 'Dev Malhotra', email: 'dev.onboarding@amylearn.app', role: 'it_user', label: 'Onboarding specialist', tenants: 'CRB, HVN', status: 'active', lastActive: '2026-10-24' },
  { id: 'stf-4', name: 'Sana Sheikh', email: 'sana.finance@amylearn.app', role: 'amylearn_manager', label: 'Billing manager', tenants: 'All', status: 'active', lastActive: '2026-10-23' },
  { id: 'stf-5', name: 'Arun Prabhu', email: 'arun.qa@amylearn.app', role: 'it_user', label: 'QA analyst', tenants: 'NBR, GLX', status: 'invited', lastActive: '—' }
];

export const MOCK_SUPPORT_REQUESTS = [
  { id: 'tkt-1042', campus: 'NBR', title: 'Bulk import failed for 64-row CSV', raisedBy: 'Dr. Meera Iyer', priority: 'high', status: 'open', category: 'Account creation', created: '2026-10-24', notes: 'Upload error at row 61 — suspected duplicate roll numbers.' },
  { id: 'tkt-1041', campus: 'GLX', title: 'Admit card QR not scanning on some devices', raisedBy: 'Prof. Ritu Malhotra', priority: 'high', status: 'open', category: 'Examinations', created: '2026-10-23', notes: 'Reports from 4 students using older Android browsers.' },
  { id: 'tkt-1040', campus: 'HVN', title: 'Request to enable trimester mode', raisedBy: 'Ms. Anna Mathew', priority: 'medium', status: 'open', category: 'Configuration', created: '2026-10-22', notes: 'College runs three terms; current semester type is a blocker.' },
  { id: 'tkt-1038', campus: 'SVP', title: 'Email delivery delayed for fee reminders', raisedBy: 'Mr. Amit Desai', priority: 'medium', status: 'in-progress', category: 'Email', created: '2026-10-20', notes: 'SMTP queue backed up; monitoring delivery rates.' },
  { id: 'tkt-1036', campus: 'MRG', title: 'Cloudinary video streaming buffering', raisedBy: 'Dr. Kavya Sridhar', priority: 'high', status: 'in-progress', category: 'LMS', created: '2026-10-18', notes: 'High-bitrate lecture uploads; recommending transcoding profile.' },
  { id: 'tkt-1033', campus: 'PTR', title: 'Add two new departments', raisedBy: "Mr. Neil D'Souza", priority: 'low', status: 'resolved', category: 'Configuration', created: '2026-10-12', notes: 'Departments created and streams mapped.' },
  { id: 'tkt-1029', campus: 'GLX', title: 'Session timeout too short for admins', raisedBy: 'Prof. Ritu Malhotra', priority: 'low', status: 'resolved', category: 'Auth', created: '2026-10-05', notes: 'Extended campus admin TTL to 12 hours.' }
];

export const MOCK_AUDIT_EVENTS = [
  { id: 'au-1', actor: 'admin.support@amylearn.app', action: 'feature.toggle', target: 'NBR · ai_video_breakdown', detail: 'enabled', at: '2026-10-25T09:41:00Z' },
  { id: 'au-2', actor: 'manager.ops@amylearn.app', action: 'tenant.suspend', target: 'OMK', detail: 'suspended · unpaid invoices', at: '2026-10-24T14:12:00Z' },
  { id: 'au-3', actor: 'dev.onboarding@amylearn.app', action: 'tenant.create', target: 'CRB', detail: 'onboarding started', at: '2026-10-11T10:05:00Z' },
  { id: 'au-4', actor: 'admin.campus@amylearn.demo', action: 'role.assign', target: 'NBR · FAC-CSE-002', detail: 'granted faculty access', at: '2026-10-23T16:30:00Z' },
  { id: 'au-5', actor: 'tanvi.support@amylearn.app', action: 'ticket.update', target: 'tkt-1038', detail: 'status → in-progress', at: '2026-10-21T11:22:00Z' },
  { id: 'au-6', actor: 'sana.finance@amylearn.app', action: 'billing.invoice', target: 'GLX', detail: 'invoice #INV-1092 generated', at: '2026-10-20T09:00:00Z' },
  { id: 'au-7', actor: 'admin.support@amylearn.app', action: 'platform.update', target: 'email.gateway', detail: 'rate limit raised to 500/hr', at: '2026-10-19T18:47:00Z' }
];

export const MOCK_PLATFORM_FEATURES = [
  { id: 'ai_tutor', label: 'Amy AI tutor', description: 'Socratic tutor available in every tenant portal', defaultOn: true },
  { id: 'ai_mindmaps', label: 'AI mind maps', description: 'Mermaid mind map generation', defaultOn: true },
  { id: 'ai_file_summary', label: 'File summarisation', description: 'PDF/DOCX/image summarisation', defaultOn: true },
  { id: 'ai_video_breakdown', label: 'Lecture video breakdown', description: 'Auto chaptering of lecture videos (beta)', defaultOn: false },
  { id: 'lms_courses', label: 'LMS course modules', description: 'Module content with Cloudinary streaming', defaultOn: true },
  { id: 'library_loans', label: 'Library loans', description: '14-day loans with ₹10/day fines', defaultOn: true },
  { id: 'digital_vault', label: 'Digital vault', description: 'Encrypted credential vault with approval flow', defaultOn: true },
  { id: 'exam_forms', label: 'Exam forms & COE', description: 'Regular/backlog exam form workflow', defaultOn: true },
  { id: 'admit_cards', label: 'QR admit cards', description: 'Printable QR + barcode admit cards', defaultOn: true },
  { id: 'sem_feedback', label: 'Semester feedback', description: 'Anonymous course feedback', defaultOn: true },
  { id: 'attendance_tracking', label: 'Attendance tracking', description: 'Daily subject-wise attendance', defaultOn: true },
  { id: 'fees_module', label: 'Fees & payments', description: 'Fee ledgers and collections', defaultOn: true },
  { id: 'notices', label: 'Notices & reactions', description: 'Notice feed with reactions and comments', defaultOn: true },
  { id: 'org_calendar', label: 'Org calendar', description: 'Institution event calendar', defaultOn: true },
  { id: 'staff_notices', label: 'Staff notices', description: 'Internal staff communication', defaultOn: true }
];

export const MOCK_PLATFORM_SETTINGS = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'noreply@amylearn.app',
  rateLimitPerHour: 500,
  jwtAccessTtl: '8h',
  tokenBlacklistDays: 30,
  maxUploadMb: 25,
  sessionTtls: { it: 8, campusAdmin: 12, college: 24, student: 24 }
};
