import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/utils/config';
import { AUTH, IT_ADMIN, SESSION } from '@/utils/apiEndpoints';

const AuthContext = createContext(null);

export const SESSION_KEYS = {
  IT: 'amylearn_it_session',
  CAMPUS_ADMIN: 'amylearn_campus_admin_session',
  COLLEGE: 'amylearn_college_session',
  STUDENT: 'amylearn_student_session',
  SELECTED_COLLEGE: 'selected_college'
};

export const SESSION_TTL = {
  IT: 8 * 60 * 60 * 1000,
  CAMPUS_ADMIN: 12 * 60 * 60 * 1000,
  COLLEGE: 24 * 60 * 60 * 1000,
  STUDENT: 24 * 60 * 60 * 1000
};

export const DEMO_COLLEGE = {
  id: 'demo-northbridge',
  name: 'Northbridge University',
  collegeCode: 'NBR',
  subdomain: 'nbr',
  type: 'college',
  logoUrl: '/webdata/clg-logo/AmyLearn_demo.png',
  location: 'Bangalore, India',
  category: 'University'
};

export const DEMO_ACCOUNTS = {
  itAdmin: {
    identifier: 'admin.support@amylearn.app',
    password: 'amylearn@admin123',
    label: 'Platform Admin'
  },
  itManager: {
    identifier: 'manager.ops@amylearn.app',
    password: 'amylearn@mgr123',
    label: 'Platform Manager'
  },
  campusAdmin: {
    identifier: 'admin.campus@amylearn.demo',
    password: 'campus@admin123',
    label: 'Campus Admin'
  },
  student: {
    identifier: 'NBR2024CS042',
    password: 'campus@student123',
    label: 'Student'
  },
  faculty: {
    identifier: 'faculty.campus@amylearn.demo',
    password: 'campus@faculty123',
    label: 'Faculty'
  }
};

const readJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const writeJSON = (key, value) => {
  if (value) localStorage.setItem(key, JSON.stringify(value));
  else localStorage.removeItem(key);
};

const normalizeFrontendRole = (role) => {
  const map = {
    it_admin: 'amylearn_admin',
    amylearn_admin: 'amylearn_admin',
    it_user: 'amylearn_manager',
    amylearn_manager: 'amylearn_manager',
    college_admin: 'campus_admin',
    campus_admin: 'campus_admin',
    student: 'campus_student',
    campus_student: 'campus_student',
    faculty: 'faculty'
  };
  return map[role] || role || 'campus_student';
};

const buildSession = (user, token, college, ttl) => ({
  user: { ...user, token },
  college: college || null,
  expiresAt: Date.now() + ttl
});

const isExpired = (session) => !session?.expiresAt || session.expiresAt <= Date.now();

