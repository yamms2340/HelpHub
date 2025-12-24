import axios from 'axios';

// ✅ DYNAMIC API URL (Local + Render + Vite)
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  'http://localhost:5000/api';

// 🔍 Log base URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor (auto token + logging)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.metadata = { startTime: new Date() };
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (401 auto-logout + logging)
api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata ? 
      new Date() - response.config.metadata.startTime : 0;
    console.log(`✅ API Response: ${response.config.url} (${duration}ms) - ${response.status}`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 0;
    console.log(`❌ API Error: ${error.config?.url} (${duration}ms) - ${error.response?.status || 'Network'}`);
    
    // Auto-logout on 401
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized → Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect in API calls (let component handle)
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * ✅ AUTH API (Perfect!)
 */
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),  // ✅ Fixed!
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ data: { success: true } });
  }
};

/**
 * ✅ REQUESTS API
 */
export const requestsAPI = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  offerHelp: (id) => api.put(`/requests/${id}/offer-help`),
  searchRequests: (query, filters = {}) => api.get('/requests/search', { 
    params: { q: query, ...filters } 
  }),
};

/**
 * ✅ STORIES API (Image upload ready!)
 */
export const storiesAPI = {
  getInspiringStories: (limit = 10) => api.get('/stories/inspiring-stories', { params: { limit } }),
  submitStory: async (storyData) => {
    const formData = new FormData();
    Object.keys(storyData).forEach(key => {
      if (storyData[key] !== null && storyData[key] !== undefined) {
        formData.append(key, storyData[key]);
      }
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/stories/submit`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Story upload failed');
    }
    
    return response.json();
  }
};

/**
 * ✅ REWARDS API (Simplified)
 */
export const rewardsAPI = {
  getAllRewards: (params = {}) => api.get('/rewards', { params }),
  getUserCoins: () => api.get('/rewards/coins'),
  redeemReward: (rewardId) => api.post('/rewards/redeem', { rewardId }),
};

/**
 * ✅ USER IMPACT API
 */
export const impactPostsAPI = {
  getAllPosts: (params = {}) => api.get('/impact-posts', { params }),
  createPost: (postData) => api.post('/impact-posts', postData),
};

/**
 * ✅ LEADERBOARD API
 */
export const leaderboardAPI = {
  getLeaderboard: (timeframe = 'all') => api.get('/leaderboard', { params: { timeframe } }),
};

/**
 * ✅ HELP API
 */
export const helpAPI = {
  getHallOfFame: () => api.get('/help/hall-of-fame'),
};

/**
 * ✅ CAMPAIGNS API
 */
export const campaignAPI = {
  getAllCampaigns: () => api.get('/campaigns'),
  getStats: () => api.get('/campaigns/stats'),
};

/**
 * ✅ UTILITY FUNCTIONS
 */
export const apiUtils = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Default exports
export default api;
export { API_BASE_URL };
