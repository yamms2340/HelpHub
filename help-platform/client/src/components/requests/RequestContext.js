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

  // ---------------- FETCH ----------------
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAllRequests();
      setRequests(response.data || []);
      setError('');
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ---------------- CREATE ----------------
  const addRequest = async (requestData) => {
    const response = await requestsAPI.createRequest(requestData);
    await fetchRequests();
    return response.data;
  };

  // ---------------- OFFER HELP (FIXED) ----------------
  const offerHelp = async (requestId) => {
    try {
      await requestsAPI.offerHelp(requestId);

      setRequests(prev =>
        prev.map(req =>
          req._id === requestId
            ? {
                ...req,
                status: 'In Progress',
                acceptedBy: { _id: 'me' }
              }
            : req
        )
      );

      await fetchRequests();
    } catch (error) {
      console.error(
        'Offer help error:',
        error.response?.data?.message
      );
      throw error;
    }
  };

  // ---------------- COMPLETE REQUEST (FIXED) ----------------
  const completeRequest = async (requestId, completionData = {}) => {
    try {
      const response = await requestsAPI.confirmCompletion(
        requestId,
        completionData
      );

      setRequests(prev =>
        prev.map(req =>
          req._id === requestId
            ? {
                ...req,
                status: 'Completed',
                completedAt: new Date().toISOString(),
                rating: completionData.rating || 5,
                feedback: completionData.feedback || '',
                pointsAwarded: response.data.points
              }
            : req
        )
      );

      await fetchRequests();

      return response.data;
    } catch (error) {
      console.error(
        'Complete request error:',
        error.response?.data?.message
      );
      throw error;
    }
  };

  // ---------------- FILTER ----------------
  const getFilteredRequests = (filters) => {
    let filtered = [...requests];

    if (filters.category !== 'All') {
      filtered = filtered.filter(r => r.category === filters.category);
    }
    if (filters.urgency !== 'All') {
      filtered = filtered.filter(r => r.urgency === filters.urgency);
    }
    if (filters.status !== 'All') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    return filtered;
  };

  // ---------------- USER STATS ----------------
  const getUserStats = async (userId) => {
    if (!userId) return null;
    const response = await leaderboardAPI.getUserStats(userId);
    return response.data.data;
  };

  const getLeaderboard = async (timeframe = 'all', limit = 10) => {
    const response = await leaderboardAPI.getLeaderboard(timeframe, limit);
    return response.data.data || [];
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        loading,
        error,
        fetchRequests,
        addRequest,
        offerHelp,
        completeRequest,
        getFilteredRequests,
        getUserStats,
        getLeaderboard
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
