import axios from 'axios';

// ✅ Use environment variable for API URL (works in both dev and production)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
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
 * ✅ REWARDS API - ENHANCED WITH PROPER ERROR HANDLING
 */
export const rewardsAPI = {
  // Get all rewards with filters
  getAllRewards: async (params = {}) => {
    try {
      console.log('🎁 Fetching rewards with params:', params);
      const response = await api.get('/rewards', { params });
      console.log('📥 Rewards response:', response.data);
      
      // Ensure we return the expected structure
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      // Fallback structure
      return {
        success: false,
        data: [],
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      
      // Return error in expected format
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch rewards'
      };
    }
  },
  
  
  // Get user's coins balance
  getUserCoins: async () => {
    try {
      console.log('🪙 Fetching user coins...');
      const response = await api.get('/rewards/coins');
      console.log('💰 Coins response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching coins:', error);
      
      // Return mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔄 Using mock coins data for development');
        return {
          success: true,
          data: {
            totalCoins: 1200,
            userPoints: 1200,
            level: 'Helper',
            requestsCompleted: 5,
            lifetimeEarned: 1200,
            lifetimeRedeemed: 0
          },
          message: 'Mock coins data (development mode)'
        };
      }
      
      throw error;
    }
  },

  


  // Redeem a reward - ENHANCED WITH BETTER ERROR HANDLING
  redeemReward: async (rewardId, deliveryDetails = {}) => {
    try {
      console.log('🎁 Processing redemption for reward:', rewardId);
      
      if (!rewardId) {
        throw new Error('Reward ID is required');
      }

      const requestData = {
        rewardId,
        deliveryDetails
      };

      console.log('📤 Sending redemption request:', requestData);
      const response = await api.post('/rewards/redeem', requestData);
      console.log('✅ Redemption response:', response.data);

      // Ensure response has expected structure
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Redemption failed');
      }
    } catch (error) {
      console.error('❌ Error redeeming reward:', error);
      
      // Enhanced error handling with specific messages
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        throw new Error(serverError?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred during redemption');
      }
    }
  },

  // Get user's redemption history
  getUserRedemptions: async () => {
    try {
      console.log('📦 Fetching user redemptions...');
      const response = await api.get('/rewards/redemptions');
      console.log('📋 Redemptions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user redemptions:', error);
      
      // Return empty list if API fails
      return {
        success: true,
        data: [],
        message: 'No redemptions found or API unavailable'
      };
    }
  },

  // Get reward categories
  getRewardCategories: async () => {
    try {
      console.log('📂 Fetching reward categories...');
      const response = await api.get('/rewards/categories');
      console.log('🏷️ Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching reward categories:', error);
      
      // Return default categories if API fails
      return {
        success: true,
        data: ['Gift Cards', 'Electronics', 'Books', 'Food & Drinks', 'Merchandise', 'Experiences'],
        message: 'Using default categories (API unavailable)'
      };
    }
  },

  // Award coins for testing - ENHANCED
  awardCoins: async (pointsData) => {
    try {
      console.log('🎯 Awarding coins:', pointsData);
      const response = await api.post('/rewards/award-coins', pointsData);
      console.log('✅ Coins awarded:', response.data);
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
  
  searchRequests: (query, filters = {}) => api.get('/requests/search', { 
    params: { q: query, ...filters } 
  }),
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
      console.log('🔄 Fetching impact posts with params:', params);
      const response = await api.get('/impact-posts', { params });
      
      console.log('📥 Impact posts raw response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success !== undefined) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: { posts: response.data },
          total: response.data.length
        };
      } else if (response.data && response.data.posts) {
        return {
          success: true,
          data: { posts: response.data.posts },
          total: response.data.total || response.data.posts.length
        };
      } else {
        return {
          success: true,
          data: { posts: [] },
          total: 0
        };
      }
    } catch (error) {
      console.error('❌ Error fetching impact posts:', error);
      throw error;
    }
  },
  
  createPost: async (postData) => {
    try {
      console.log('🔄 Creating impact post with data:', postData);
      const response = await api.post('/impact-posts', postData);
      console.log('✅ Impact post created successfully:', response.data);
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
  getLeaderboard: (timeframe = 'all', limit = 10) => 
    api.get('/leaderboard', { params: { timeframe, limit } }),
  getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`),
  getUserRank: (userId, timeframe = 'all') => 
    api.get(`/leaderboard/user/${userId}/rank`, { params: { timeframe } }),
  getStatsOverview: () => api.get('/leaderboard/stats/overview'),
  awardPoints: (pointsData) => api.post('/leaderboard/award-points', pointsData),
  getUserPointsHistory: (userId, limit = 20) => 
    api.get(`/leaderboard/user/${userId}/points-history`, { params: { limit } })
};

/**
 * ✅ CAMPAIGNS API - USING AXIOS FOR CONSISTENCY
 */
export const campaignAPI = {
  getAllCampaigns: async () => {
    try {
      console.log('🔄 Fetching campaigns from backend...');
      const response = await api.get('/campaigns');
      console.log('📥 Campaigns response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      throw error;
    }
  },

  getCampaignStats: async () => {
    try {
      console.log('🔄 Fetching campaign stats from backend...');
      const response = await api.get('/campaigns/stats');
      console.log('📊 Campaign stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching campaign stats:', error);
      throw error;
    }
  },

  getCampaign: async (campaignId) => {
    try {
      console.log('🔄 Fetching single campaign:', campaignId);
      const response = await api.get(`/campaigns/${campaignId}`);
      console.log('📥 Single campaign response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching campaign:', error);
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      console.log('🔄 Creating campaign with data:', campaignData);
      const response = await api.post('/campaigns', campaignData);
      console.log('✅ Campaign created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    try {
      console.log('🔄 Updating campaign:', campaignId);
      const response = await api.put(`/campaigns/${campaignId}`, campaignData);
      console.log('✅ Campaign updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating campaign:', error);
      throw error;
    }
  },

  deleteCampaign: async (campaignId) => {
    try {
      console.log('🗑️ Deleting campaign:', campaignId);
      const response = await api.delete(`/campaigns/${campaignId}`);
      console.log('✅ Campaign deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      throw error;
    }
  },

  // Campaign donation - CRITICAL FOR PROGRESS UPDATES
  donateToCampaign: async (campaignId, donationData) => {
    try {
      console.log('💰 Processing donation to campaign:', campaignId);
      console.log('💰 Donation data:', donationData);
      
      const response = await api.post(`/campaigns/${campaignId}/donate`, donationData);
      console.log('✅ Campaign donation processed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing campaign donation:', error);
      throw error;
    }
  }
};

/**
 * ✅ DONATIONS API
 */
export const donationsAPI = {
  createOrder: async (orderData) => {
    try {
      console.log('🔄 Creating donation order:', orderData);
      
      if (!orderData.amount || orderData.amount <= 0) {
        throw new Error('Invalid order amount');
      }
      
      const response = await api.post('/donations/create-order', orderData);
      console.log('✅ Donation order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating donation order:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
  
  verifyPayment: async (paymentData) => {
    try {
      console.log('🔄 Verifying payment:', paymentData);
      const response = await api.post('/donations/verify-payment', paymentData);
      console.log('✅ Payment verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
  
  getAllDonations: async () => {
    try {
      console.log('🔄 Fetching all donations...');
      const response = await api.get('/donations');
      console.log('📥 Donations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
      throw error;
    }
  },

  getUserDonations: async () => {
    try {
      console.log('🔄 Fetching user donations...');
      const response = await api.get('/donations/user');
      console.log('📥 User donations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user donations:', error);
      throw error;
    }
  },
  
  testRazorpay: async () => {
    try {
      const response = await api.get('/donations/test-razorpay');
      return response.data;
    } catch (error) {
      console.error('❌ Error testing Razorpay:', error);
      throw error;
    }
  }
};

/**
 * ✅ STORIES API - WITH IMAGE UPLOAD SUPPORT
 */
export const storiesAPI = {
  getAllStories: async (params = {}) => {
    try {
      console.log('🔄 Fetching all stories...');
      const response = await api.get('/stories', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      throw error;
    }
  },
  
  getInspiringStories: async (limit = 10) => {
    try {
      console.log('🔄 Fetching inspiring stories...');
      const response = await api.get('/stories/inspiring-stories', { params: { limit } });
      console.log('📥 Inspiring stories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching inspiring stories:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      console.log('🔄 Fetching story stats...');
      const response = await api.get('/stories/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story stats:', error);
      throw error;
    }
  },
  
  // Submit story with image support using FormData
  submitStory: async (storyData) => {
    try {
      console.log('🔄 Submitting story with data type:', typeof storyData);
      console.log('📝 Story data preview:', storyData instanceof FormData ? 'FormData' : storyData);
      
      // Create FormData if not already FormData
      let formData;
      if (storyData instanceof FormData) {
        formData = storyData;
        console.log('📤 Using provided FormData');
      } else {
        console.log('📦 Converting object to FormData');
        formData = new FormData();
        
        // Add all story fields to FormData
        Object.keys(storyData).forEach(key => {
          if (key === 'helpType' && Array.isArray(storyData[key])) {
            formData.append(key, JSON.stringify(storyData[key]));
          } else if (storyData[key] !== null && storyData[key] !== undefined && storyData[key] !== '') {
            formData.append(key, storyData[key]);
          }
        });
      }

      // Log FormData contents for debugging
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Make request with FormData
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stories/submit`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type - browser will set it with boundary for FormData
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Story submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error submitting story:', error);
      
      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      } else if (error.message.includes('HTTP error')) {
        throw new Error(error.message);
      } else {
        throw new Error(error.message || 'Failed to submit story');
      }
    }
  },
  
  getStoryById: async (id) => {
    try {
      console.log('🔄 Fetching story by ID:', id);
      const response = await api.get(`/stories/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story by ID:', error);
      throw error;
    }
  },
  
  searchStories: async (query) => {
    try {
      console.log('🔍 Searching stories with query:', query);
      const response = await api.get('/stories/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('❌ Error searching stories:', error);
      throw error;
    }
  }
};

/**
 * ✅ HELP API
 */
export const helpAPI = {
  getHallOfFame: async () => {
    try {
      console.log('🏆 Fetching hall of fame...');
      const response = await api.get('/help/hall-of-fame');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching hall of fame:', error);
      throw error;
    }
  },
  
  getUserHistory: async (userId, limit = 20) => {
    try {
      const response = await api.get(`/help/history/${userId}`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user history:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      console.log('📊 Fetching help stats...');
      const response = await api.get('/help/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching help stats:', error);
      throw error;
    }
  },
  
  getInspiringStories: async (limit = 10) => {
    try {
      const response = await api.get('/help/inspiring-stories', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching inspiring stories from help:', error);
      throw error;
    }
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
        console.warn(`⚠️ Request failed, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  },

  // Check API health
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      console.log('✅ API Health Check:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      return {
        success: false,
        message: 'API is unreachable'
      };
    }
  }
};

// Default export
export default api;

// Named exports
export {
  api,
  API_BASE_URL
};
