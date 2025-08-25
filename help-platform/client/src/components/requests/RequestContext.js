import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial sample requests
const INITIAL_REQUESTS = [
  {
    "_id": "1",
    "title": "Need volunteers for community clean-up",
    "description": "Seeking help to organize a local cleaning event in the park. We need people to help coordinate and participate in the cleanup activities.",
    "category": "Household",
    "urgency": "Medium",
    "status": "Open",
    "location": "City Park, Downtown",
    "requester": {"name": "Alice Johnson"},
    "createdAt": "2025-08-20T08:30:00Z",
    "acceptedBy": null
  },
  {
    "_id": "2",
    "title": "Grocery delivery for elderly neighbor",
    "description": "Looking for someone to help deliver groceries to a senior citizen who cannot leave their home due to mobility issues.",
    "category": "Food",
    "urgency": "Low",
    "status": "Open",
    "location": "Downtown Area",
    "requester": {"name": "Bob Wilson"},
    "createdAt": "2025-08-21T12:15:00Z",
    "acceptedBy": null
  },
  {
    "_id": "3",
    "title": "Math tutoring needed for students",
    "description": "Seeking a volunteer to tutor middle school students in mathematics. Basic algebra and geometry help required.",
    "category": "Education",
    "urgency": "High",
    "status": "Open",
    "location": "Community Center",
    "requester": {"name": "Carol Davis"},
    "createdAt": "2025-08-22T09:45:00Z",
    "acceptedBy": null
  },
  {
    "_id": "4",
    "title": "Computer setup assistance required",
    "description": "Help needed to set up a computer for an elderly individual. Includes basic software installation and internet setup.",
    "category": "Technology",
    "urgency": "Low",
    "status": "Completed",
    "location": "Westside Neighborhood",
    "requester": {"name": "Dave Miller"},
    "createdAt": "2025-08-18T15:00:00Z",
    "acceptedBy": {"name": "Eve Thompson"}
  },
  {
    "_id": "5",
    "title": "Medical supplies donation drive",
    "description": "Collecting donations for local clinic medical supplies. Need volunteers to help organize and distribute supplies.",
    "category": "Health",
    "urgency": "Critical",
    "status": "In Progress",
    "location": "Health Clinic, Main St",
    "requester": {"name": "Frank Garcia"},
    "createdAt": "2025-08-19T10:20:00Z",
    "acceptedBy": {"name": "Grace Lee"}
  },
  {
    "_id": "6",
    "title": "Transportation help needed",
    "description": "Seeking someone to provide rides to medical appointments for elderly residents in the community.",
    "category": "Transportation",
    "urgency": "Medium",
    "status": "Open",
    "location": "Various Locations",
    "requester": {"name": "Helen Rodriguez"},
    "createdAt": "2025-08-23T14:30:00Z",
    "acceptedBy": null
  },
  {
    "_id": "7",
    "title": "English conversation practice",
    "description": "Native English speakers needed to help immigrants practice conversational English in a supportive environment.",
    "category": "Education",
    "urgency": "Low",
    "status": "Open",
    "location": "Library Conference Room",
    "requester": {"name": "Ivan Petrov"},
    "createdAt": "2025-08-24T11:00:00Z",
    "acceptedBy": null
  },
  {
    "_id": "8",
    "title": "Home repair assistance",
    "description": "Need help with basic home repairs including fixing a leaky faucet and painting a room for a single mother.",
    "category": "Household",
    "urgency": "Medium",
    "status": "Open",
    "location": "Riverside District",
    "requester": {"name": "Julia Martinez"},
    "createdAt": "2025-08-23T16:45:00Z",
    "acceptedBy": null
  },
  {
    "_id": "9",
    "title": "Website development help",
    "description": "Small nonprofit needs help creating a simple website to showcase their community programs and accept donations.",
    "category": "Technology",
    "urgency": "Low",
    "status": "Open",
    "location": "Community Center",
    "requester": {"name": "Kevin Chang"},
    "createdAt": "2025-08-22T13:20:00Z",
    "acceptedBy": null
  },
  {
    "_id": "10",
    "title": "Food bank volunteering",
    "description": "Local food bank needs volunteers to help sort and pack food donations for distribution to families in need.",
    "category": "Food",
    "urgency": "High",
    "status": "Open",
    "location": "Food Bank Warehouse",
    "requester": {"name": "Linda Brown"},
    "createdAt": "2025-08-21T08:15:00Z",
    "acceptedBy": null
  }
];

const RequestsContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};

// Points calculation function
const calculatePoints = (request, completionData = {}) => {
  const basePoints = {
    'Technology': 120,
    'Education': 100, 
    'Transportation': 80,
    'Food': 60,
    'Health': 110,
    'Household': 70,
    'Other': 50
  };

  const urgencyMultiplier = {
    'Low': 1.0,
    'Medium': 1.2,
    'High': 1.5,
    'Critical': 2.0
  };

  let points = basePoints[request.category] || 60;
  points *= urgencyMultiplier[request.urgency] || 1.0;

  // Bonus points for quality
  if (completionData.rating >= 5) points *= 1.25;
  if (completionData.completedEarly) points *= 1.15;
  if (completionData.excellentFeedback) points *= 1.1;

  return Math.round(points);
};

