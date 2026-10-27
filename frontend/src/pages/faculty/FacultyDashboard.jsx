import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import PortalShell from '@/components/portal/PortalShell';
import { FacultyTabSkeleton } from '@/pages/faculty/components/skeletons/FacultySkeletons';
import {
  MOCK_FACULTY,
  MOCK_FACULTY_ORG_EVENTS,
  FACULTY_NAV_ITEMS,
  FACULTY_SECTIONS
} from '@/pages/faculty/constants/facultyConstants';

import FacultyOverviewTab from '@/pages/faculty/tabs/FacultyOverviewTab';
import FacultyTimetableTab from '@/pages/faculty/tabs/FacultyTimetableTab';
import FacultyAttendanceTab from '@/pages/faculty/tabs/FacultyAttendanceTab';
import FacultyStudentsTab from '@/pages/faculty/tabs/FacultyStudentsTab';
import FacultyAssignmentsTab from '@/pages/faculty/tabs/FacultyAssignmentsTab';
import FacultyNoticesTab from '@/pages/faculty/tabs/FacultyNoticesTab';
import FacultyOrgCalendarTab from '@/pages/faculty/tabs/FacultyOrgCalendarTab';
import FacultyLibraryTab from '@/pages/faculty/tabs/FacultyLibraryTab';
import FacultyProfileTab from '@/pages/faculty/tabs/FacultyProfileTab';

const TAB_COMPONENTS = {
  overview: FacultyOverviewTab,
  timetable: FacultyTimetableTab,
  attendance: FacultyAttendanceTab,
  students: FacultyStudentsTab,
  assignments: FacultyAssignmentsTab,
  notices: FacultyNoticesTab,
  'org-calendar': FacultyOrgCalendarTab,
  'digital-library': FacultyLibraryTab,
  profile: FacultyProfileTab
};

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, selectedCollege, logoutCollege } = useAuth();
  const { triggerPopup } = useErrorPopup();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(TAB_COMPONENTS[initialTab] ? initialTab : 'overview');
  const [loading, setLoading] = useState(true);
  const visited = useRef(new Set());

  useEffect(() => {
    setLoading(true);
    const delay = visited.current.has(activeTab) ? 140 : 320;
    const timer = window.setTimeout(() => {
      visited.current.add(activeTab);
      setLoading(false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (!searchParams.get('tab') || searchParams.get('tab') !== activeTab) {
      setSearchParams(activeTab === 'overview' ? {} : { tab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const faculty = useMemo(
    () => ({
      ...MOCK_FACULTY,
      ...(user || {}),
      name: user?.name || MOCK_FACULTY.name,
      email: user?.email || MOCK_FACULTY.email
    }),
    [user]
  );

  const college = selectedCollege || { name: 'Northbridge University', collegeCode: 'NBR' };

  const handleLogout = () => {
    logoutCollege();
    navigate('/login');
  };

  const ActiveTab = TAB_COMPONENTS[activeTab] || FacultyOverviewTab;

  return (
    <PortalShell
      palette="indigo"
      portalLabel="Faculty portal"
      sections={FACULTY_SECTIONS}
      navItems={FACULTY_NAV_ITEMS}
      user={{
        name: faculty.name,
        subtitle: `${faculty.designation} · ${faculty.department}`,
        badge: 'Faculty',
        roleLabel: faculty.designation
      }}
      college={college}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      skeleton={<FacultyTabSkeleton tab={activeTab} />}
      notifications={[
        { id: 'f-1', title: 'Mark attendance for CS502', sub: "Today's 10:00 class not yet marked", tab: 'attendance' },
        { id: 'f-2', title: 'IA-2 marks entry window', sub: 'Closes 30 October', tab: 'students' },
        { id: 'f-3', title: MOCK_FACULTY_ORG_EVENTS[0].title, sub: 'Coming up on the calendar', tab: 'org-calendar' }
      ]}
      aiEnabled
      aiUserName={faculty.name}
      aiClassroom={`${faculty.department} department`}
      footerNote={`AmyLearn faculty portal · ${college.name}`}
    >
      <ActiveTab session={faculty} college={college} triggerPopup={triggerPopup} setTab={setActiveTab} />
    </PortalShell>
  );
};

export default FacultyDashboard;
