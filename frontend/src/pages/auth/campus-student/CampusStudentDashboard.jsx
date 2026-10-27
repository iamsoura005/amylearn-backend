import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';
import { SidebarFooterLinks } from '@/components/global/SidebarFooterLinks';
import { Avatar } from '@/components/ui/Primitives';
import { AiDrawer } from '@/components/ai/AiDrawer';
import { StudentTabSkeleton } from '@/pages/auth/campus-student/components/skeletons/CampusStudentSkeletons';
import {
  MOCK_STUDENT,
  MOCK_NOTICES,
  STUDENT_NAV_ITEMS,
  STUDENT_SECTIONS,
  TAB_DESCRIPTIONS
} from '@/pages/auth/campus-student/constants/campusStudentConstants';

import StudentOverviewTab from '@/pages/auth/campus-student/components/tabs/StudentOverviewTab';
import StudentBentoHubTab from '@/pages/auth/campus-student/components/tabs/StudentBentoHubTab';
import StudentCoursesTab from '@/pages/auth/campus-student/components/tabs/StudentCoursesTab';
import StudentAssignmentsTab from '@/pages/auth/campus-student/components/tabs/StudentAssignmentsTab';
import StudentAttendanceTab from '@/pages/auth/campus-student/components/tabs/StudentAttendanceTab';
import StudentDigitalLibraryTab from '@/pages/auth/campus-student/components/tabs/StudentDigitalLibraryTab';
import StudentDeptNoticesTab from '@/pages/auth/campus-student/components/tabs/StudentDeptNoticesTab';
import StudentProjectInfoTab from '@/pages/auth/campus-student/components/tabs/StudentProjectInfoTab';
import StudentTimetableTab from '@/pages/auth/campus-student/components/tabs/StudentTimetableTab';
import StudentAiStudyTab from '@/pages/auth/campus-student/components/tabs/StudentAiStudyTab';
import StudentNoticesTab from '@/pages/auth/campus-student/components/tabs/StudentNoticesTab';
import StudentOrgCalendarTab from '@/pages/auth/campus-student/components/tabs/StudentOrgCalendarTab';
import StudentPaymentDetailsTab from '@/pages/auth/campus-student/components/tabs/StudentPaymentDetailsTab';
import StudentFeesTab from '@/pages/auth/campus-student/components/tabs/StudentFeesTab';
import StudentMarksTab from '@/pages/auth/campus-student/components/tabs/StudentMarksTab';
import StudentAdmitCardTab from '@/pages/auth/campus-student/components/tabs/StudentAdmitCardTab';
import StudentExamFormTab from '@/pages/auth/campus-student/components/tabs/StudentExamFormTab';
import StudentSemFeedbackTab from '@/pages/auth/campus-student/components/tabs/StudentSemFeedbackTab';
import StudentProfileTab from '@/pages/auth/campus-student/components/tabs/StudentProfileTab';
import StudentPaymentHistoryTab from '@/pages/auth/campus-student/components/tabs/StudentPaymentHistoryTab';

const TAB_COMPONENTS = {
  overview: StudentOverviewTab,
  'bento-hub': StudentBentoHubTab,
  courses: StudentCoursesTab,
  assignments: StudentAssignmentsTab,
  attendance: StudentAttendanceTab,
  'digital-library': StudentDigitalLibraryTab,
  'dept-notices': StudentDeptNoticesTab,
  'project-info': StudentProjectInfoTab,
  timetable: StudentTimetableTab,
  'ai-study': StudentAiStudyTab,
  notices: StudentNoticesTab,
  'org-calendar': StudentOrgCalendarTab,
  'payment-details': StudentPaymentDetailsTab,
  fees: StudentFeesTab,
  marks: StudentMarksTab,
  'admit-card': StudentAdmitCardTab,
  'exam-form': StudentExamFormTab,
  'sem-feedback': StudentSemFeedbackTab,
  profile: StudentProfileTab,
  'payment-history': StudentPaymentHistoryTab
};

