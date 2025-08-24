import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Help requests API calls
export const requestsAPI = {
  createRequest: (requestData) => api.post('/requests', requestData),
  getAllRequests: (params) => api.get('/requests', { params }),
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  completeRequest: (id, data) => api.put(`/requests/${id}/complete`, data),
};

// Help/Hall of Fame API calls
export const helpAPI = {
  getHallOfFame: () => api.get('/help/hall-of-fame'),
  getUserHistory: (userId) => api.get(`/help/history/${userId}`),
  getStats: () => api.get('/help/stats'),
};

export default api;
