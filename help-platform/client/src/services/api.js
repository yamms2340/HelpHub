import axios from 'axios';

// ✅ AUTO-DETECT API URL BASED ON CURRENT ENVIRONMENT
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using REACT_APP_API_URL from environment');
    const base = process.env.REACT_APP_API_URL;
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  return 'https://helphubplatform.onrender.com/api';
};


const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Current Hostname:', window.location.hostname);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.metadata = { startTime: new Date() };
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`📍 Full URL: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata ? 
      new Date() - response.config.metadata.startTime : 0;
    console.log(`✅ API Response: ${response.config.url} (${duration}ms) - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 0;
    console.error(`❌ API Error: ${error.config?.url} (${duration}ms) - ${error.response?.status || 'Network Error'}`);
    console.error(`📍 Failed URL: ${error.config?.baseURL}${error.config?.url}`);
    
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * ✅ AUTH API
 */
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ data: { success: true } });
  }
};

/**
 * ✅ REWARDS API
 */
export const rewardsAPI = {
  getAllRewards: async (params = {}) => {
    try {
      const response = await api.get('/rewards', { params });
      return response.data || { success: false, data: [], message: 'Invalid response' };
    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      return { success: false, data: [], message: error.message };
    }
  },
  
  getUserCoins: async () => {
    try {
      const response = await api.get('/rewards/coins');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching coins:', error);
      throw error;
    }
  },

  redeemReward: async (rewardId, deliveryDetails = {}) => {
    try {
      if (!rewardId) throw new Error('Reward ID is required');
      const response = await api.post('/rewards/redeem', { rewardId, deliveryDetails });
      return response.data;
    } catch (error) {
      console.error('❌ Error redeeming reward:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  getUserRedemptions: async () => {
    try {
      const response = await api.get('/rewards/redemptions');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching redemptions:', error);
      return { success: true, data: [], message: 'No redemptions' };
    }
  },

  getRewardCategories: async () => {
    try {
      const response = await api.get('/rewards/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return { success: true, data: ['Gift Cards', 'Electronics', 'Books'], message: 'Default categories' };
    }
  },

  awardCoins: async (pointsData) => {
    try {
      const response = await api.post('/rewards/award-coins', pointsData);
      return response.data;
    } catch (error) {
      console.error('❌ Error awarding coins:', error);
      throw new Error(error.response?.data?.message || 'Failed to award coins');
    }
  }
};

/**
 * ✅ REQUESTS API
 */
export const requestsAPI = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getAllRequests: (params = {}) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateRequest: (id, updateData) => api.put(`/requests/${id}`, updateData),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  offerHelp: (id) => api.put(`/requests/${id}/offer-help`),
  confirmCompletion: (id, confirmationData) => api.put(`/requests/${id}/confirm`, confirmationData),
  cancelRequest: (id, reason) => api.put(`/requests/${id}/cancel`, { reason }),
  searchRequests: (query, filters = {}) => api.get('/requests/search', { params: { q: query, ...filters } }),
  getRequestsByUser: (userId) => api.get(`/requests/user/${userId}`),
  getRequestsByCategory: (category) => api.get(`/requests/category/${category}`),
  getRequestStats: () => api.get('/requests/stats'),
  getUserRequestStats: (userId) => api.get(`/requests/stats/user/${userId}`),
  getMyRequests: () => api.get('/requests/my')
};

/**
 * ✅ IMPACT POSTS API
 */
export const impactPostsAPI = {
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/impact-posts', { params });
      if (response.data?.success !== undefined) return response.data;
      if (Array.isArray(response.data)) return { success: true, data: { posts: response.data }, total: response.data.length };
      if (response.data?.posts) return { success: true, data: { posts: response.data.posts }, total: response.data.total || response.data.posts.length };
      return { success: true, data: { posts: [] }, total: 0 };
    } catch (error) {
      console.error('❌ Error fetching impact posts:', error);
      throw error;
    }
  },
  
  createPost: async (postData) => {
    try {
      const response = await api.post('/impact-posts', postData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating impact post:', error);
      throw error;
    }
  },
  
  getPostById: (postId) => api.get(`/impact-posts/${postId}`),
  updatePost: (postId, updateData) => api.put(`/impact-posts/${postId}`, updateData),
  deletePost: (postId) => api.delete(`/impact-posts/${postId}`),
  likePost: (postId) => api.post(`/impact-posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/impact-posts/${postId}/like`)
};

/**
 * ✅ LEADERBOARD API
 */
export const leaderboardAPI = {
  getLeaderboard: (timeframe = 'all', limit = 10) => api.get('/leaderboard', { params: { timeframe, limit } }),
  getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`),
  getUserRank: (userId, timeframe = 'all') => api.get(`/leaderboard/user/${userId}/rank`, { params: { timeframe } }),
  getStatsOverview: () => api.get('/leaderboard/stats/overview'),
  awardPoints: (pointsData) => api.post('/leaderboard/award-points', pointsData),
  getUserPointsHistory: (userId, limit = 20) => api.get(`/leaderboard/user/${userId}/points-history`, { params: { limit } })
};

/**
 * ✅ CAMPAIGNS API
 */
export const campaignAPI = {
  getAllCampaigns: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },
  getCampaignStats: async () => {
    const response = await api.get('/campaigns/stats');
    return response.data;
  },
  getCampaign: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}`);
    return response.data;
  },
  createCampaign: async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data;
  },
  updateCampaign: async (campaignId, campaignData) => {
    const response = await api.put(`/campaigns/${campaignId}`, campaignData);
    return response.data;
  },
  deleteCampaign: async (campaignId) => {
    const response = await api.delete(`/campaigns/${campaignId}`);
    return response.data;
  },
  donateToCampaign: async (campaignId, donationData) => {
    const response = await api.post(`/campaigns/${campaignId}/donate`, donationData);
    return response.data;
  }
};

