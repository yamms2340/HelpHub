import axios from 'axios';

/* =========================
   BASE URL
========================= */
const API_BASE_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);

/* =========================
   AXIOS INSTANCE
========================= */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* =========================
   AUTH + OTP
========================= */
export const authAPI = {
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

export default api;
export { api, API_BASE_URL };
