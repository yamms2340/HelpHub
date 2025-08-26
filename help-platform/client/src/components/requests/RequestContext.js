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
      const response = await requestsAPI.getAllRequests();
      setRequests(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching requests:', error);
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
      const response = await requestsAPI.createRequest(requestData);
      const newRequest = response.data;
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  // Complete request and award points
  const completeRequest = async (requestId, completionData) => {
    try {
      console.log('Completing request:', requestId, completionData);
      
      const response = await requestsAPI.confirmCompletion(requestId, completionData);
      
      console.log('Backend response:', response.data);
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          (request._id === requestId || request.id === requestId)
            ? { ...request, ...response.data.request }
            : request
        )
      );

      return {
        points: response.data.points || 0,
        badges: response.data.badges || [],
        achievements: response.data.achievements || []
      };
      
    } catch (error) {
      console.error('Error completing request:', error);
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

  // ✅ ADD THIS FUNCTION BACK
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

      // Use the leaderboard API to get user stats
      const response = await leaderboardAPI.getUserStats(userId);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default stats if API fails
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

  // ✅ ADD LEADERBOARD FUNCTION
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
    getUserStats,    // ✅ Add this back
    getLeaderboard,  // ✅ Add this back
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};
