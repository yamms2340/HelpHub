const leaderboardService = require('../services/leaderboard');

const leaderboardController = {
  async getLeaderboard(req, res) {
    try {
      const { timeframe = 'all', limit = 10 } = req.query;
      
      const leaderboard = await leaderboardService.getLeaderboard(
        timeframe, 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: leaderboard,
        timeframe,
        count: leaderboard.length
      });
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard'
      });
    }
  },

  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const userStats = await leaderboardService.getUserStats(userId);
      
      res.json({
        success: true,
        data: userStats
      });
    } catch (error) {
      console.error('User stats fetch error:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user stats'
      });
    }
  },

  async awardPoints(req, res) {
    try {
      const { userId, requestData, completionData } = req.body;
      
      const result = await leaderboardService.awardPoints(
        userId, 
        requestData, 
        completionData
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Points award error:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to award points'
      });
    }
  },

  async getStatsOverview(req, res) {
    try {
      const overview = await leaderboardService.getStatsOverview();
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Stats overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats overview'
      });
    }
  },

  async resetPoints(req, res) {
    try {
      await leaderboardService.resetMonthlyWeeklyPoints();
      
      res.json({
        success: true,
        message: 'Points reset completed'
      });
    } catch (error) {
      console.error('Points reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset points'
      });
    }
  }
};

module.exports = leaderboardController;