/**
 * ✅ DONATIONS API
 */
export const donationsAPI = {
  createOrder: async (orderData) => {
    if (!orderData.amount || orderData.amount <= 0) throw new Error('Invalid order amount');
    const response = await api.post('/donations/create-order', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/donations/verify-payment', paymentData);
    return response.data;
  },
  getAllDonations: async () => {
    const response = await api.get('/donations');
    return response.data;
  },
  getUserDonations: async () => {
    const response = await api.get('/donations/user');
    return response.data;
  },
  testRazorpay: async () => {
    const response = await api.get('/donations/test-razorpay');
    return response.data;
  }
};

/**
 * ✅ STORIES API
 */
export const storiesAPI = {
  getAllStories: async (params = {}) => {
    const response = await api.get('/stories', { params });
    return response.data;
  },
  getInspiringStories: async (limit = 10) => {
    const response = await api.get('/stories/inspiring-stories', { params: { limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/stories/stats');
    return response.data;
  },
  submitStory: async (storyData) => {
    let formData;
    if (storyData instanceof FormData) {
      formData = storyData;
    } else {
      formData = new FormData();
      Object.keys(storyData).forEach(key => {
        if (key === 'helpType' && Array.isArray(storyData[key])) {
          formData.append(key, JSON.stringify(storyData[key]));
        } else if (storyData[key] !== null && storyData[key] !== undefined && storyData[key] !== '') {
          formData.append(key, storyData[key]);
        }
      });
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/stories/submit`, {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  getStoryById: async (id) => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
  },
  searchStories: async (query) => {
    const response = await api.get('/stories/search', { params: { q: query } });
    return response.data;
  }
};

/**
 * ✅ HELP API
 */
export const helpAPI = {
  getHallOfFame: async () => {
    const response = await api.get('/help/hall-of-fame');
    return response.data;
  },
  getUserHistory: async (userId, limit = 20) => {
    const response = await api.get(`/help/history/${userId}`, { params: { limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/help/stats');
    return response.data;
  },
  getInspiringStories: async (limit = 10) => {
    const response = await api.get('/help/inspiring-stories', { params: { limit } });
    return response.data;
  }
};

/**
 * ✅ UTILITY FUNCTIONS
 */
export const apiUtils = {
  handleApiError: (error) => {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.error || error.response.data?.message || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      return { status: 0, message: 'Network error - please check your connection', data: null };
    } else {
      return { status: -1, message: error.message || 'An unexpected error occurred', data: null };
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
        console.warn(`⚠️ Request failed, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  },

  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      console.log('✅ API Health Check:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      return { success: false, message: 'API is unreachable' };
    }
  }
};

export default api;
export { api, API_BASE_URL };