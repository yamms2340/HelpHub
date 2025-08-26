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
 * Impact Posts API endpoints - NEW ADDITION
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
  getPostsByStatus: (status) => api.get(`/impact-posts/status/${status}`),
  searchPosts: (query) => api.get('/impact-posts/search', { params: { q: query } }),
  
  // Statistics
  getPostStats: () => api.get('/impact-posts/stats'),
  
  // Admin operations
  verifyPost: (id) => api.put(`/impact-posts/${id}/verify`),
  unverifyPost: (id) => api.put(`/impact-posts/${id}/unverify`),
  moderatePost: (id, action, reason) => api.put(`/impact-posts/${id}/moderate`, { action, reason })
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
  getRequestsByLocation: (location) => api.get(`/requests/location/${encodeURIComponent(location)}`),
  
  // Statistics
  getRequestStats: () => api.get('/requests/stats'),
  getUserRequestStats: (userId) => api.get(`/requests/stats/user/${userId}`)
};

/**
 * Enhanced Leaderboard API endpoints
 */
export const leaderboardAPI = {
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    api.get('/leaderboard', { params: { timeframe, limit } }),
  getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`),
  getUserRank: (userId, timeframe = 'all') => 
    api.get(`/leaderboard/user/${userId}/rank`, { params: { timeframe } }),
  getStatsOverview: () => api.get('/leaderboard/stats/overview'),
  getTopPerformers: (category, limit = 5) => 
    api.get('/leaderboard/top-performers', { params: { category, limit } }),
  awardPoints: (pointsData) => api.post('/leaderboard/award-points', pointsData),
  getUserPointsHistory: (userId, limit = 20) => 
    api.get(`/leaderboard/user/${userId}/points-history`, { params: { limit } }),
  getUserBadges: (userId) => api.get(`/leaderboard/user/${userId}/badges`),
  getUserAchievements: (userId) => api.get(`/leaderboard/user/${userId}/achievements`),
  getAllBadges: () => api.get('/leaderboard/badges'),
  getAllAchievements: () => api.get('/leaderboard/achievements'),
  getLeaderboardByCategory: (category, timeframe = 'all', limit = 10) =>
    api.get(`/leaderboard/category/${category}`, { params: { timeframe, limit } }),
  getLeaderboardByLocation: (location, timeframe = 'all', limit = 10) =>
    api.get(`/leaderboard/location/${encodeURIComponent(location)}`, { params: { timeframe, limit } }),
  getCurrentCompetitions: () => api.get('/leaderboard/competitions'),
  getCompetitionLeaderboard: (competitionId) => api.get(`/leaderboard/competitions/${competitionId}`),
  resetPoints: () => api.post('/leaderboard/reset-points'),
  recalculateStats: () => api.post('/leaderboard/recalculate'),
  subscribeToUpdates: (userId) => api.get(`/leaderboard/subscribe/${userId}`),
  getBulkUserStats: (userIds) => api.post('/leaderboard/bulk-stats', { userIds }),
  getLeaderboardTrends: (timeframe = 'month') => 
    api.get('/leaderboard/trends', { params: { timeframe } }),
  getUserProgressAnalytics: (userId, timeframe = 'month') =>
    api.get(`/leaderboard/user/${userId}/analytics`, { params: { timeframe } })
};

/**
 * Help and Community API endpoints
 */
export const helpAPI = {
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  getTopHelpersThisMonth: () => api.get('/help/top-helpers/month'),
  getTopHelpersThisWeek: () => api.get('/help/top-helpers/week'),
  getUserHistory: (userId, limit = 20) => 
    api.get(`/help/history/${userId}`, { params: { limit } }),
  getUserHelpStats: (userId) => api.get(`/help/stats/${userId}`),
  getStats: () => api.get('/help/stats'),
  getCommunityStats: () => api.get('/help/community-stats'),
  getPlatformAnalytics: (timeframe = 'month') => 
    api.get('/help/analytics', { params: { timeframe } }),
  getInspiringStories: (limit = 10) => api.get('/inspiring-stories', { params: { limit } }),
  getFeaturedStories: () => api.get('/inspiring-stories/featured'),
  submitStory: (storyData) => api.post('/stories/submit', storyData),
  getAllStories: (status = 'approved') => api.get('/stories', { params: { status } }),
  approveStory: (storyId) => api.put(`/stories/${storyId}/approve`),
  rejectStory: (storyId, reason) => api.put(`/stories/${storyId}/reject`, { reason }),
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    leaderboardAPI.getLeaderboard(timeframe, limit),
  getUserPoints: (userId) => leaderboardAPI.getUserStats(userId)
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
  getUserHelpActivities: (userId, limit = 20) => 
    api.get(`/users/${userId}/help-activities`, { params: { limit } }),
  updatePreferences: (userId, preferences) => 
    api.put(`/users/${userId}/preferences`, preferences),
  getNotificationSettings: (userId) => api.get(`/users/${userId}/notifications`),
  updateNotificationSettings: (userId, settings) => 
    api.put(`/users/${userId}/notifications`, settings),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  requestVerification: (userId) => api.post(`/users/${userId}/verify-request`),
  getUserDashboard: (userId) => api.get(`/users/${userId}/dashboard`)
};

/**
 * Categories and Metadata API endpoints
 */
export const metaAPI = {
  getCategories: () => api.get('/meta/categories'),
  getUrgencyLevels: () => api.get('/meta/urgency-levels'),
  getLocations: () => api.get('/meta/locations'),
  getPlatformConfig: () => api.get('/meta/config'),
  getSystemStatus: () => api.get('/meta/status')
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
  sendNotification: (notificationData) => api.post('/notifications', notificationData),
  getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`)
};

