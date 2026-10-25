import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import PortalShell from '@/components/portal/PortalShell';
import { ITTabSkeleton } from '@/pages/auth/it-admin/components/skeletons/ITAdminSkeletons';
import {
  MOCK_IT_ADMIN,
  MOCK_SUPPORT_REQUESTS,
  IT_NAV_ITEMS,
  IT_SECTIONS
} from '@/pages/auth/it-admin/constants/itAdminConstants';

import ITOverviewTab from '@/pages/auth/it-admin/components/tabs/ITOverviewTab';
import ITInstitutionsTab from '@/pages/auth/it-admin/components/tabs/ITInstitutionsTab';
import ITUsersTab from '@/pages/auth/it-admin/components/tabs/ITUsersTab';
import ITRequestsTab from '@/pages/auth/it-admin/components/tabs/ITRequestsTab';
import ITAuditTab from '@/pages/auth/it-admin/components/tabs/ITAuditTab';
import ITSettingsTab from '@/pages/auth/it-admin/components/tabs/ITSettingsTab';

const TAB_COMPONENTS = {
  overview: ITOverviewTab,
  institutions: ITInstitutionsTab,
  users: ITUsersTab,
  requests: ITRequestsTab,
  audit: ITAuditTab,
  settings: ITSettingsTab
};

const ITAdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logoutIT } = useAuth();
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

  const admin = useMemo(
    () => ({
      ...MOCK_IT_ADMIN,
      ...(user || {}),
      name: user?.name || MOCK_IT_ADMIN.name,
      email: user?.email || MOCK_IT_ADMIN.email
    }),
    [user]
  );

  const openTickets = MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'open').length;

  const handleLogout = () => {
    logoutIT();
    navigate('/it-login');
  };

  const ActiveTab = TAB_COMPONENTS[activeTab] || ITOverviewTab;

  return (
    <PortalShell
      palette="navy"
      portalLabel="AmyLearn console"
      sections={IT_SECTIONS}
      navItems={IT_NAV_ITEMS}
      user={{
        name: admin.name,
        subtitle: admin.designation || 'Platform administrator',
        badge: 'IT',
        roleLabel: 'Platform admin'
      }}
      college={{ name: 'AmyLearn platform', collegeCode: 'AL' }}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      skeleton={<ITTabSkeleton tab={activeTab} />}
      notifications={[
        { id: 't-1', title: `${openTickets} open support requests`, sub: '3 high priority · review queue', tab: 'requests' },
        { id: 't-2', title: 'Crestview Business School', sub: 'Onboarding in progress', tab: 'institutions' },
        { id: 't-3', title: 'Omkara Medical College', sub: 'Tenant suspended · unpaid invoices', tab: 'institutions' }
      ]}
      headerActions={
        <Link
          to="/it-admin/features"
          className="hidden items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-2.5 py-2 text-[10px] font-bold text-brandBlue hover:bg-blue-50 sm:inline-flex"
        >
          <SlidersHorizontal size={13} /> Feature flags
        </Link>
      }
      aiEnabled
      aiUserName={admin.name}
      aiClassroom="Platform operations"
      footerNote="AmyLearn platform console · multi-tenant operations"
    >
      <ActiveTab session={admin} triggerPopup={triggerPopup} setTab={setActiveTab} />
    </PortalShell>
  );
};

export default ITAdminDashboard;