const demoUserFor = (identifier, role) => {
  const name = identifier.includes('@') ? identifier.split('@')[0].replace(/[._-]+/g, ' ') : identifier;
  const pretty = name.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `demo-${role}`,
    name: pretty || 'AmyLearn User',
    email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@amylearn.demo`,
    role,
    displayRole:
      role === 'amylearn_admin'
        ? 'Platform Admin'
        : role === 'amylearn_manager'
          ? 'Platform Manager'
          : role === 'campus_admin'
            ? 'Campus Admin'
            : role === 'faculty'
              ? 'Faculty'
              : 'Student',
    department: role === 'faculty' ? 'Computer Science & Engineering' : 'Computer Science & Engineering',
    rollNumber: role === 'campus_student' ? 'NBR2024CS042' : undefined,
    semester: 5,
    batch: '2024 – 2028'
  };
};

const demoBypass = (identifier, password) =>
  typeof identifier === 'string' && identifier.trim().length >= 2 && typeof password === 'string' && password.length >= 6;

export const AuthProvider = ({ children }) => {
  const [itSession, setItSession] = useState(() => readJSON(SESSION_KEYS.IT));
  const [campusAdminSession, setCampusAdminSession] = useState(() => readJSON(SESSION_KEYS.CAMPUS_ADMIN));
  const [collegeSession, setCollegeSession] = useState(() => readJSON(SESSION_KEYS.COLLEGE));
  const [studentSession, setStudentSession] = useState(() => readJSON(SESSION_KEYS.STUDENT));
  const [selectedCollege, setSelectedCollegeState] = useState(
    () => readJSON(SESSION_KEYS.SELECTED_COLLEGE) || DEMO_COLLEGE
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (itSession && isExpired(itSession)) {
      localStorage.removeItem(SESSION_KEYS.IT);
      localStorage.removeItem('it_token');
      setItSession(null);
    }
  }, [itSession]);

  useEffect(() => {
    const onExpired = () => {
      [SESSION_KEYS.IT, SESSION_KEYS.CAMPUS_ADMIN, SESSION_KEYS.COLLEGE, SESSION_KEYS.STUDENT].forEach((key) =>
        localStorage.removeItem(key)
      );
      localStorage.removeItem('token');
      localStorage.removeItem('it_token');
      setItSession(null);
      setCampusAdminSession(null);
      setCollegeSession(null);
      setStudentSession(null);
      setSessionExpired(true);
    };
    window.addEventListener('amylearn-session-expired', onExpired);
    return () => window.removeEventListener('amylearn-session-expired', onExpired);
  }, []);

  const clearExpiredFlag = useCallback(() => setSessionExpired(false), []);

  const setSelectedCollege = useCallback((college) => {
    setSelectedCollegeState(college);
    writeJSON(SESSION_KEYS.SELECTED_COLLEGE, college);
  }, []);

  const loginIT = useCallback(
    async (identifier, password) => {
      if (!identifier?.trim() || !password) return { success: false, error: 'Enter your email and password.' };
      try {
        const { data } = await api.post(IT_ADMIN.LOGIN, { email: identifier.trim(), password });
        const rawRole = data?.user?.role || (identifier.includes('manager') ? 'amylearn_manager' : 'amylearn_admin');
        const role = normalizeFrontendRole(rawRole);
        const user = { ...(data.user || demoUserFor(identifier, role)), role, displayRole: data.user?.displayRole };
        const session = buildSession(user, data.token, null, SESSION_TTL.IT);
        localStorage.setItem('it_token', data.token);
        writeJSON(SESSION_KEYS.IT, session);
        setItSession(session);
        setSessionExpired(false);
        return { success: true, user, session };
      } catch (err) {
        if (!demoBypass(identifier, password)) {
          return { success: false, error: err?.response?.data?.message || 'Unable to sign in.' };
        }
        const role = /manager|ops/i.test(identifier) ? 'amylearn_manager' : 'amylearn_admin';
        const user = demoUserFor(identifier, role);
        const token = `demo-it-${Date.now()}`;
        const session = buildSession(user, token, null, SESSION_TTL.IT);
        localStorage.setItem('it_token', token);
        writeJSON(SESSION_KEYS.IT, session);
        setItSession(session);
        setSessionExpired(false);
        return { success: true, user, session, demo: true };
      }
    },
    []
  );

  const loginCampusAdmin = useCallback(
    async (identifier, password, college = selectedCollege) => {
      if (!identifier?.trim() || !password) return { success: false, error: 'Enter your email and password.' };
      try {
        const { data } = await api.post(AUTH.SIGNIN, {
          email: identifier.trim(),
          password,
          role: 'college_admin',
          collegeCode: college?.collegeCode || college?.id
        });
        const role = 'campus_admin';
        const user = { ...(data.user || demoUserFor(identifier, role)), role };
        const session = buildSession(user, data.token, college, SESSION_TTL.CAMPUS_ADMIN);
        localStorage.setItem('token', data.token);
        writeJSON(SESSION_KEYS.CAMPUS_ADMIN, session);
        setCampusAdminSession(session);
        if (college) setSelectedCollege(college);
        setSessionExpired(false);
        return { success: true, user, session };
      } catch (err) {
        if (!demoBypass(identifier, password)) {
          return { success: false, error: err?.response?.data?.message || 'Unable to sign in.' };
        }
        const user = demoUserFor(identifier, 'campus_admin');
        if (identifier.includes('admin.campus')) user.name = 'Meera Krishnan';
        const token = `demo-campus-admin-${Date.now()}`;
        const session = buildSession(user, token, college || DEMO_COLLEGE, SESSION_TTL.CAMPUS_ADMIN);
        localStorage.setItem('token', token);
        writeJSON(SESSION_KEYS.CAMPUS_ADMIN, session);
        setCampusAdminSession(session);
        setSelectedCollege(college || DEMO_COLLEGE);
        setSessionExpired(false);
        return { success: true, user, session, demo: true };
      }
    },
    [selectedCollege, setSelectedCollege]
  );

  const loginCollege = useCallback(
    async (identifier, password, college = selectedCollege) => {
      if (!identifier?.trim() || !password) return { success: false, error: 'Enter your identifier and password.' };
      try {
        const { data } = await api.post(AUTH.SIGNIN, {
          email: identifier.trim(),
          password,
          collegeCode: college?.collegeCode || college?.id
        });
        const role = normalizeFrontendRole(data?.user?.role || 'campus_student');
        const user = { ...(data.user || demoUserFor(identifier, role)), role };
        const ttl = role === 'faculty' ? SESSION_TTL.COLLEGE : SESSION_TTL.STUDENT;
        const session = buildSession(user, data.token, college, ttl);
        localStorage.setItem('token', data.token);
        writeJSON(role === 'faculty' ? SESSION_KEYS.COLLEGE : SESSION_KEYS.STUDENT, session);
        if (role === 'faculty') setCollegeSession(session);
        else setStudentSession(session);
        if (college) setSelectedCollege(college);
        setSessionExpired(false);
        return { success: true, user, session };
      } catch (err) {
        if (!demoBypass(identifier, password)) {
          return { success: false, error: err?.response?.data?.message || 'Unable to sign in.' };
        }
        const isFaculty = /faculty|prof|dr\./i.test(identifier);
        const role = isFaculty ? 'faculty' : 'campus_student';
        const user = demoUserFor(identifier, role);
        if (role === 'faculty' && identifier.includes('faculty.campus')) user.name = 'Prof. Karthik Subramanian';
        if (role === 'campus_student' && identifier.toUpperCase().includes('NBR2024CS042')) {
          user.name = 'Aarav Sharma';
          user.rollNumber = 'NBR2024CS042';
        }
        const token = `demo-${role}-${Date.now()}`;
        const ttl = isFaculty ? SESSION_TTL.COLLEGE : SESSION_TTL.STUDENT;
        const session = buildSession(user, token, college || DEMO_COLLEGE, ttl);
        localStorage.setItem('token', token);
        writeJSON(isFaculty ? SESSION_KEYS.COLLEGE : SESSION_KEYS.STUDENT, session);
        if (isFaculty) setCollegeSession(session);
        else setStudentSession(session);
        setSelectedCollege(college || DEMO_COLLEGE);
        setSessionExpired(false);
        return { success: true, user, session, demo: true };
      }
    },
    [selectedCollege, setSelectedCollege]
  );

  const clearSession = useCallback((key, tokenKey) => {
    localStorage.removeItem(key);
    if (tokenKey) localStorage.removeItem(tokenKey);
  }, []);

  const logoutIT = useCallback(async () => {
    try {
      await api.post(IT_ADMIN.SIGNOUT);
    } catch {
      /* offline logout is still a logout */
    }
    clearSession(SESSION_KEYS.IT, 'it_token');
    setItSession(null);
  }, [clearSession]);

  const logoutCampusAdmin = useCallback(async () => {
    try {
      await api.post(AUTH.SIGNOUT);
    } catch {
      /* noop */
    }
    clearSession(SESSION_KEYS.CAMPUS_ADMIN, 'token');
    setCampusAdminSession(null);
  }, [clearSession]);

  const revokeServerSession = useCallback(() => {
    // Fire-and-forget: the axios interceptor snapshots the token when the
    // request is built, so clearing storage right after is safe.
    api.post(AUTH.SIGNOUT).catch(() => {});
  }, []);

  const logoutCollege = useCallback(() => {
    revokeServerSession();
    clearSession(SESSION_KEYS.COLLEGE, 'token');
    setCollegeSession(null);
  }, [clearSession, revokeServerSession]);

  const logoutStudent = useCallback(() => {
    revokeServerSession();
    clearSession(SESSION_KEYS.STUDENT, 'token');
    setStudentSession(null);
  }, [clearSession, revokeServerSession]);

  const logout = useCallback(() => {
    revokeServerSession();
    clearSession(SESSION_KEYS.IT, 'it_token');
    clearSession(SESSION_KEYS.CAMPUS_ADMIN, 'token');
    clearSession(SESSION_KEYS.COLLEGE, 'token');
    clearSession(SESSION_KEYS.STUDENT, 'token');
    setItSession(null);
    setCampusAdminSession(null);
    setCollegeSession(null);
    setStudentSession(null);
  }, [clearSession, revokeServerSession]);

  const isSessionValid = useCallback((session) => Boolean(session) && !isExpired(session), []);

  const activeSession = useMemo(() => {
    if (isSessionValid(itSession)) return { ...itSession, portal: 'it' };
    if (isSessionValid(campusAdminSession)) return { ...campusAdminSession, portal: 'campus-admin' };
    if (isSessionValid(studentSession)) return { ...studentSession, portal: 'student' };
    if (isSessionValid(collegeSession)) return { ...collegeSession, portal: 'college' };
    return null;
  }, [itSession, campusAdminSession, studentSession, collegeSession, isSessionValid]);

  const user = activeSession?.user || null;
  const role = user?.role || null;

  const hasPermission = useCallback(
    (permission) => {
      if (!role) return false;
      if (role === 'amylearn_admin' || role === 'it_admin' || role === 'super_admin') return true;
      if (role === 'amylearn_manager') {
        return [
          'view_institutions',
          'view_users',
          'manage_users',
          'feature_manager',
          'view_analytics',
          'view_audit_logs'
        ].includes(permission);
      }
      if (role === 'campus_admin') return ['campus_manage', 'view_users', 'manage_users'].includes(permission);
      return false;
    },
    [role]
  );

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get(SESSION.INFO);
      const portal = activeSession?.portal;
      const key =
        portal === 'it'
          ? SESSION_KEYS.IT
          : portal === 'campus-admin'
            ? SESSION_KEYS.CAMPUS_ADMIN
            : portal === 'student'
              ? SESSION_KEYS.STUDENT
              : SESSION_KEYS.COLLEGE;
      const current = readJSON(key);
      if (current && data?.user) {
        const updated = { ...current, user: { ...current.user, ...data.user } };
        writeJSON(key, updated);
        if (portal === 'it') setItSession(updated);
        else if (portal === 'campus-admin') setCampusAdminSession(updated);
        else if (portal === 'student') setStudentSession(updated);
        else setCollegeSession(updated);
      }
      return data;
    } catch {
      return null;
    }
  }, [activeSession]);

  const value = useMemo(
    () => ({
      user,
      role,
      activeSession,
      itSession,
      campusAdminSession,
      collegeSession,
      studentSession,
      selectedCollege,
      sessionExpired,
      clearExpiredFlag,
      setSelectedCollege,
      loginIT,
      loginCampusAdmin,
      loginCollege,
      loginStudent: loginCollege,
      logoutIT,
      logoutCampusAdmin,
      logoutCollege,
      logoutStudent,
      logout,
      isSessionValid,
      hasPermission,
      refreshProfile
    }),
    [
      user,
      role,
      activeSession,
      itSession,
      campusAdminSession,
      collegeSession,
      studentSession,
      selectedCollege,
      sessionExpired,
      clearExpiredFlag,
      setSelectedCollege,
      loginIT,
      loginCampusAdmin,
      loginCollege,
      logoutIT,
      logoutCampusAdmin,
      logoutCollege,
      logoutStudent,
      logout,
      isSessionValid,
      hasPermission,
      refreshProfile
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
