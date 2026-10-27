import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AppLoader, PageFallback } from '@/components/ui/AppLoader';
import { AmyLearnLogo } from '@/components/global/AmyLearnLogo';
import { ScrollToTop } from '@/components/global/ScrollToTop';

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LegacyLanding = lazy(() => import('@/pages/LandingPage'));
const ForStudentsPage = lazy(() => import('@/pages/public/ForStudentsPage'));
const ForInstitutionsPage = lazy(() => import('@/pages/public/ForInstitutionsPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
const CollegeSelection = lazy(() => import('@/pages/college-select/CollegeSelection'));
const CampusLogin = lazy(() => import('@/pages/auth/campus/CampusLogin'));
const CampusAdminLogin = lazy(() => import('@/pages/auth/campus-admin/CampusAdminLogin'));
const ITAdminLogin = lazy(() => import('@/pages/auth/it-admin/ITAdminLogin'));
const CampusStudentDashboard = lazy(() => import('@/pages/auth/campus-student/CampusStudentDashboard'));
const CampusAdminDashboard = lazy(() => import('@/pages/auth/campus-admin/CampusAdminDashboard'));
const ITAdminDashboard = lazy(() => import('@/pages/auth/it-admin/ITAdminDashboard'));
const FeatureManager = lazy(() => import('@/pages/auth/it-admin/FeatureManager'));
const FacultyDashboard = lazy(() => import('@/pages/FacultyDashboard'));
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const SessionExpired = lazy(() => import('@/pages/errors/SessionExpired'));
const InstitutionError = lazy(() => import('@/pages/errors/InstitutionError'));
const InstitutionCodeError = lazy(() => import('@/pages/errors/InstitutionCodeError'));

const ROLE_ALIASES = {
  admin: ['college_admin', 'campus_admin'],
  campus_admin: ['college_admin', 'campus_admin'],
  student: ['student', 'campus_student'],
  campus_student: ['student', 'campus_student'],
  it_admin: ['it_admin', 'amylearn_admin', 'super_admin'],
  amylearn_admin: ['it_admin', 'amylearn_admin', 'super_admin'],
  manager: ['it_user', 'amylearn_manager'],
  amylearn_manager: ['it_user', 'amylearn_manager']
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length) {
    const role = String(user.role || '').toLowerCase();
    const allowed = allowedRoles.some((entry) => {
      const normalized = String(entry).toLowerCase();
      if (normalized === role) return true;
      return (ROLE_ALIASES[normalized] || []).includes(role);
    });
    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = String(user.role || '').toLowerCase();
  if (['amylearn_admin', 'amylearn_manager', 'it_admin', 'it_user', 'super_admin'].includes(role)) {
    return <Navigate to="/it-admin" replace />;
  }
  if (['college_admin', 'campus_admin'].includes(role)) return <Navigate to="/campus-admin" replace />;
  if (role === 'faculty') return <Navigate to="/campus-faculty" replace />;
  return <Navigate to="/campus-student" replace />;
};

const SessionExpiryWatcher = () => {
  const { sessionExpired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired && location.pathname !== '/session-expired') {
      navigate('/session-expired', { replace: true });
    }
  }, [sessionExpired, location.pathname, navigate]);

  return null;
};

const SmartLanding = () => {
  const [version] = useState(() => localStorage.getItem('amylearn_landing_version'));
  if (version === 'old' || version === 'classic') return <LegacyLanding />;
  return <LandingPage />;
};

const NewLandingVersion = () => {
  useEffect(() => {
    localStorage.setItem('amylearn_landing_version', 'new');
  }, []);
  return <LandingPage />;
};

const RedirectTo = ({ to }) => <Navigate to={to} replace />;

const TITLES = {
  '/': 'AmyLearn — Unified Academic Platform for Modern Education',
  '/select-college': 'Choose your campus · AmyLearn',
  '/login': 'Campus sign in · AmyLearn',
  '/campus-admin-login': 'Campus administration · AmyLearn',
  '/it-login': 'Platform console · AmyLearn',
  '/for-institutions': 'For institutions · AmyLearn',
  '/for-students': 'For students · AmyLearn',
  '/terms': 'Terms of service · AmyLearn',
  '/privacy': 'Privacy policy · AmyLearn'
};

const RouteTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || 'AmyLearn';
  }, [pathname]);
  return null;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected render error' };
  }

  componentDidCatch(error, info) {
    // Keep the console useful for developers without exposing internals in the UI.
    console.error('AmyLearn render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bgLight px-5">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-bento-lg">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <AmyLearnLogo size={34} />
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                Recovery mode
              </span>
            </div>
            <div className="px-5 py-6">
              <h1 className="text-2xl font-extrabold text-deepNavy font-jost">This screen hit a snag</h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                AmyLearn caught an unexpected rendering error so the rest of your session stays safe. Reload the page,
                or return to your dashboard.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-[11px] font-bold text-white hover:bg-brand-700"
                >
                  <RefreshCw size={13} /> Reload page
                </button>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Home size={13} /> Dashboard
                </a>
              </div>
              {import.meta.env.DEV ? (
                <pre className="mt-4 max-h-28 overflow-auto rounded-xl bg-slate-900 p-3 text-[10px] text-red-200">
                  {this.state.message}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LEGACY_TABS = {
  timetable: 'timetable',
  notices: 'notices',
  attendance: 'attendance',
  'admit-card': 'admit-card',
  'academic-calendar': 'org-calendar',
  fees: 'fees',
  marks: 'marks',
  feedback: 'sem-feedback',
  'project-info': 'project-info',
  'ai-chat': 'ai-study',
  settings: 'profile'
};

const App = () => {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);
  const legacyRedirects = useMemo(
    () =>
      Object.entries(LEGACY_TABS).map(([path, tab]) => (
        <Route key={path} path={`/${path}`} element={<RedirectTo to={`/campus-student?tab=${tab}`} />} />
      )),
    []
  );

  return (
    <ErrorBoundary>
      {booting ? <AppLoader minDuration={800} onComplete={finishBoot} /> : null}
      <SessionExpiryWatcher />
      <RouteTitle />
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<SmartLanding />} />
          <Route path="/v1-landing" element={<LegacyLanding />} />
          <Route path="/3d-landing" element={<NewLandingVersion />} />
          <Route path="/for-institutions" element={<ForInstitutionsPage />} />
          <Route path="/institutions" element={<ForInstitutionsPage />} />
          <Route path="/for-colleges" element={<ForInstitutionsPage />} />
          <Route path="/for-students" element={<ForStudentsPage />} />
          <Route path="/students" element={<ForStudentsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-of-service" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/select-college" element={<CollegeSelection />} />
          <Route path="/college-selection" element={<RedirectTo to="/select-college" />} />
          <Route path="/login" element={<CampusLogin />} />
          <Route path="/campus-admin-login" element={<CampusAdminLogin />} />
          <Route path="/it-login" element={<ITAdminLogin />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route
            path="/campus-student"
            element={
              <ProtectedRoute allowedRoles={['student', 'campus_student', 'faculty']}>
                <CampusStudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/student" element={<RedirectTo to="/campus-student" />} />
          <Route path="/dashboard/campus-student" element={<RedirectTo to="/campus-student" />} />
          <Route
            path="/campus-admin"
            element={
              <ProtectedRoute allowedRoles={['college_admin', 'campus_admin']}>
                <CampusAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/campus-admin" element={<RedirectTo to="/campus-admin" />} />
          <Route path="/dashboard/manage-users" element={<RedirectTo to="/campus-admin?tab=users" />} />
          <Route path="/dashboard/manage-departments" element={<RedirectTo to="/campus-admin?tab=departments" />} />
          <Route
            path="/campus-faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/it-admin"
            element={
              <ProtectedRoute allowedRoles={['it_admin', 'amylearn_admin', 'amylearn_manager', 'it_user', 'super_admin']}>
                <ITAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/it-admin/features"
            element={
              <ProtectedRoute allowedRoles={['it_admin', 'amylearn_admin', 'super_admin']}>
                <FeatureManager />
              </ProtectedRoute>
            }
          />

          {legacyRedirects}
          <Route path="/session-expired" element={<SessionExpired />} />
          <Route path="/institution-error" element={<InstitutionError />} />
          <Route path="/institution-code-error" element={<InstitutionCodeError />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