/**
 * Admin API endpoints
 */
export const adminAPI = {
  getAllUsers: (page = 1, limit = 20) => 
    api.get('/admin/users', { params: { page, limit } }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  suspendUser: (userId, reason) => api.put(`/admin/users/${userId}/suspend`, { reason }),
  unsuspendUser: (userId) => api.put(`/admin/users/${userId}/unsuspend`),
  getReportedContent: () => api.get('/admin/reports'),
  moderateContent: (contentId, action, reason) => 
    api.put(`/admin/moderate/${contentId}`, { action, reason }),
  getAnalytics: (timeframe = 'month') => 
    api.get('/admin/analytics', { params: { timeframe } }),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getSystemLogs: (level = 'error', limit = 100) => 
    api.get('/admin/logs', { params: { level, limit } }),
  performSystemMaintenance: () => api.post('/admin/maintenance'),
  generateReport: (reportType, params = {}) => 
    api.post('/admin/reports/generate', { type: reportType, ...params }),
  getReports: () => api.get('/admin/reports')
};
// Add to your existing services/api.js
// Update your donationUpdateAPI to use the configured 'api' instance
export const donationUpdateAPI = {
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      // Use 'api' instead of 'axios' and remove '/api' since your baseURL already includes it
      const response = await api.get(`/donation-updates${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation updates:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      // Use 'api' instead of 'axios' and remove '/api' prefix
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
      // Use 'api' instead of 'axios' and remove '/api' prefix
      const response = await api.post('/donation-updates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating donation update:', error);
      console.error('Full error details:', error.response || error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log('Updating donation update:', { id, data });
      // Use 'api' instance and remove '/api' prefix
      const response = await api.put(`/donation-updates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating donation update:', error);
      throw error;
    }
  },

  // Add additional methods if needed
  addProgressUpdate: async (id, updateData) => {
    try {
      const response = await api.post(`/donation-updates/${id}/updates`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error adding progress update:', error);
      throw error;
    }
  },

  donate: async (id, donationData) => {
    try {
      const response = await api.post(`/donation-updates/${id}/donate`, donationData);
      return response.data;
    } catch (error) {
      console.error('Error recording donation:', error);
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
  },

  getMyUpdates: async () => {
    try {
      const response = await api.get('/my-donation-updates');
      return response.data;
    } catch (error) {
      console.error('Error fetching my donation updates:', error);
      throw error;
    }
  }
};

//  * File Upload API endpoints
//  */
export const fileAPI = {
  uploadFile: (formData, onUploadProgress) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFileInfo: (fileId) => api.get(`/files/${fileId}/info`),
  uploadMultipleFiles: (formData, onUploadProgress) => 
    api.post('/files/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    })
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
  searchImpactPosts: (query) => api.get('/search/impact-posts', { params: { q: query } }),
  globalSearch: (query, types = ['requests', 'users', 'stories', 'impact-posts']) => 
    api.get('/search/global', { params: { q: query, types: types.join(',') } }),
  getSearchSuggestions: (query) => 
    api.get('/search/suggestions', { params: { q: query } })
};

/**
 * Utility functions for API usage
 */
const apiUtils = {
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
  
  createCancelToken: () => axios.CancelToken.source(),
  isCancel: (error) => axios.isCancel(error),
  
  formatResponse: (response) => ({
    success: true,
    data: response.data,
    status: response.status,
    message: response.data?.message || 'Success'
  }),

  // NEW: Helper for handling file uploads with progress
  uploadWithProgress: async (endpoint, formData, onProgress) => {
    try {
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percentCompleted);
        }
      });
      return apiUtils.formatResponse(response);
    } catch (error) {
      throw apiUtils.handleApiError(error);
    }
  },

  // NEW: Helper for retrying failed requests
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

/**
 * Real-time features (WebSocket-like endpoints)
 */
export const realtimeAPI = {
  subscribeToLeaderboardUpdates: (callback) => {
    console.log('WebSocket subscription for leaderboard updates');
  },
  subscribeToUserNotifications: (userId, callback) => {
    console.log(`WebSocket subscription for user ${userId} notifications`);
  },
  subscribeToImpactPostUpdates: (callback) => {
    console.log('WebSocket subscription for impact post updates');
  }
};

// Default export
export default api;

// Named exports for convenience
export {
  api,
  API_BASE_URL,
  apiUtils
};
