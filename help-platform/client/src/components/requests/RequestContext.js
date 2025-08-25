import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestsAPI } from '../../services/api';

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

  // Update existing request
  const updateRequest = async (requestId, updateData) => {
    try {
      // Optimistically update UI
      setRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, ...updateData }
            : request
        )
      );
      
      // If it's an acceptance, call backend
      if (updateData.status === 'In Progress') {
        await requestsAPI.acceptRequest(requestId);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      // Revert optimistic update
      fetchRequests();
      throw error;
    }
  };

  // Complete request
// Keep your existing RequestContext.js mostly the same, but update completeRequest function:
const completeRequest = async (requestId, completionData, userId) => {
  try {
    console.log('Completing request:', requestId, completionData);
    
    // Call backend API
    const response = await requestsAPI.completeRequest(requestId, completionData);
    
    console.log('Backend response:', response.data);
    
    // Update local state immediately
    setRequests(prev => 
      prev.map(request => {
        if (request._id === requestId || request.id === requestId) {
          // If it's a helper completion, mark as completed
          if (response.data?.points) {
            return {
              ...request, 
              status: 'Completed',
              completedAt: new Date().toISOString(),
              pointsAwarded: response.data.points
            };
          }
          // If it's a rating update, just update rating/feedback
          else if (completionData.rating) {
            return {
              ...request,
              rating: completionData.rating,
              feedback: completionData.feedback
            };
          }
        }
        return request;
      })
    );

    return {
      points: response.data?.points || 0,
      badges: response.data?.badges || []
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

  // GET USER STATS - ADD THIS FUNCTION
  const getUserStats = (userId) => {
    // If no userId provided, return default stats
    if (!userId) {
      return {
        totalPoints: 0,
        requestsCompleted: 0,
        requestsCreated: 0,
        badges: [],
        achievements: []
      };
    }

    // Find requests created by user
    const userRequests = requests.filter(req => {
      const requesterId = req.requester?._id || req.requester?.id || req.requester;
      return requesterId === userId;
    });
    
    // Find requests completed by user (as helper)
    const completedAsHelper = requests.filter(req => {
      const helperId = req.acceptedBy?._id || req.acceptedBy?.id;
      return req.status === 'Completed' && helperId === userId;
    });

    // Calculate stats
    const totalPoints = completedAsHelper.length * 50; // 50 points per completion
    const requestsCompleted = completedAsHelper.length;
    const requestsCreated = userRequests.length;

    // Generate badges based on achievements
    const badges = [];
    if (requestsCompleted >= 1) badges.push({ name: 'First Helper', icon: '🎯' });
    if (requestsCompleted >= 5) badges.push({ name: 'Regular Helper', icon: '⭐' });
    if (requestsCompleted >= 10) badges.push({ name: 'Super Helper', icon: '🚀' });
    if (requestsCompleted >= 25) badges.push({ name: 'Helper Pro', icon: '💎' });

    // Generate achievements
    const achievements = [];
    if (requestsCompleted >= 1) {
      achievements.push({ name: 'First Help', icon: '🎯', points: 25 });
    }
    if (requestsCompleted >= 5) {
      achievements.push({ name: 'Helper Streak', icon: '🔥', points: 50 });
    }

    return {
      totalPoints,
      requestsCompleted,
      requestsCreated,
      badges,
      achievements
    };
  };

  // GET LEADERBOARD - ADD THIS FUNCTION
  const getLeaderboard = (filter = 'all', limit = 10) => {
    // Group requests by helper
    const helperStats = {};
    
    requests.forEach(request => {
      if (request.status === 'Completed' && request.acceptedBy) {
        const helperId = request.acceptedBy._id || request.acceptedBy.id;
        const helperName = request.acceptedBy.name || 'Helper';
        
        if (!helperStats[helperId]) {
          helperStats[helperId] = {
            userId: helperId,
            name: helperName,
            completedRequests: 0,
            totalPoints: 0,
            avatar: '👤' // Default avatar
          };
        }
        
        helperStats[helperId].completedRequests += 1;
        helperStats[helperId].totalPoints += 50; // 50 points per completion
      }
    });
    
    // Convert to array and sort by points
    const leaderboard = Object.values(helperStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);

    return leaderboard;
  };

  // Helper functions
  const calculatePoints = (completionData) => {
    let points = 50; // Base points
    if (completionData.rating >= 4) points += 20;
    if (completionData.completedEarly) points += 15;
    if (completionData.excellentFeedback) points += 10;
    return points;
  };

  const calculateBadges = (completionData) => {
    const badges = [];
    if (completionData.rating === 5) {
      badges.push({ name: 'Perfect Helper', points: 25 });
    }
    if (completionData.completedEarly) {
      badges.push({ name: 'Speed Helper', points: 15 });
    }
    return badges;
  };

  const value = {
    requests,
    loading,
    error,
    addRequest,
    updateRequest,
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