// Badge checking function
const checkForNewBadges = (userStats) => {
  const badges = [];
  
  if (userStats.requestsCompleted === 1 && !userStats.badges.includes('first-helper')) {
    badges.push({
      id: 'first-helper',
      name: 'First Helper',
      description: 'Completed your first request!',
      icon: '🌟',
      points: 50
    });
  }
  
  if (userStats.requestsCompleted === 5 && !userStats.badges.includes('helping-hand')) {
    badges.push({
      id: 'helping-hand',
      name: 'Helping Hand',
      description: 'Completed 5 requests!',
      icon: '🤝',
      points: 100
    });
  }
  
  if (userStats.requestsCompleted === 10 && !userStats.badges.includes('community-champion')) {
    badges.push({
      id: 'community-champion',
      name: 'Community Champion',
      description: 'Completed 10 requests!',
      icon: '🏆',
      points: 200
    });
  }
  
  if (userStats.requestsCompleted === 25 && !userStats.badges.includes('super-helper')) {
    badges.push({
      id: 'super-helper',
      name: 'Super Helper',
      description: 'Completed 25 requests!',
      icon: '⭐',
      points: 300
    });
  }

  return badges;
};

export const RequestsProvider = ({ children }) => {
  const [requests, setRequests] = useState(() => {
    const savedRequests = localStorage.getItem('helpHub_requests');
    return savedRequests ? JSON.parse(savedRequests) : INITIAL_REQUESTS;
  });

  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('helpHub_userStats');
    return saved ? JSON.parse(saved) : {};
  });

  // Save requests to localStorage whenever requests change
  useEffect(() => {
    localStorage.setItem('helpHub_requests', JSON.stringify(requests));
  }, [requests]);

  // Save user stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('helpHub_userStats', JSON.stringify(userStats));
  }, [userStats]);

  const addRequest = (newRequest) => {
    const requestWithId = {
      ...newRequest,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'Open',
      acceptedBy: null,
      requester: newRequest.requester || { name: 'Current User' }
    };
    
    setRequests(prevRequests => [requestWithId, ...prevRequests]);
    return requestWithId;
  };

  const updateRequest = (requestId, updates) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request._id === requestId 
          ? { ...request, ...updates }
          : request
      )
    );
  };

  const deleteRequest = (requestId) => {
    setRequests(prevRequests => 
      prevRequests.filter(request => request._id !== requestId)
    );
  };

  const getFilteredRequests = (filters) => {
    let filteredRequests = requests;
    
    if (filters.category && filters.category !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.category === filters.category);
    }
    if (filters.urgency && filters.urgency !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.urgency === filters.urgency);
    }
    if (filters.status && filters.status !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.status === filters.status);
    }
    
    return filteredRequests;
  };

  const completeRequest = (requestId, completionData = {}, userId) => {
    const request = requests.find(r => r._id === requestId);
    if (!request) return { points: 0, badges: [] };

    // Calculate points
    const points = calculatePoints(request, completionData);
    
    // Update request status
    updateRequest(requestId, {
      status: 'Completed',
      completedAt: new Date().toISOString(),
      completionData,
      pointsAwarded: points
    });

    // Update user stats
    let newBadges = [];
    setUserStats(prevStats => {
      const currentStats = prevStats[userId] || {
        totalPoints: 0,
        requestsCompleted: 0,
        categoriesHelped: {},
        badges: [],
        joinedAt: new Date().toISOString(),
        achievements: []
      };

      const updatedStats = {
        ...currentStats,
        totalPoints: currentStats.totalPoints + points,
        requestsCompleted: currentStats.requestsCompleted + 1,
        categoriesHelped: {
          ...currentStats.categoriesHelped,
          [request.category]: (currentStats.categoriesHelped[request.category] || 0) + 1
        },
        lastActivity: new Date().toISOString()
      };

      // Check for new badges
      newBadges = checkForNewBadges(updatedStats);
      
      // Add badges and their points
      if (newBadges.length > 0) {
        const badgePoints = newBadges.reduce((total, badge) => total + badge.points, 0);
        updatedStats.totalPoints += badgePoints;
        updatedStats.badges = [...updatedStats.badges, ...newBadges.map(b => b.id)];
        updatedStats.achievements = [...(updatedStats.achievements || []), ...newBadges];
      }

      return {
        ...prevStats,
        [userId]: updatedStats
      };
    });

    return { points, badges: newBadges };
  };

  const getLeaderboard = (timeframe = 'all', limit = 10) => {
    const now = new Date();
    let filteredStats = Object.entries(userStats);

    if (timeframe === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredStats = filteredStats.filter(([userId, stats]) => {
        return new Date(stats.lastActivity) >= monthAgo;
      });
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredStats = filteredStats.filter(([userId, stats]) => {
        return new Date(stats.lastActivity) >= weekAgo;
      });
    }

    return filteredStats
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  };

  const getUserStats = (userId) => {
    return userStats[userId] || {
      totalPoints: 0,
      requestsCompleted: 0,
      categoriesHelped: {},
      badges: [],
      achievements: [],
      joinedAt: new Date().toISOString()
    };
  };

  const value = {
    requests,
    addRequest,
    updateRequest,
    deleteRequest,
    getFilteredRequests,
    completeRequest,
    userStats,
    getUserStats,
    getLeaderboard
  };

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
};
