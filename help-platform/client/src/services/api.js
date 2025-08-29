import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor with enhanced logging
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

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.url} (${duration}ms) - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    console.error(`❌ API Error: ${error.config?.url} (${duration}ms) - ${error.response?.status || 'Network Error'}`);
    
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Insufficient permissions');
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server Error - Please try again later');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - Server is taking too long');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ success: true });
  }
};

/**
 * ✅ Stories API endpoints (MongoDB-based Hall of Fame)
 */
export const storiesAPI = {
  // Get all stories (hall of fame)
  getAllStories: (params = {}) => api.get('/stories', { params }),
  
  // Get inspiring stories with limit
  getInspiringStories: (limit = 10) => api.get('/stories/inspiring-stories', { params: { limit } }),
  
  // Get story statistics
  getStats: () => api.get('/stories/stats'),
  
  // Submit new story
  submitStory: (storyData) => api.post('/stories/submit', storyData),
  
  // Get story by ID
  getStoryById: (id) => api.get(`/stories/${id}`),
  
  // Search stories
  searchStories: (query) => api.get('/stories/search', { params: { q: query } })
};

/**
 * ✅ Help API endpoints (User/Help model-based)
 */
export const helpAPI = {
  // Hall of fame (User model-based)
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  
  // User help history
  getUserHistory: (userId, limit = 20) => api.get(`/help/history/${userId}`, { params: { limit } }),
  
  // Platform statistics
  getStats: () => api.get('/help/stats'),
  
  // Inspiring stories from help route
  getInspiringStories: (limit = 10) => api.get('/help/inspiring-stories', { params: { limit } }),
  
  // Submit story (alias to stories API)
  submitStory: (storyData) => api.post('/stories/submit', storyData)
};

/**
 * Impact Posts API endpoints
 */
export const impactPostsAPI = {
  // Basic CRUD operations
  getAllPosts: (params = {}) => api.get('/impact-posts', { params }),
  getPostById: (id) => api.get(`/impact-posts/${id}`),
  createPost: (postData) => api.post('/impact-posts', postData),
  updatePost: (id, updateData) => api.put(`/impact-posts/${id}`, updateData),
  deletePost: (id) => api.delete(`/impact-posts/${id}`),
  
  // Post interactions
  likePost: (id) => api.post(`/impact-posts/${id}/like`),
  unlikePost: (id) => api.delete(`/impact-posts/${id}/like`),
  incrementViews: (id) => api.put(`/impact-posts/${id}/views`),
  
  // Filtering and search
  getPostsByCategory: (category) => api.get(`/impact-posts/category/${category}`),
  getPostsByAuthor: (authorId) => api.get(`/impact-posts/author/${authorId}`),
  searchPosts: (query) => api.get('/impact-posts/search', { params: { q: query } }),
  
  // Statistics
  getPostStats: () => api.get('/impact-posts/stats'),
};

/**
 * Help Requests API endpoints
 */
export const requestsAPI = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateRequest: (id, updateData) => api.put(`/requests/${id}`, updateData),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  
  // Request workflow operations
  offerHelp: (id) => api.put(`/requests/${id}/offer-help`),
  confirmCompletion: (id, confirmationData) => api.put(`/requests/${id}/confirm`, confirmationData),
  cancelRequest: (id, reason) => api.put(`/requests/${id}/cancel`, { reason }),
  
  // Advanced filtering and searching
  searchRequests: (query, filters = {}) => api.get('/requests/search', { 
    params: { q: query, ...filters } 
  }),
  getRequestsByUser: (userId) => api.get(`/requests/user/${userId}`),
  getRequestsByCategory: (category) => api.get(`/requests/category/${category}`),
  
  // Statistics
  getRequestStats: () => api.get('/requests/stats'),
  getUserRequestStats: (userId) => api.get(`/requests/stats/user/${userId}`)
};

/**
 * Leaderboard API endpoints
 */
export const leaderboardAPI = {
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    api.get('/leaderboard', { params: { timeframe, limit } }),
  getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`),
  getUserRank: (userId, timeframe = 'all') => 
    api.get(`/leaderboard/user/${userId}/rank`, { params: { timeframe } }),
  getStatsOverview: () => api.get('/leaderboard/stats/overview'),
  awardPoints: (pointsData) => api.post('/leaderboard/award-points', pointsData),
  getUserPointsHistory: (userId, limit = 20) => 
    api.get(`/leaderboard/user/${userId}/points-history`, { params: { limit } }),
};

/**
 * ✅ Donation Updates API
 */
export const donationUpdateAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/donation-updates${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation updates:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/donation-updates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation update:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      console.log('Creating donation update with data:', data);
      const response = await api.post('/donation-updates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating donation update:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      console.log('Updating donation update:', { id, data });
      const response = await api.put(`/donation-updates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating donation update:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/donation-updates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting donation update:', error);
      throw error;
    }
  }
};

/**
 * User Management API endpoints
 */
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, profileData) => api.put(`/users/${userId}`, profileData),
  uploadProfilePicture: (userId, formData) => api.post(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserRequests: (userId, status = 'all') => 
    api.get(`/users/${userId}/requests`, { params: { status } }),
  getUserDashboard: (userId) => api.get(`/users/${userId}/dashboard`)
};

/**
 * Notifications API endpoints
 */
export const notificationAPI = {
  getNotifications: (userId, limit = 20) => 
    api.get(`/notifications/${userId}`, { params: { limit } }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/${userId}/read-all`),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`)
};

/**
 * Search API endpoints
 */
export const searchAPI = {
  searchRequests: (query, filters = {}) => 
    api.get('/search/requests', { params: { q: query, ...filters } }),
  searchUsers: (query, filters = {}) => 
    api.get('/search/users', { params: { q: query, ...filters } }),
  searchStories: (query) => api.get('/search/stories', { params: { q: query } }),
  globalSearch: (query, types = ['requests', 'users', 'stories']) => 
    api.get('/search/global', { params: { q: query, types: types.join(',') } })
};

/**
 * ✅ FIXED: Utility functions for API usage (Single export)
 */
export const apiUtils = {
  handleApiError: (error) => {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'Network error - please check your connection',
        data: null
      };
    } else {
      return {
        status: -1,
        message: error.message || 'An unexpected error occurred',
        data: null
      };
    }
  },
  
  formatResponse: (response) => ({
    success: true,
    data: response.data,
    status: response.status,
    message: response.data?.message || 'Success'
  }),
  
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
};

// Default export
export default api;

// ✅ FIXED: Named exports (removed duplicate apiUtils)
export {
  api,
  API_BASE_URL
};
