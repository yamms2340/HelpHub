const express = require('express');
const router = express.Router();
const LeaderboardService = require('../services/leaderboardService');
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth');
const cacheService = require('../services/cache'); // ✅ ADD CACHE

// ==================== GET LEADERBOARD ====================
router.get('/', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    
    console.log(`📊 GET /api/leaderboard - Timeframe: ${timeframe}, Limit: ${limit}`);

    // ✅ CACHE KEY
    const cacheKey = `leaderboard:${timeframe}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Leaderboard served from cache:', timeframe);
      return res.json({
        success: true,
        data: cached,
        timeframe,
        count: cached.length
      });
    }

    // Fetch from service
    const leaderboard = await LeaderboardService.getLeaderboard(timeframe, parseInt(limit));
    
    console.log(`✅ Fetched ${leaderboard.length} leaderboard entries from DB`);

    // ✅ CACHE FOR 2 MINUTES (leaderboard changes frequently)
    await cacheService.set(cacheKey, leaderboard, 120);
    
    res.json({
      success: true,
      data: leaderboard,
      timeframe,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== GET USER STATS ====================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`👤 GET /api/leaderboard/user/${userId}`);

    // ✅ CACHE KEY
    const cacheKey = `leaderboard:user:${userId}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ User stats served from cache:', userId);
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from service
    const userStats = await LeaderboardService.getUserStats(userId);
    
    console.log('✅ User stats fetched from DB:', userId);

    // ✅ CACHE FOR 3 MINUTES
    await cacheService.set(cacheKey, userStats, 180);
    
    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('❌ User stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== AWARD POINTS ====================
router.post('/award-points', auth, async (req, res) => {
  try {
    const { userId, requestData, completionData } = req.body;
    
    console.log(`🏆 POST /api/leaderboard/award-points - User: ${userId}`);

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    const result = await PointsService.awardPoints(userId, requestData, completionData);
    
    console.log('✅ Points awarded successfully:', result);

    // ✅ INVALIDATE LEADERBOARD CACHES
    await cacheService.delPattern('leaderboard:*');
    console.log('🗑️ Leaderboard caches invalidated after points award');
    
    res.json({
      success: true,
      data: result,
      message: 'Points awarded successfully'
    });
  } catch (error) {
    console.error('❌ Points award error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== GET STATS OVERVIEW ====================
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('📈 GET /api/leaderboard/stats/overview');

    // ✅ CACHE KEY
    const cacheKey = 'leaderboard:stats:overview';

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Stats overview served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from service
    const [allTime, monthly, weekly] = await Promise.all([
      LeaderboardService.getLeaderboard('all', 5),
      LeaderboardService.getLeaderboard('month', 5),
      LeaderboardService.getLeaderboard('week', 5)
    ]);

    const statsOverview = {
      allTime,
      monthly,
      weekly,
      summary: {
        totalAllTime: allTime.length,
        totalMonthly: monthly.length,
        totalWeekly: weekly.length
      }
    };

    console.log('✅ Stats overview fetched from DB');

    // ✅ CACHE FOR 2 MINUTES
    await cacheService.set(cacheKey, statsOverview, 120);

    res.json({
      success: true,
      data: statsOverview
    });
  } catch (error) {
    console.error('❌ Stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== RESET POINTS (ADMIN) ====================
router.post('/reset-points', auth, async (req, res) => {
  try {
    console.log('🔄 POST /api/leaderboard/reset-points - Resetting points...');

    // TODO: Add admin check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Unauthorized - Admin access required'
    //   });
    // }

    await LeaderboardService.resetMonthlyWeeklyPoints();
    
    console.log('✅ Points reset completed');

    // ✅ INVALIDATE ALL LEADERBOARD CACHES
    await cacheService.delPattern('leaderboard:*');
    console.log('🗑️ All leaderboard caches invalidated after reset');

    res.json({
      success: true,
      message: 'Points reset completed successfully'
    });
  } catch (error) {
    console.error('❌ Points reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset points',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== GET TOP PERFORMERS BY CATEGORY ====================
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`🏅 GET /api/leaderboard/category/${category}`);

    // ✅ CACHE KEY
    const cacheKey = `leaderboard:category:${category}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Category leaderboard served from cache:', category);
      return res.json({
        success: true,
        data: cached,
        category,
        count: cached.length
      });
    }

    // Fetch from service (you may need to implement this in LeaderboardService)
    const leaderboard = await LeaderboardService.getLeaderboardByCategory(category, parseInt(limit));
    
    console.log(`✅ Fetched ${leaderboard.length} entries for category:`, category);

    // ✅ CACHE FOR 3 MINUTES
    await cacheService.set(cacheKey, leaderboard, 180);
    
    res.json({
      success: true,
      data: leaderboard,
      category,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('❌ Category leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== GET USER RANK ====================
router.get('/user/:userId/rank', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;
    
    console.log(`🎯 GET /api/leaderboard/user/${userId}/rank - Timeframe: ${timeframe}`);

    // ✅ CACHE KEY
    const cacheKey = `leaderboard:user:${userId}:rank:${timeframe}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ User rank served from cache:', userId);
      return res.json({
        success: true,
        data: cached
      });
    }

    // Fetch from service (you may need to implement this)
    const rankData = await LeaderboardService.getUserRank(userId, timeframe);
    
    console.log('✅ User rank fetched from DB:', userId);

    // ✅ CACHE FOR 2 MINUTES
    await cacheService.set(cacheKey, rankData, 120);
    
    res.json({
      success: true,
      data: rankData
    });
  } catch (error) {
    console.error('❌ User rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== INVALIDATE USER CACHE (UTILITY) ====================
// Export for use in other routes when user points change
router.invalidateUserCache = async (userId) => {
  try {
    await cacheService.delPattern(`leaderboard:user:${userId}*`);
    await cacheService.delPattern('leaderboard:all:*');
    await cacheService.delPattern('leaderboard:month:*');
    await cacheService.delPattern('leaderboard:week:*');
    await cacheService.delPattern('leaderboard:stats:*');
    console.log('🗑️ User leaderboard caches invalidated:', userId);
  } catch (error) {
    console.error('❌ Error invalidating user cache:', error);
  }
};

module.exports = router;
