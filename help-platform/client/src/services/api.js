import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for better reliability
});

// Request interceptor with enhanced logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.config.url} (${duration}ms) - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
    console.error(`❌ API Error: ${error.config?.url} (${duration}ms) - ${error.response?.status || 'Network Error'}`);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
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
 * Help Requests API endpoints
 */
export const requestsAPI = {
  // Basic CRUD operations
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
  // Main leaderboard functions
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    api.get('/leaderboard', { params: { timeframe, limit } }),
  
  getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`),
  
  getUserRank: (userId, timeframe = 'all') => 
    api.get(`/leaderboard/user/${userId}/rank`, { params: { timeframe } }),
  
  // Comprehensive stats
  getStatsOverview: () => api.get('/leaderboard/stats/overview'),
  getTopPerformers: (category, limit = 5) => 
    api.get('/leaderboard/top-performers', { params: { category, limit } }),
  
  // Points and achievements
  awardPoints: (pointsData) => api.post('/leaderboard/award-points', pointsData),
  getUserPointsHistory: (userId, limit = 20) => 
    api.get(`/leaderboard/user/${userId}/points-history`, { params: { limit } }),
  
  // Badges and achievements
  getUserBadges: (userId) => api.get(`/leaderboard/user/${userId}/badges`),
  getUserAchievements: (userId) => api.get(`/leaderboard/user/${userId}/achievements`),
  getAllBadges: () => api.get('/leaderboard/badges'),
  getAllAchievements: () => api.get('/leaderboard/achievements'),
  
  // Leaderboard variations
  getLeaderboardByCategory: (category, timeframe = 'all', limit = 10) =>
    api.get(`/leaderboard/category/${category}`, { params: { timeframe, limit } }),
  
  getLeaderboardByLocation: (location, timeframe = 'all', limit = 10) =>
    api.get(`/leaderboard/location/${encodeURIComponent(location)}`, { params: { timeframe, limit } }),
  
  // Competition features
  getCurrentCompetitions: () => api.get('/leaderboard/competitions'),
  getCompetitionLeaderboard: (competitionId) => api.get(`/leaderboard/competitions/${competitionId}`),
  
  // Admin functions
  resetPoints: () => api.post('/leaderboard/reset-points'),
  recalculateStats: () => api.post('/leaderboard/recalculate'),
  
  // Real-time features
  subscribeToUpdates: (userId) => api.get(`/leaderboard/subscribe/${userId}`),
  
  // Bulk operations
  getBulkUserStats: (userIds) => api.post('/leaderboard/bulk-stats', { userIds }),
  
  // Analytics
  getLeaderboardTrends: (timeframe = 'month') => 
    api.get('/leaderboard/trends', { params: { timeframe } }),
  
  getUserProgressAnalytics: (userId, timeframe = 'month') =>
    api.get(`/leaderboard/user/${userId}/analytics`, { params: { timeframe } })
};

/**
 * Help and Community API endpoints
 */
export const helpAPI = {
  // Hall of fame
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  getTopHelpersThisMonth: () => api.get('/help/top-helpers/month'),
  getTopHelpersThisWeek: () => api.get('/help/top-helpers/week'),
  
  // User history and statistics
  getUserHistory: (userId, limit = 20) => 
    api.get(`/help/history/${userId}`, { params: { limit } }),
  getUserHelpStats: (userId) => api.get(`/help/stats/${userId}`),
  
  // Platform statistics
  getStats: () => api.get('/help/stats'),
  getCommunityStats: () => api.get('/help/community-stats'),
  getPlatformAnalytics: (timeframe = 'month') => 
    api.get('/help/analytics', { params: { timeframe } }),
  
  // Stories and testimonials
  getInspiringStories: (limit = 10) => api.get('/inspiring-stories', { params: { limit } }),
  getFeaturedStories: () => api.get('/inspiring-stories/featured'),
  submitStory: (storyData) => api.post('/stories/submit', storyData),
  getAllStories: (status = 'approved') => api.get('/stories', { params: { status } }),
  approveStory: (storyId) => api.put(`/stories/${storyId}/approve`),
  rejectStory: (storyId, reason) => api.put(`/stories/${storyId}/reject`, { reason }),
  
  // Legacy compatibility
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    leaderboardAPI.getLeaderboard(timeframe, limit),
  getUserPoints: (userId) => leaderboardAPI.getUserStats(userId)
};

/**
 * User Management API endpoints
 */
export const userAPI = {
  // Profile management
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, profileData) => api.put(`/users/${userId}`, profileData),
  uploadProfilePicture: (userId, formData) => api.post(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // User activities
  getUserRequests: (userId, status = 'all') => 
    api.get(`/users/${userId}/requests`, { params: { status } }),
  getUserHelpActivities: (userId, limit = 20) => 
    api.get(`/users/${userId}/help-activities`, { params: { limit } }),
  
  // User preferences
  updatePreferences: (userId, preferences) => 
    api.put(`/users/${userId}/preferences`, preferences),
  getNotificationSettings: (userId) => api.get(`/users/${userId}/notifications`),
  updateNotificationSettings: (userId, settings) => 
    api.put(`/users/${userId}/notifications`, settings),
  
  // Social features
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  
  // User verification
  requestVerification: (userId) => api.post(`/users/${userId}/verify-request`),
  
  // User statistics
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
  // User management
  getAllUsers: (page = 1, limit = 20) => 
    api.get('/admin/users', { params: { page, limit } }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  suspendUser: (userId, reason) => api.put(`/admin/users/${userId}/suspend`, { reason }),
  unsuspendUser: (userId) => api.put(`/admin/users/${userId}/unsuspend`),
  
  // Content moderation
  getReportedContent: () => api.get('/admin/reports'),
  moderateContent: (contentId, action, reason) => 
    api.put(`/admin/moderate/${contentId}`, { action, reason }),
  
  // Platform analytics
  getAnalytics: (timeframe = 'month') => 
    api.get('/admin/analytics', { params: { timeframe } }),
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // System management
  getSystemLogs: (level = 'error', limit = 100) => 
    api.get('/admin/logs', { params: { level, limit } }),
  performSystemMaintenance: () => api.post('/admin/maintenance'),
  
  // Reports
  generateReport: (reportType, params = {}) => 
    api.post('/admin/reports/generate', { type: reportType, ...params }),
  getReports: () => api.get('/admin/reports')
};

/**
 * File Upload API endpoints
 */
export const fileAPI = {
  uploadFile: (formData, onUploadProgress) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFileInfo: (fileId) => api.get(`/files/${fileId}/info`),
  
  // Bulk operations
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
  
  // Advanced search
  globalSearch: (query, types = ['requests', 'users', 'stories']) => 
    api.get('/search/global', { params: { q: query, types: types.join(',') } }),
  
  // Search suggestions
  getSearchSuggestions: (query) => 
    api.get('/search/suggestions', { params: { q: query } })
};

/**
 * Utility functions for API usage - ✅ FIXED: Removed export keyword
 */
const apiUtils = {
  // Handle API errors consistently
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
  
  // Create cancel token for request cancellation
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if error is due to request cancellation
  isCancel: (error) => axios.isCancel(error),
  
  // Format API response consistently
  formatResponse: (response) => ({
    success: true,
    data: response.data,
    status: response.status,
    message: response.data?.message || 'Success'
  })
};

/**
 * Real-time features (WebSocket-like endpoints)
 */
export const realtimeAPI = {
  // For future WebSocket integration
  subscribeToLeaderboardUpdates: (callback) => {
    // Placeholder for WebSocket subscription
    console.log('WebSocket subscription for leaderboard updates');
  },
  
  subscribeToUserNotifications: (userId, callback) => {
    // Placeholder for WebSocket subscription
    console.log(`WebSocket subscription for user ${userId} notifications`);
  }
};

// Default export
export default api;

// ✅ FIXED: Named exports for convenience (apiUtils only exported here now)
export {
  api,
  API_BASE_URL,
  apiUtils
};
