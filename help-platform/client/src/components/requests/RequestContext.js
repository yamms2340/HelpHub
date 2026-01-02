import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestsAPI, leaderboardAPI } from '../../services/api';

const RequestContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

export const RequestsProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all requests from backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching requests from API...');
      const response = await requestsAPI.getAllRequests();
      console.log('✅ Fetched requests:', response.data?.length || 0, 'items');
      setRequests(response.data || []);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  // Load requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Add new request
  const addRequest = async (requestData) => {
    try {
      console.log('➕ Creating new request:', requestData);
      const response = await requestsAPI.createRequest(requestData);
      const newRequest = response.data;
      
      // Add to beginning of list
      setRequests(prev => [newRequest, ...prev]);
      
      // Refresh from server after short delay
      setTimeout(() => {
        fetchRequests();
      }, 1000);
      
      console.log('✅ Request created successfully:', newRequest._id);
      return newRequest;
    } catch (error) {
      console.error('❌ Error creating request:', error);
      throw error;
    }
  };

  // Complete request and award points
  const completeRequest = async (requestId, completionData) => {
    try {
      console.log('🎯 Completing request:', requestId, completionData);
      
      const response = await requestsAPI.confirmCompletion(requestId, completionData);
      
      console.log('✅ Completion response:', response.data);
      
      // Update local state immediately
      setRequests(prev => 
        prev.map(request => {
          if (request._id === requestId || request.id === requestId) {
            return {
              ...request,
              status: 'Completed',
              completedAt: new Date().toISOString(),
              rating: completionData.rating || 5,
              feedback: completionData.feedback || '',
              pointsAwarded: response.data.points || 0
            };
          }
          return request;
        })
      );

      // Refresh from server to ensure consistency
      setTimeout(() => {
        fetchRequests();
      }, 1000);

      return {
        points: response.data.points || 0,
        badges: response.data.badges || [],
        achievements: response.data.achievements || []
      };
      
    } catch (error) {
      console.error('❌ Error completing request:', error);
      throw error;
    }
  };

  // Filter requests
  const getFilteredRequests = (filters) => {
    let filtered = [...requests];
    
    if (filters.category !== 'All') {
      filtered = filtered.filter(req => req.category === filters.category);
    }
    if (filters.urgency !== 'All') {
      filtered = filtered.filter(req => req.urgency === filters.urgency);
    }
    if (filters.status !== 'All') {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    return filtered;
  };

  // Get user stats
  const getUserStats = async (userId) => {
    try {
      if (!userId) {
        return {
          totalPoints: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          requestsCompleted: 0,
          requestsCreated: 0,
          badges: [],
          achievements: [],
          rank: null
        };
      }

      const response = await leaderboardAPI.getUserStats(userId);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalPoints: 0,
        monthlyPoints: 0,
        weeklyPoints: 0,
        requestsCompleted: 0,
        requestsCreated: 0,
        badges: [],
        achievements: [],
        rank: null
      };
    }
  };

  // Get leaderboard
  const getLeaderboard = async (timeframe = 'all', limit = 10) => {
    try {
      const response = await leaderboardAPI.getLeaderboard(timeframe, limit);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  };

  const value = {
    requests,
    loading,
    error,
    addRequest,
    completeRequest,
    getFilteredRequests,
    fetchRequests,
    getUserStats,
    getLeaderboard,
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};
