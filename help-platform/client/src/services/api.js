import axios from 'axios';

// ✅ DYNAMIC API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  'http://localhost:5000/api';

console.log('🔗 API:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ✅ AUTH API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// ✅ DONATIONS API (FIXES ERROR!)
export const donationsAPI = {
  createOrder: (data) => api.post('/donations/create-order', data),
  verifyPayment: (data) => api.post('/donations/verify-payment', data),
  testRazorpay: () => api.get('/donations/test-razorpay'),
};

// ✅ REQUESTS API
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
};

// ✅ STORIES API
export const storiesAPI = {
  inspiring: (limit = 10) => api.get('/stories/inspiring-stories', { params: { limit } }),
};

// ✅ REWARDS API
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  coins: () => api.get('/rewards/coins'),
};

// ✅ CAMPAIGN API
export const campaignAPI = {
  getAll: () => api.get('/campaigns'),
  stats: () => api.get('/campaigns/stats'),
};

// ✅ IMPACT POSTS
export const impactPostsAPI = {
  getAll: () => api.get('/impact-posts'),
};

// ✅ LEADERBOARD
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

// ✅ HELP API
export const helpAPI = {
  hallOfFame: () => api.get('/help/hall-of-fame'),
};

// ✅ UTILS
export const apiUtils = {
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export { api, API_BASE_URL };
export default api;
