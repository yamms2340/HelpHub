const User = require('../models/User');
const UserScore = require('../models/UserScore');
const HelpRequest = require('../models/HelpRequest');

class LeaderboardService {
  static async getLeaderboard(timeframe = 'all', limit = 10) {
    try {
      let sortField = 'totalPoints';
      let query = { totalPoints: { $gt: 0 } };

      // Determine sort field based on timeframe
      if (timeframe === 'month') {
        sortField = 'monthlyPoints';
        query = { monthlyPoints: { $gt: 0 } };
      } else if (timeframe === 'week') {
        sortField = 'weeklyPoints';
        query = { weeklyPoints: { $gt: 0 } };
      }

      const users = await User.find(query)
        .select(`name totalPoints monthlyPoints weeklyPoints requestsCompleted badges achievements profilePicture rating totalRatings helpCount`)
        .sort({ [sortField]: -1, requestsCompleted: -1 })
        .limit(limit)
        .lean();

      return users.map((user, index) => ({
        userId: user._id.toString(),
        name: user.name,
        totalPoints: timeframe === 'all' ? user.totalPoints : 
                    timeframe === 'month' ? user.monthlyPoints : user.weeklyPoints,
        requestsCompleted: user.requestsCompleted,
        helpCount: user.helpCount,
        rating: user.rating,
        totalRatings: user.totalRatings,
        badges: user.badges || [],
        achievements: user.achievements || [],
        rank: index + 1,
        avatar: user.profilePicture || '',
        allTimePoints: user.totalPoints // Always include total points for reference
      }));

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    try {
      const user = await User.findById(userId)
        .select('name totalPoints monthlyPoints weeklyPoints requestsCompleted requestsCreated badges achievements profilePicture rating totalRatings helpCount')
        .lean();

      if (!user) {
        return {
          totalPoints: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          requestsCompleted: 0,
          requestsCreated: 0,
          helpCount: 0,
          rating: 0,
          totalRatings: 0,
          badges: [],
          achievements: [],
          rank: null
        };
      }

      // Get user's rank in all-time leaderboard
      const higherRankedUsers = await User.countDocuments({
        totalPoints: { $gt: user.totalPoints }
      });
      const rank = higherRankedUsers + 1;

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentScores = await UserScore.find({
        userId,
        earnedAt: { $gte: thirtyDaysAgo }
      }).lean();

      const recentPoints = recentScores.reduce((sum, score) => 
        sum + score.points + (score.bonusPoints || 0), 0
      );

      return {
        userId: user._id.toString(),
        name: user.name,
        totalPoints: user.totalPoints,
        monthlyPoints: user.monthlyPoints || 0,
        weeklyPoints: user.weeklyPoints || 0,
        requestsCompleted: user.requestsCompleted,
        requestsCreated: user.requestsCreated,
        helpCount: user.helpCount,
        rating: user.rating,
        totalRatings: user.totalRatings,
        badges: user.badges || [],
        achievements: user.achievements || [],
        rank,
        recentPoints,
        recentCompletions: recentScores.length,
        avatar: user.profilePicture || ''
      };

    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  static async resetMonthlyWeeklyPoints() {
    try {
      const now = new Date();
      
      // Reset monthly points at the start of each month
      await User.updateMany(
        {
          $expr: {
            $or: [
              { $ne: [{ $month: '$lastPointsReset' }, { $month: now }] },
              { $ne: [{ $year: '$lastPointsReset' }, { $year: now }] }
            ]
          }
        },
        {
          $set: {
            monthlyPoints: 0,
            lastPointsReset: now
          }
        }
      );

      // Reset weekly points at the start of each week
      const lastSunday = new Date(now);
      lastSunday.setDate(now.getDate() - now.getDay());
      lastSunday.setHours(0, 0, 0, 0);

      await User.updateMany(
        {
          lastPointsReset: { $lt: lastSunday }
        },
        {
          $set: {
            weeklyPoints: 0,
            lastPointsReset: now
          }
        }
      );

      console.log('Monthly and weekly points reset completed');
    } catch (error) {
      console.error('Error resetting points:', error);
    }
  }
}

module.exports = LeaderboardService;
