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
  const token = localStorage.getItem('token') || localStorage.getItem('it_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-user-token'] = token;
  }
  const college = readSelectedCollege();
  if (college?.id || college?.collegeCode) {
    config.headers['x-tenant-id'] = college.id || college.collegeCode;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('amylearn-session-expired'));
    }
    return Promise.reject(error);
  }
);

export const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true';

export default api;
