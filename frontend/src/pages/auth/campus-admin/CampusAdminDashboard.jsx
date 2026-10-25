import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import PortalShell from '@/components/portal/PortalShell';
import { AdminTabSkeleton } from '@/pages/auth/campus-admin/components/skeletons/CampusAdminSkeletons';
import {
  MOCK_ADMIN,
  MOCK_ORG_EVENTS,
  MOCK_NOTICES,
  ADMIN_NAV_ITEMS,
  ADMIN_SECTIONS
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

import AdminOverviewTab from '@/pages/auth/campus-admin/components/tabs/AdminOverviewTab';
import AdminBentoHubTab from '@/pages/auth/campus-admin/components/tabs/AdminBentoHubTab';
import AdminUsersTab from '@/pages/auth/campus-admin/components/tabs/AdminUsersTab';
import AdminAccountCreationTab from '@/pages/auth/campus-admin/components/tabs/AdminAccountCreationTab';
import AdminDepartmentsTab from '@/pages/auth/campus-admin/components/tabs/AdminDepartmentsTab';
import AdminAttendanceTab from '@/pages/auth/campus-admin/components/tabs/AdminAttendanceTab';
import AdminCoeManageTab from '@/pages/auth/campus-admin/components/tabs/AdminCoeManageTab';
import AdminExamManageTab from '@/pages/auth/campus-admin/components/tabs/AdminExamManageTab';
import AdminFacultyLeavesTab from '@/pages/auth/campus-admin/components/tabs/AdminFacultyLeavesTab';
import AdminMarksTab from '@/pages/auth/campus-admin/components/tabs/AdminMarksTab';
import AdminFeesTab from '@/pages/auth/campus-admin/components/tabs/AdminFeesTab';
import AdminNoticesTab from '@/pages/auth/campus-admin/components/tabs/AdminNoticesTab';
import AdminStaffNoticesTab from '@/pages/auth/campus-admin/components/tabs/AdminStaffNoticesTab';
import AdminOrgCalendarTab from '@/pages/auth/campus-admin/components/tabs/AdminOrgCalendarTab';
import AdminSettingsTab from '@/pages/auth/campus-admin/components/tabs/AdminSettingsTab';
import AdminTimetableTab from '@/pages/auth/campus-admin/components/tabs/AdminTimetableTab';
import AdminDigitalLibraryTab from '@/pages/auth/campus-admin/components/tabs/AdminDigitalLibraryTab';
import AdminFeatureManagerTab from '@/pages/auth/campus-admin/components/tabs/AdminFeatureManagerTab';

const TAB_COMPONENTS = {
  overview: AdminOverviewTab,
  'bento-hub': AdminBentoHubTab,
  users: AdminUsersTab,
  'account-creation': AdminAccountCreationTab,
  departments: AdminDepartmentsTab,
  attendance: AdminAttendanceTab,
  coe: AdminCoeManageTab,
  exams: AdminExamManageTab,
  'faculty-leaves': AdminFacultyLeavesTab,
  marks: AdminMarksTab,
  fees: AdminFeesTab,
  notices: AdminNoticesTab,
  'staff-notices': AdminStaffNoticesTab,
  'org-calendar': AdminOrgCalendarTab,
  settings: AdminSettingsTab,
  timetable: AdminTimetableTab,
  'digital-library': AdminDigitalLibraryTab,
  'feature-manager': AdminFeatureManagerTab
};

const CampusAdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, selectedCollege, logoutCampusAdmin } = useAuth();
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

  const college = selectedCollege || { name: 'Northbridge University', collegeCode: 'NBR' };

  const admin = useMemo(
    () => ({
      ...MOCK_ADMIN,
      ...(user || {}),
      name: user?.name || MOCK_ADMIN.name,
      email: user?.email || MOCK_ADMIN.email
    }),
    [user]
  );

  const shellUser = {
    name: admin.name,
    subtitle: admin.designation || 'Campus administrator',
    badge: 'Admin',
    roleLabel: 'Campus admin'
  };

  const notifications = [
    ...MOCK_NOTICES.slice(0, 2).map((notice) => ({ id: notice.id, title: notice.title, sub: `${notice.department} · notice`, tab: 'notices' })),
    { id: 'ev-1', title: MOCK_ORG_EVENTS[0].title, sub: 'Coming up on the calendar', tab: 'org-calendar' },
    { id: 'coe-pending', title: '23 exam forms awaiting verification', sub: 'COE queue needs attention', tab: 'coe' }
  ];

  const handleLogout = () => {
    logoutCampusAdmin();
    navigate('/campus-admin-login');
  };

  const ActiveTab = TAB_COMPONENTS[activeTab] || AdminOverviewTab;

  return (
    <PortalShell
      palette="teal"
      portalLabel="Campus admin"
      sections={ADMIN_SECTIONS}
      navItems={ADMIN_NAV_ITEMS}
      user={shellUser}
      college={college}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      skeleton={<AdminTabSkeleton tab={activeTab} />}
      notifications={notifications}
      aiEnabled
      aiUserName={admin.name}
      aiClassroom="Campus administration"
      footerNote={`AmyLearn campus admin · ${college.name}`}
    >
      <ActiveTab session={admin} college={college} triggerPopup={triggerPopup} setTab={setActiveTab} />
    </PortalShell>
  );
};

export default CampusAdminDashboard;
