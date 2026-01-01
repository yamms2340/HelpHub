const cacheService = require('./cache');

// Try to import existing services if they exist
let LeaderboardService, PointsService;
try {
  LeaderboardService = require('./leaderboardService');
  PointsService = require('./PointsService');
  console.log('✅ Existing LeaderboardService and PointsService loaded');
} catch (error) {
  console.warn('⚠️ Existing services not found, using internal implementation');
  LeaderboardService = null;
  PointsService = null;
}

class LeaderboardError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Mock leaderboard data
const mockLeaderboardData = [
  {
    userId: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    totalPoints: 1250,
    monthlyPoints: 350,
    weeklyPoints: 120,
    helpCount: 25,
    rating: 4.8,
    avatar: '/images/sarah.jpg',
    rank: 1
  },
  {
    userId: '2',
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    totalPoints: 980,
    monthlyPoints: 280,
    weeklyPoints: 95,
    helpCount: 18,
    rating: 4.6,
    avatar: '/images/maria.jpg',
    rank: 2
  },
  {
    userId: '3',
    name: 'John Smith',
    email: 'john@example.com',
    totalPoints: 750,
    monthlyPoints: 200,
    weeklyPoints: 80,
    helpCount: 15,
    rating: 4.5,
    avatar: '/images/john.jpg',
    rank: 3
  }
];

const leaderboardService = {
  async getLeaderboard(timeframe = 'all', limit = 10) {
    const cacheKey = `leaderboard:${timeframe}:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`✅ Leaderboard cache HIT: ${cacheKey}`);
      return cached;
    }

    // If existing service exists, use it
    if (LeaderboardService && LeaderboardService.getLeaderboard) {
      const result = await LeaderboardService.getLeaderboard(timeframe, limit);
      // Cache for 5 minutes
      await cacheService.set(cacheKey, result, 300);
      return result;
    }

    // Otherwise use mock implementation
    let sortedData = [...mockLeaderboardData];
    
    // Sort based on timeframe
    switch (timeframe) {
      case 'week':
        sortedData.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
        break;
      case 'month':
        sortedData.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
        break;
      case 'all':
      default:
        sortedData.sort((a, b) => b.totalPoints - a.totalPoints);
    }
    
    // Update ranks
    sortedData = sortedData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    // Apply limit
    const result = sortedData.slice(0, limit);
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);
    
    return result;
  },

  async getUserStats(userId) {
    const cacheKey = `user:stats:${userId}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`✅ User stats cache HIT: ${userId}`);
      return cached;
    }

    // If existing service exists, use it
    if (LeaderboardService && LeaderboardService.getUserStats) {
      const result = await LeaderboardService.getUserStats(userId);
      // Cache for 2 minutes
      await cacheService.set(cacheKey, result, 120);
      return result;
    }

    // Mock implementation
    const user = mockLeaderboardData.find(u => u.userId === userId);
    
    if (!user) {
      throw new LeaderboardError('User not found', 404);
    }
    
    const result = {
      ...user,
      recentActivity: [
        {
          type: 'help_completed',
          points: 50,
          description: 'Completed emergency request',
          date: new Date()
        },
        {
          type: 'donation',
          points: 30,
          description: 'Donated to campaign',
          date: new Date(Date.now() - 86400000)
        }
      ],
      achievements: [
        {
          name: 'Top Helper',
          description: 'Helped 25+ people',
          earnedAt: new Date()
        }
      ]
    };

    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, 120);
    
    return result;
  },

  async awardPoints(userId, requestData, completionData) {
    // If existing PointsService exists, use it
    if (PointsService && PointsService.awardPoints) {
      const result = await PointsService.awardPoints(userId, requestData, completionData);
      
      // Invalidate caches
      await cacheService.del(`user:stats:${userId}`);
      await cacheService.delPattern('leaderboard:*');
      
      return result;
    }

    // Mock implementation
    if (!userId) {
      throw new LeaderboardError('User ID is required', 400);
    }

    // Calculate points based on request data
    let points = 50; // Base points
    
    if (requestData?.urgency === 'high') {
      points += 20;
    }
    
    if (requestData?.category === 'emergency') {
      points += 30;
    }
    
    if (completionData?.rating >= 4.5) {
      points += 15;
    }

    // Update mock user data
    const user = mockLeaderboardData.find(u => u.userId === userId);
    if (user) {
      user.totalPoints += points;
      user.monthlyPoints += points;
      user.weeklyPoints += points;
      user.helpCount += 1;
    }

    const result = {
      userId,
      pointsAwarded: points,
      newTotalPoints: user ? user.totalPoints : points,
      breakdown: {
        base: 50,
        urgencyBonus: requestData?.urgency === 'high' ? 20 : 0,
        categoryBonus: requestData?.category === 'emergency' ? 30 : 0,
        ratingBonus: completionData?.rating >= 4.5 ? 15 : 0
      }
    };

    // Invalidate caches
    await cacheService.del(`user:stats:${userId}`);
    await cacheService.delPattern('leaderboard:*');

    return result;
  },

  async getStatsOverview() {
    const cacheKey = 'leaderboard:overview';
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [allTime, monthly, weekly] = await Promise.all([
      this.getLeaderboard('all', 5),
      this.getLeaderboard('month', 5),
      this.getLeaderboard('week', 5)
    ]);

    const result = {
      allTime,
      monthly,
      weekly,
      totalHelpers: mockLeaderboardData.length,
      totalPoints: mockLeaderboardData.reduce((sum, user) => sum + user.totalPoints, 0)
    };

    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, 600);

    return result;
  },

  async resetMonthlyWeeklyPoints() {
    // If existing service exists, use it
    if (LeaderboardService && LeaderboardService.resetMonthlyWeeklyPoints) {
      const result = await LeaderboardService.resetMonthlyWeeklyPoints();
      
      // Invalidate all leaderboard caches
      await cacheService.delPattern('leaderboard:*');
      await cacheService.delPattern('user:stats:*');
      
      return result;
    }

    // Mock implementation - reset monthly and weekly points
    mockLeaderboardData.forEach(user => {
      user.monthlyPoints = 0;
      user.weeklyPoints = 0;
    });

    // Invalidate all leaderboard caches
    await cacheService.delPattern('leaderboard:*');
    await cacheService.delPattern('user:stats:*');

    return {
      message: 'Monthly and weekly points reset successfully',
      affectedUsers: mockLeaderboardData.length
    };
  }
};

module.exports = leaderboardService;
