import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
      if (window.location.pathname !== '/login') {
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
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
  
  createPost: async (postData) => {
    try {
      console.log('🔄 Creating impact post with data:', postData);
      
      // Enhanced validation
      if (!postData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!postData.category?.trim()) {
        throw new Error('Category is required');
      }
      if (!postData.details?.trim()) {
        throw new Error('Details are required');
      }
      
      // Ensure required fields are present
      const postPayload = {
        title: postData.title.trim(),
        category: postData.category.trim(),
        details: postData.details.trim(),
        beneficiaries: postData.beneficiaries || 0,
        amount: postData.amount || 0,
        authorName: postData.authorName || 'Anonymous',
        status: 'active',
        isVerified: false
      };
      
      console.log('📤 Sending post payload:', postPayload);
      
      const response = await api.post('/impact-posts', postPayload);
      
      console.log('✅ Impact post created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating impact post:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/impact-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching impact post:', error);
      throw error;
    }
  },
  
  updatePost: async (postId, updateData) => {
    try {
      const response = await api.put(`/impact-posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating impact post:', error);
      throw error;
    }
  },
  
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/impact-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting impact post:', error);
      throw error;
    }
  },
  
  likePost: async (postId) => {
    try {
      const response = await api.post(`/impact-posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('❌ Error liking impact post:', error);
      throw error;
    }
  },
  
  unlikePost: async (postId) => {
    try {
      const response = await api.delete(`/impact-posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('❌ Error unliking impact post:', error);
      throw error;
    }
  },
  
  getPostsByCategory: async (category) => {
    try {
      const response = await api.get(`/impact-posts/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching posts by category:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/impact-posts/stats/summary');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching impact post stats:', error);
      throw error;
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
  getUserRequestStats: (userId) => api.get(`/requests/stats/user/${userId}`)
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
 * ✅ REWARDS API
 */
export const rewardsAPI = {
  getAllRewards: async (params = {}) => {
    try {
      const response = await api.get('/rewards', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      throw error;
    }
  },

  redeemReward: async (rewardId, deliveryAddress) => {
    try {
      const response = await api.post(`/rewards/${rewardId}/redeem`, { deliveryAddress });
      return response.data;
    } catch (error) {
      console.error('❌ Error redeeming reward:', error);
      throw error;
    }
  },

  getUserRedemptions: async () => {
    try {
      const response = await api.get('/rewards/my-redemptions');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user redemptions:', error);
      throw error;
    }
  },

  getRewardCategories: async () => {
    try {
      const response = await api.get('/rewards/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching reward categories:', error);
      throw error;
    }
  },

  createReward: async (rewardData) => {
    try {
      const response = await api.post('/rewards', rewardData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating reward:', error);
      throw error;
    }
  }
};

/**
 * ✅ CAMPAIGNS API - INTEGRATED WITH FETCH-BASED APPROACH
 */
export const campaignAPI = {
  getAllCampaigns: async () => {
    try {
      console.log('🔄 Fetching campaigns from backend...');
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      const data = await response.json();
      console.log('📥 Campaigns response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      throw error;
    }
  },

  getCampaignStats: async () => {
    try {
      console.log('🔄 Fetching campaign stats from backend...');
      const response = await fetch(`${API_BASE_URL}/campaigns/stats`);
      const data = await response.json();
      console.log('📊 Campaign stats response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching campaign stats:', error);
      throw error;
    }
  },

  getCampaign: async (campaignId) => {
    try {
      console.log('🔄 Fetching single campaign:', campaignId);
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
      const data = await response.json();
      console.log('📥 Single campaign response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching campaign:', error);
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      console.log('🔄 Creating campaign with data:', campaignData);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
      });
      const data = await response.json();
      console.log('✅ Campaign created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  },

  // ✅ CAMPAIGN DONATION - CRITICAL FOR PROGRESS UPDATES
  donateToCampaign: async (campaignId, donationData) => {
    try {
      console.log('💰 Processing donation to campaign:', campaignId);
      console.log('💰 Donation data:', donationData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donationData)
      });
      
      const data = await response.json();
      console.log('✅ Campaign donation processed:', data);
      return data;
    } catch (error) {
      console.error('❌ Error processing campaign donation:', error);
      throw error;
    }
  },

  getCampaignDonations: async (campaignId) => {
    try {
      console.log('🔄 Fetching campaign donations:', campaignId);
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donations`);
      const data = await response.json();
      console.log('📥 Campaign donations response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching campaign donations:', error);
      throw error;
    }
  },

  deleteCampaign: async (campaignId) => {
    try {
      console.log('🗑️ Deleting campaign:', campaignId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('✅ Campaign deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (campaignId, updateData) => {
    try {
      console.log('🔄 Updating campaign:', campaignId, updateData);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      console.log('✅ Campaign updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating campaign:', error);
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
 * ✅ STORIES API
 */
export const storiesAPI = {
  getAllStories: async (params = {}) => {
    try {
      const response = await api.get('/stories', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      throw error;
    }
  },
  
  getInspiringStories: async (limit = 10) => {
    try {
      const response = await api.get('/stories/inspiring-stories', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching inspiring stories:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/stories/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story stats:', error);
      throw error;
    }
  },
  
  submitStory: async (storyData) => {
    try {
      const response = await api.post('/stories/submit', storyData);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting story:', error);
      throw error;
    }
  },
  
  getStoryById: async (id) => {
    try {
      const response = await api.get(`/stories/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story by ID:', error);
      throw error;
    }
  },
  
  searchStories: async (query) => {
    try {
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
  },
  
  submitStory: async (storyData) => {
    return await storiesAPI.submitStory(storyData);
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
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
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
