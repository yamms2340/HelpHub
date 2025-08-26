const express = require('express');
const router = express.Router();
const LeaderboardService = require('../services/leaderboardService');
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth'); // Adjust path as needed

// GET /api/leaderboard?timeframe=all&limit=10
router.get('/', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(timeframe, parseInt(limit));
    
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
});

// GET /api/leaderboard/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userStats = await LeaderboardService.getUserStats(userId);
    
    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
});

// POST /api/leaderboard/award-points
router.post('/award-points', auth, async (req, res) => {
  try {
    const { userId, requestData, completionData } = req.body;
    
    const result = await PointsService.awardPoints(userId, requestData, completionData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Points award error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
});

// GET /api/leaderboard/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const [allTime, monthly, weekly] = await Promise.all([
      LeaderboardService.getLeaderboard('all', 5),
      LeaderboardService.getLeaderboard('month', 5),
      LeaderboardService.getLeaderboard('week', 5)
    ]);

    res.json({
      success: true,
      data: {
        allTime,
        monthly,
        weekly
      }
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats overview'
    });
  }
});

// POST /api/leaderboard/reset-points (admin only)
router.post('/reset-points', auth, async (req, res) => {
  try {
    await LeaderboardService.resetMonthlyWeeklyPoints();
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
});

module.exports = router;
