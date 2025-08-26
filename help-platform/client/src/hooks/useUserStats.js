import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useUserStats = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    monthlyPoints: 0,
    weeklyPoints: 0,
    requestsCompleted: 0,
    requestsCreated: 0,
    badges: [],
    achievements: [],
    rank: null,
    rating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = user?.id || user?._id;
      const response = await leaderboardAPI.getUserStats(userId);
      setUserStats(response.data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError(error);
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  const refreshUserStats = () => {
    if (user?.id || user?._id) {
      fetchUserStats();
    }
  };

  return {
    userStats,
    loading,
    error,
    refreshUserStats
  };
};

export const useLeaderboard = (timeframe = 'all', limit = 10) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaderboardAPI.getLeaderboard(timeframe, limit);
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboard,
    loading,
    error,
    refreshLeaderboard: fetchLeaderboard
  };
};
