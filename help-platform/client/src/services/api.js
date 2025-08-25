import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  }
};

// Help requests API calls
export const requestsAPI = {
  // Create a new help request
  createRequest: (requestData) => api.post('/requests', requestData),
  
  // Get all help requests with optional filtering
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  
  // Get a specific request by ID
  getRequest: (id) => api.get(`/requests/${id}`),
  
  // Accept a help request
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  
  // Complete a help request with rating and feedback
  completeRequest: (id, completionData) => api.put(`/requests/${id}/complete`, completionData),
  
  // Update a request (for status changes, etc.)
  updateRequest: (id, updateData) => api.put(`/requests/${id}`, updateData),
  
  // Delete a request
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  
  // Get requests by user ID
  getUserRequests: (userId) => api.get(`/requests/user/${userId}`),
  
  // Get requests accepted by user (helper)
  getAcceptedRequests: (userId) => api.get(`/requests/accepted/${userId}`)
};

// Hall of Fame API calls
export const helpAPI = {
  // Get hall of fame data (top helpers)
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  
  // Get user's help history
  getUserHistory: (userId) => api.get(`/help/history/${userId}`),
  
  // Get platform statistics
  getStats: () => api.get('/help/stats'),
  
  // Get inspiring stories
  getInspiringStories: () => api.get('/inspiring-stories'),
  
  // Submit a new inspiring story
  submitStory: (storyData) => api.post('/stories/submit', storyData),
  
  // Get all stories (admin)
  getAllStories: () => api.get('/stories'),
  
  // Approve a story (admin)
  approveStory: (storyId) => api.put(`/stories/${storyId}/approve`),
  
  // Get leaderboard data
  getLeaderboard: () => api.get('/help/leaderboard'),
  
  // Get user points and badges
  getUserPoints: (userId) => api.get(`/help/points/${userId}`)
};

// User management API calls
export const userAPI = {
  // Get user profile
  getProfile: (userId) => api.get(`/users/${userId}`),
  
  // Update user profile
  updateProfile: (userId, profileData) => api.put(`/users/${userId}`, profileData),
  
  // Get user's requests
  getUserRequests: (userId) => api.get(`/users/${userId}/requests`),
  
  // Get user's help activities
  getUserHelpActivities: (userId) => api.get(`/users/${userId}/help-activities`),
  
  // Update user preferences
  updatePreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences)
};

// Categories and metadata API calls
export const metaAPI = {
  // Get all categories
  getCategories: () => api.get('/categories'),
  
  // Get urgency levels
  getUrgencyLevels: () => api.get('/urgency-levels'),
  
  // Get platform configuration
  getConfig: () => api.get('/config')
};

// Notifications API calls
export const notificationAPI = {
  // Get user notifications
  getNotifications: (userId) => api.get(`/notifications/${userId}`),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Send notification (admin)
  sendNotification: (notificationData) => api.post('/notifications', notificationData)
};

// Admin API calls
export const adminAPI = {
  // Get all users (admin)
  getAllUsers: () => api.get('/admin/users'),
  
  // Get platform analytics
  getAnalytics: () => api.get('/admin/analytics'),
  
  // Moderate content
  moderateContent: (contentId, action) => api.put(`/admin/moderate/${contentId}`, { action }),
  
  // Get reports
  getReports: () => api.get('/admin/reports')
};

// File upload API calls
export const fileAPI = {
  // Upload file
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete file
  deleteFile: (fileId) => api.delete(`/files/${fileId}`)
};

// Search API calls
export const searchAPI = {
  // Search requests
  searchRequests: (query, filters = {}) => api.get('/search/requests', { 
    params: { q: query, ...filters } 
  }),
  
  // Search users
  searchUsers: (query) => api.get('/search/users', { params: { q: query } }),
  
  // Search stories
  searchStories: (query) => api.get('/search/stories', { params: { q: query } })
};

// Default export
export default api;
