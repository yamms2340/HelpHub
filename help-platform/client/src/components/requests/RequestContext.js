import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import { requestsAPI, leaderboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
const RequestContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};

export const RequestsProvider = ({ children }) => {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);      // all requests
  const [myRequests, setMyRequests] = useState([]);  // my requests only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasFetchedMyRequests = useRef(false);

  /* =======================
     ALL REQUESTS
  ======================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestsAPI.getAllRequests();
      setRequests(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     MY REQUESTS (SAFE)
  ======================= */
  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setMyRequests([]); // 🔑 reset to avoid stale data
      const res = await requestsAPI.getMyRequests();
      setMyRequests(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch my requests');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     AUTO FETCH (ONCE ONLY)
  ======================= */
  useEffect(() => {
    if (hasFetchedMyRequests.current) return;
    hasFetchedMyRequests.current = true;
    fetchMyRequests();
  }, []);

  
  /* =======================
     CREATE REQUEST
  ======================= */
  const addRequest = async (data) => {
    const res = await requestsAPI.createRequest(data);
    setRequests(prev => [res.data, ...prev]);
    setMyRequests(prev => [res.data, ...prev]); // keep in sync
    return res.data;
  };

  /* =======================
     COMPLETE REQUEST
  ======================= */
  const completeRequest = async (requestId, data) => {
    const res = await requestsAPI.confirmCompletion(requestId, data);

    const updater = r =>
      r._id === requestId
        ? { ...r, status: 'Completed', pointsAwarded: res.data.points }
        : r;

    setRequests(prev => prev.map(updater));
    setMyRequests(prev => prev.map(updater));

    return {
      points: res.data.points,
      badges: res.data.badges || [],
      achievements: res.data.achievements || [],
    };
  };

  /* =======================
     HELPERS
  ======================= */
  const getFilteredRequests = (filters) => {
    return requests.filter(r =>
      (filters.category === 'All' || r.category === filters.category) &&
      (filters.urgency === 'All' || r.urgency === filters.urgency) &&
      (filters.status === 'All' || r.status === filters.status)
    );
  };

  const getUserStats = async (userId) => {
    if (!userId) return null;
    const res = await leaderboardAPI.getUserStats(userId);
    return res.data.data;
  };

  const getLeaderboard = async (timeframe = 'all', limit = 10) => {
    const res = await leaderboardAPI.getLeaderboard(timeframe, limit);
    return res.data.data || [];
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        myRequests,
        loading,
        error,
        fetchRequests,
        fetchMyRequests,
        addRequest,
        completeRequest,
        getFilteredRequests,
        getUserStats,
        getLeaderboard,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