const Sidebar = ({ activeTab, setTab, student, college, onLogout, onClose }) => {
  const sections = useMemo(
    () =>
      STUDENT_SECTIONS.map((section) => ({
        ...section,
        items: STUDENT_NAV_ITEMS.filter((item) => item.section === section.id)
      })),
    []
  );

  const navItem = (item) => {
    const Icon = item.icon;
    const active = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setTab(item.id);
          onClose?.();
        }}
        className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
          active ? 'bg-white/14 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white/90'
        }`}
      >
        {active ? <span className="absolute -left-2 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-learningTeal" /> : null}
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? 'bg-white/12 text-learningTeal' : 'text-white/45 group-hover:text-white/80'}`}>
          <Icon size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[11px] font-semibold ${active ? 'text-white' : ''}`}>{item.label}</span>
        </span>
        {item.badge ? (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
              item.badge === 'AI'
                ? 'bg-gradient-to-r from-ai-500 to-ai-300 text-white'
                : active
                  ? 'bg-white/15 text-white/80'
                  : 'bg-white/8 text-white/55'
            }`}
          >
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#14112e] via-[#1d1747] to-[#2b2666]">
      <div className="flex items-center justify-between px-4 pb-4 pt-4">
        <Link to="/" onClick={onClose}>
          <AmyLearnLogo size={32} tone="light" showTagline />
        </Link>
        {onClose ? (
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/70 lg:hidden" aria-label="Close menu">
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="mx-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
        <div className="flex items-center gap-2">
          <Avatar name={student.name} size="sm" tone="indigo" className="!bg-white/15 !text-white" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-white">{student.name}</p>
            <p className="truncate text-[9px] font-medium text-white/55">
              {student.rollNumber} · Sem {student.semester}
            </p>
          </div>
          <span className="rounded-full bg-learningTeal/15 px-1.5 py-0.5 text-[8px] font-bold text-learningTeal">Student</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/8 pt-2 text-[9px] font-semibold text-white/55">
          <span className="grid h-4 w-4 place-items-center rounded bg-white/10 text-[7px] font-bold text-white/60">
            {college?.collegeCode || 'NBR'}
          </span>
          <span className="truncate">{college?.name || 'Northbridge University'}</span>
        </div>
      </div>

      <nav className="portal-sidebar-scroll mt-3 flex-1 overflow-y-auto px-3 pb-3">
        {sections.map((section) => (
          <div key={section.id} className={section.label ? 'mt-4' : ''}>
            {section.label ? (
              <p className="mb-1.5 px-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">{section.label}</p>
            ) : (
              <p className="mb-1.5 px-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/55">Portal</p>
            )}
            <div className="space-y-0.5">{section.items.map(navItem)}</div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-3">
        <button
          onClick={() => setTab('ai-study')}
          className="relative w-full overflow-hidden rounded-xl border border-ai-400/30 bg-gradient-to-br from-ai-600/30 to-ai-400/15 p-3 text-left transition-colors hover:from-ai-600/40"
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-ai-400/20 blur-xl" />
          <div className="relative flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-ai-500 to-ai-300 text-white">
              <Sparkles size={13} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white">Ask Amy anything</p>
              <p className="text-[8px] text-white/55">Tutor · mind maps · summaries</p>
            </div>
          </div>
        </button>
        <div className="mt-3 flex items-center justify-between">
          <SidebarFooterLinks tone="light" />
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[9px] font-bold text-white/55 hover:bg-white/10 hover:text-white/80"
          >
            <LogOut size={10} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export const CampusStudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, selectedCollege, logoutStudent } = useAuth();
  const { triggerPopup } = useErrorPopup();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(TAB_COMPONENTS[initialTab] ? initialTab : 'overview');
  const [loadingTab, setLoadingTab] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visited = useRef(new Set());
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!notifOpen && !profileOpen) return;
    const handlePointerDown = (event) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen, profileOpen]);

  const student = useMemo(
    () => ({
      ...MOCK_STUDENT,
      ...(user || {}),
      name: user?.name || MOCK_STUDENT.name,
      email: user?.email || MOCK_STUDENT.email,
      rollNumber: user?.rollNumber || MOCK_STUDENT.rollNumber
    }),
    [user]
  );

  const college = selectedCollege || { name: 'Northbridge University', collegeCode: 'NBR' };
  const activeItem = STUDENT_NAV_ITEMS.find((item) => item.id === activeTab) || STUDENT_NAV_ITEMS[0];
  const ActiveTab = TAB_COMPONENTS[activeTab] || StudentOverviewTab;

  useEffect(() => {
    setLoadingTab(true);
    const delay = visited.current.has(activeTab) ? 140 : 320;
    const timer = window.setTimeout(() => {
      visited.current.add(activeTab);
      setLoadingTab(false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (!searchParams.get('tab') || searchParams.get('tab') !== activeTab) {
      setSearchParams(activeTab === 'overview' ? {} : { tab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const setTab = (tab) => {
    if (!TAB_COMPONENTS[tab]) return;
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutStudent();
    navigate('/login');
  };

  const headerSearch = (event) => {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    const match = STUDENT_NAV_ITEMS.find((item) => item.label.toLowerCase().includes(value) || item.id.includes(value));
    if (match) setTab(match.id);
    else triggerPopup(`No module matched “${query}”. Try “fees”, “marks” or “timetable”.`, 'info');
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] lg:block">
        <Sidebar activeTab={activeTab} setTab={setTab} student={student} college={college} onLogout={handleLogout} />
      </aside>

      <AnimatePresence>
        {mobileMenu ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-deepNavy/45 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenu(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="h-full w-[82%] max-w-[300px] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setTab={setTab}
                student={student}
                college={college}
                onLogout={handleLogout}
                onClose={() => setMobileMenu(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-indigo-100/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[60px] items-center gap-3 px-3 sm:px-5">
            <button
              onClick={() => setMobileMenu(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>

            <div className="hidden min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500 md:flex">
              <span>Student portal</span>
              <ChevronRight size={11} />
              <span className="truncate text-indigo-700">{activeItem.label}</span>
            </div>

            <form onSubmit={headerSearch} className="ml-auto hidden max-w-xs flex-1 items-center sm:flex lg:ml-6">
              <label className="relative flex w-full items-center">
                <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jump to a module…"
                  className="w-full rounded-xl border border-indigo-100 bg-[#F8F7FF] py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
              <button
                onClick={() => setAiOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-ai-500 to-ai-300 px-2.5 py-2 text-[10px] font-bold font-jost text-white shadow-ai-glow hover:opacity-95"
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">Ask Amy</span>
              </button>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen((value) => !value);
                    setProfileOpen(false);
                  }}
                  className="relative grid min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-indigo-100 bg-white text-slate-500 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  aria-label="Notifications"
                >
                  <Bell size={15} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                {notifOpen ? (
                  <div className="absolute right-0 mt-2 w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-bento">
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                      <p className="text-[11px] font-bold text-deepNavy font-jost">Latest notices</p>
                      <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold text-indigo-700">4 unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      {MOCK_NOTICES.slice(0, 3).map((notice) => (
                        <button
                          key={notice.id}
                          onClick={() => {
                            setNotifOpen(false);
                            setTab('notices');
                          }}
                          className="w-full rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
                        >
                          <p className="truncate text-[10px] font-bold text-deepNavy">{notice.title}</p>
                          <p className="mt-0.5 text-[9px] text-slate-500">{notice.department} · {format(new Date(notice.date), 'd MMM')}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        setTab('notices');
                      }}
                      className="w-full border-t border-slate-100 py-2 text-[9px] font-bold text-indigo-700 hover:bg-slate-50"
                    >
                      View all notices
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setProfileOpen((value) => !value);
                    setNotifOpen(false);
                  }}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-indigo-100 bg-white py-1 pl-1 pr-2.5 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Avatar name={student.name} size="sm" tone="indigo" />
                  <span className="hidden text-left sm:block">
                    <span className="block text-[10px] font-bold leading-tight text-deepNavy">{student.name.split(' ')[0]}</span>
                    <span className="block text-[8px] font-semibold leading-tight text-slate-500">Sem {student.semester}</span>
                  </span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-bento">
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[11px] font-bold text-deepNavy">{student.name}</p>
                      <p className="truncate text-[9px] text-slate-500">{student.rollNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setTab('profile');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <User size={13} /> My profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setTab('payment-details');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={13} /> Payment settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={13} /> Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
          {loadingTab ? (
            <StudentTabSkeleton tab={activeTab} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <ActiveTab session={student} college={college} triggerPopup={triggerPopup} setTab={setTab} />
              </motion.div>
            </AnimatePresence>
          )}

          <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-indigo-100 pt-4 text-[9px] font-semibold text-slate-600 sm:flex-row">
            <p>AmyLearn student portal · {college.name}</p>
            <div className="flex items-center gap-3">
              <Link to="/terms" className="hover:text-slate-700">Terms</Link>
              <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
              <button onClick={() => setTab('profile')} className="hover:text-slate-700">Settings</button>
            </div>
          </footer>
        </main>
      </div>

      <AiDrawer open={aiOpen} onClose={() => setAiOpen(false)} userName={student.name} classroomName={student.department} />
    </div>
  );
};

export default CampusStudentDashboard;
