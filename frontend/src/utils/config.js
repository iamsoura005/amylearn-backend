import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const COLLEGE_CONFIG = {
  logoUrl: '/webdata/clg-logo/AmyLearn_demo.png',
  collegeName: 'Northbridge University',
  brandName: 'AmyLearn',
  supportEmail: 'support@amylearn.app'
};

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

const readSelectedCollege = () => {
  try {
    return JSON.parse(localStorage.getItem('selected_college') || 'null');
  } catch {
    return null;
  }
};

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isItAdmin = url.startsWith('/it-admin') || url.startsWith('/it-auth') || window.location.pathname.startsWith('/it-admin');
  const token = isItAdmin
    ? (localStorage.getItem('it_token') || localStorage.getItem('token'))
    : (localStorage.getItem('token') || localStorage.getItem('it_token'));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-user-token'] = token;
  }
  const college = readSelectedCollege();
  const tenantRef = college?.collegeCode || college?.id;
  if (tenantRef) {
    config.headers['x-tenant-id'] = tenantRef;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || '';
    const isAuthAttempt = /\/(signin|login|role-signup|check-email|verify-email)\b/i.test(url);
    const isAiRequest = /\/api\/ai\b/i.test(url);
    if (error?.response?.status === 401 && !isAuthAttempt && !isAiRequest) {
      window.dispatchEvent(new CustomEvent('amylearn-session-expired'));
    }
    return Promise.reject(error);
  }
);

export const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true';

export default api;
