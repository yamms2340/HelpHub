import axios from 'axios';

/**
 * =========================
 * BASE URL
 * =========================
 */
const API_BASE_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api';

/**
 * =========================
 * AXIOS INSTANCE
 * =========================
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * =========================
 * REQUEST INTERCEPTOR
 * =========================
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * =========================
 * RESPONSE INTERCEPTOR
 * =========================
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * =========================
 * 🔐 AUTH + OTP API
 * =========================
 */
export const authAPI = {
  // OTP
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),

  // AUTH
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ data: { success: true } });
  }
};

/**
 * =========================
 * 🎁 REWARDS API
 * =========================
 */
export const rewardsAPI = {
  getAllRewards: (params = {}) => api.get('/rewards', { params }),
  getUserCoins: () => api.get('/rewards/coins'),
  redeemReward: (rewardId, deliveryDetails = {}) =>
    api.post('/rewards/redeem', { rewardId, deliveryDetails }),
  getUserRedemptions: () => api.get('/rewards/redemptions'),
  getRewardCategories: () => api.get('/rewards/categories'),
  awardCoins: (data) => api.post('/rewards/award-coins', data),
};

/**
 * =========================
 * 📌 REQUESTS API
 * =========================
 */
export const requestsAPI = {
  createRequest: (data) => api.post('/requests', data),
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateRequest: (id, data) => api.put(`/requests/${id}`, data),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  offerHelp: (id) => api.put(`/requests/${id}/offer-help`),
  confirmCompletion: (id, data) => api.put(`/requests/${id}/confirm`, data),
  cancelRequest: (id, reason) =>
    api.put(`/requests/${id}/cancel`, { reason }),
};

/**
 * =========================
 * 📰 IMPACT POSTS API
 * =========================
 */
export const impactPostsAPI = {
  getAllPosts: (params = {}) => api.get('/impact-posts', { params }),
  createPost: (data) => api.post('/impact-posts', data),
  getPostById: (id) => api.get(`/impact-posts/${id}`),
  updatePost: (id, data) => api.put(`/impact-posts/${id}`, data),
  deletePost: (id) => api.delete(`/impact-posts/${id}`),
  likePost: (id) => api.post(`/impact-posts/${id}/like`),
  unlikePost: (id) => api.delete(`/impact-posts/${id}/like`),
};

/**
 * =========================
 * 📢 CAMPAIGNS API
 * =========================
 */
export const campaignAPI = {
  getAllCampaigns: () => api.get('/campaigns'),
  getCampaign: (id) => api.get(`/campaigns/${id}`),
  createCampaign: (data) => api.post('/campaigns', data),
  donateToCampaign: (id, data) =>
    api.post(`/campaigns/${id}/donate`, data),
  getCampaignStats: () => api.get('/campaigns/stats'),
};

/**
 * =========================
 * 💰 DONATIONS API
 * =========================
 */
export const donationsAPI = {
  createOrder: (data) => api.post('/donations/create-order', data),
  verifyPayment: (data) => api.post('/donations/verify-payment', data),
  testRazorpay: () => api.get('/donations/test-razorpay'),
};

/**
 * =========================
 * 🏆 LEADERBOARD API
 * =========================
 */
export const leaderboardAPI = {
  getLeaderboard: (timeframe = 'all', limit = 10) =>
    api.get('/leaderboard', { params: { timeframe, limit } }),
  getUserStats: (userId) =>
    api.get(`/leaderboard/user/${userId}`),
};

/**
 * =========================
 * 🤝 HELP API
 * =========================
 */
export const helpAPI = {
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  getUserHistory: (userId, limit = 20) =>
    api.get(`/help/history/${userId}`, { params: { limit } }),
  getStats: () => api.get('/help/stats'),
  getInspiringStories: (limit = 10) =>
    api.get('/help/inspiring-stories', { params: { limit } }),
};

/**
 * =========================
 * 📖 STORIES API
 * =========================
 */
export const storiesAPI = {
  getAllStories: (params = {}) => api.get('/stories', { params }),
  getStoryById: (id) => api.get(`/stories/${id}`),
  searchStories: (query) =>
    api.get('/stories/search', { params: { q: query } }),
};

/**
 * =========================
 * 🧰 UTILS
 * =========================
 */
export const apiUtils = {
  handleApiError: (error) => {
    if (error.response) {
      return {
        status: error.response.status,
        message:
          error.response.data?.message || 'Server error',
      };
    }
    return { status: 0, message: 'Network error' };
  },
};

export default api;
export { api, API_BASE_URL };
