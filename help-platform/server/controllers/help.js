const helpService = require('../services/help');

const helpController = {
  async getHallOfFame(req, res) {
    try {
      console.log('✅ GET /api/help/hall-of-fame called');
      
      const topHelpers = await helpService.getTopHelpers();
      
      res.json({
        success: true,
        data: topHelpers,
        count: topHelpers.length,
        message: 'Hall of fame retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Hall of fame error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  },

  async getUserHelpHistory(req, res) {
    try {
      const userId = req.params.userId;
      console.log(`✅ GET /api/help/history/${userId} called`);
      
      const helpHistory = await helpService.getHelpHistoryByUser(userId);
      
      res.json({
        success: true,
        data: helpHistory,
        count: helpHistory.length,
        message: 'Help history retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Help history error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  },

  async getPlatformStats(req, res) {
    try {
      console.log('✅ GET /api/help/stats called');
      
      const stats = await helpService.calculatePlatformStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'Platform statistics retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  },

  async getInspiringStories(req, res) {
    try {
      console.log('✅ GET /api/help/inspiring-stories called');
      
      const limit = parseInt(req.query.limit) || 10;
      const stories = await helpService.getInspiringStories(limit);
      
      res.json({
        success: true,
        data: stories.data,
        count: stories.count,
        total: stories.total,
        message: 'Inspiring stories retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Inspiring stories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

module.exports = helpController;
