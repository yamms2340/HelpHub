const express = require('express');
const router = express.Router();
const cacheService = require('../services/cache'); // ✅ ADD CACHE

// Import models (make sure these exist in your models folder)
let User, Help;
try {
  User = require('../models/User');
  Help = require('../models/Help');
} catch (error) {
  console.warn('⚠️ User/Help models not found, using mock data');
}

// ==================== GET HALL OF FAME ====================
router.get('/hall-of-fame', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    console.log('✅ GET /api/help/hall-of-fame called');

    // ✅ CACHE KEY
    const cacheKey = `help:hall-of-fame:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Hall of fame served from cache');
      return res.json({
        success: true,
        data: cached.data,
        count: cached.count,
        message: 'Hall of fame retrieved successfully'
      });
    }
    
    if (!User) {
      // Mock data if User model doesn't exist
      const mockData = [
        {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',  
          helpCount: 25,
          rating: 4.8,
          profilePicture: '/images/sarah.jpg'
        },
        {
          _id: '2',
          name: 'Maria Rodriguez',
          email: 'maria@example.com',
          helpCount: 18,
          rating: 4.6,
          profilePicture: '/images/maria.jpg'
        },
        {
          _id: '3',
          name: 'James Chen',
          email: 'james@example.com',
          helpCount: 15,
          rating: 4.7,
          profilePicture: '/images/james.jpg'
        }
      ];

      const result = {
        data: mockData,
        count: mockData.length
      };

      // ✅ CACHE MOCK DATA (5 minutes)
      await cacheService.set(cacheKey, result, 300);

      return res.json({
        success: true,
        data: result.data,
        count: result.count,
        message: 'Hall of fame retrieved successfully'
      });
    }

    const topHelpers = await User.find({ helpCount: { $gt: 0 } })
      .select('name email helpCount rating profilePicture points totalPoints')
      .sort({ helpCount: -1, rating: -1 })
      .limit(parseInt(limit));

    const result = {
      data: topHelpers,
      count: topHelpers.length
    };

    console.log(`✅ Fetched ${topHelpers.length} top helpers from DB`);

    // ✅ CACHE FOR 10 MINUTES
    await cacheService.set(cacheKey, result, 600);

    res.json({
      success: true,
      data: result.data,
      count: result.count,
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
});

// ==================== GET HELP HISTORY ====================
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    
    console.log(`✅ GET /api/help/history/${userId} called`);

    // ✅ CACHE KEY
    const cacheKey = `help:history:${userId}:page${page}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Help history served from cache:', userId);
      return res.json({
        success: true,
        data: cached.data,
        count: cached.count,
        message: 'Help history retrieved successfully'
      });
    }
    
    if (!Help) {
      // Mock data if Help model doesn't exist
      const mockData = [
        {
          _id: '1',
          request: {
            _id: 'req1',
            title: 'Emergency Medical Help',
            description: 'Need urgent medical assistance',
            category: 'Healthcare'
          },
          requester: {
            _id: 'user1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          completedAt: new Date()
        },
        {
          _id: '2',
          request: {
            _id: 'req2',
            title: 'Education Support',
            description: 'Help with tutoring',
            category: 'Education'
          },
          requester: {
            _id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com'
          },
          completedAt: new Date(Date.now() - 86400000)
        }
      ];

      const result = {
        data: mockData,
        count: mockData.length
      };

      // ✅ CACHE MOCK DATA (5 minutes)
      await cacheService.set(cacheKey, result, 300);

      return res.json({
        success: true,
        data: result.data,
        count: result.count,
        message: 'Help history retrieved successfully'
      });
    }

    const skip = (page - 1) * limit;
    const helpHistory = await Help.find({ helper: userId })
      .populate('request', 'title description category')
      .populate('requester', 'name email')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const result = {
      data: helpHistory,
      count: helpHistory.length
    };

    console.log(`✅ Fetched ${helpHistory.length} help records from DB`);

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result.data,
      count: result.count,
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
});

// ==================== GET PLATFORM STATISTICS ====================
router.get('/stats', async (req, res) => {
  try {
    console.log('✅ GET /api/help/stats called');

    // ✅ CACHE KEY
    const cacheKey = 'help:stats';

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Help stats served from cache');
      return res.json({
        success: true,
        data: cached,
        message: 'Platform statistics retrieved successfully'
      });
    }
    
    if (!User || !Help) {
      // Mock data if models don't exist
      const mockStats = {
        totalHelpers: 42,
        totalHelp: 156,
        averageRating: 4.6,
        thisMonth: {
          newHelpers: 8,
          completedHelp: 23
        },
        categories: {
          healthcare: 45,
          education: 32,
          community: 28,
          emergency: 15,
          other: 36
        },
        trends: {
          helpGrowth: '+12%',
          helperGrowth: '+8%'
        }
      };

      // ✅ CACHE MOCK DATA (3 minutes)
      await cacheService.set(cacheKey, mockStats, 180);

      return res.json({
        success: true,
        data: mockStats,
        message: 'Platform statistics retrieved successfully'
      });
    }

    const totalHelpers = await User.countDocuments({ helpCount: { $gt: 0 } });
    const totalHelp = await Help.countDocuments();
    
    const avgRating = await User.aggregate([
      { $match: { helpCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Additional statistics
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const monthlyHelpers = await User.countDocuments({ 
      createdAt: { $gte: thisMonth },
      helpCount: { $gt: 0 }
    });
    
    const monthlyHelp = await Help.countDocuments({
      completedAt: { $gte: thisMonth }
    });

    // Category breakdown
    const categoryStats = await Help.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categories = {};
    categoryStats.forEach(cat => {
      categories[cat._id?.toLowerCase() || 'other'] = cat.count;
    });

    const stats = {
      totalHelpers,
      totalHelp,
      averageRating: Math.round((avgRating[0]?.avgRating || 0) * 10) / 10,
      thisMonth: {
        newHelpers: monthlyHelpers,
        completedHelp: monthlyHelp
      },
      categories
    };

    console.log('✅ Help stats calculated');

    // ✅ CACHE FOR 5 MINUTES
    await cacheService.set(cacheKey, stats, 300);

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
});

// ==================== GET INSPIRING STORIES ====================
router.get('/inspiring-stories', async (req, res) => {
  try {
    const { limit = 10, category, sortBy = 'recent' } = req.query;
    
    console.log('✅ GET /api/help/inspiring-stories called');

    // ✅ CACHE KEY
    const cacheKey = `help:inspiring-stories:${category || 'all'}:${sortBy}:limit${limit}`;

    // ✅ TRY CACHE FIRST
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Inspiring stories served from cache');
      return res.json({
        success: true,
        data: cached.data,
        count: cached.count,
        total: cached.total,
        message: 'Inspiring stories retrieved successfully'
      });
    }
    
    // Mock inspiring stories data
    const inspiringStories = [
      {
        id: 1,
        title: 'From Struggle to Success',
        author: 'Anonymous Helper',
        story: 'Started helping one person at a time, now impacting hundreds of lives through community service.',
        impact: '200+ people helped',
        category: 'Community',
        date: new Date(),
        likes: 156,
        views: 823,
        verified: true
      },
      {
        id: 2,
        title: 'The Power of Small Acts',
        author: 'Maria Rodriguez',
        story: 'Small daily acts of kindness grew into a community movement that transformed our neighborhood.',
        impact: '500+ families supported',
        category: 'Community Support',
        date: new Date(Date.now() - 86400000 * 2),
        likes: 234,
        views: 1205,
        verified: true
      },
      {
        id: 3,
        title: 'Education Changes Lives',
        author: 'Dr. James Chen',
        story: 'Volunteering as a tutor opened doors for underprivileged students to achieve their dreams.',
        impact: '50+ students graduated',
        category: 'Education',
        date: new Date(Date.now() - 86400000 * 5),
        likes: 189,
        views: 967,
        verified: true
      },
      {
        id: 4,
        title: 'Healthcare for All',
        author: 'Dr. Sarah Johnson',
        story: 'Free medical camps brought healthcare to remote villages where it was needed most.',
        impact: '1000+ patients treated',
        category: 'Healthcare',
        date: new Date(Date.now() - 86400000 * 7),
        likes: 312,
        views: 1543,
        verified: true
      }
    ];

    // Filter by category if provided
    let filteredStories = category 
      ? inspiringStories.filter(s => s.category.toLowerCase() === category.toLowerCase())
      : inspiringStories;

    // Sort stories
    if (sortBy === 'popular') {
      filteredStories.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'views') {
      filteredStories.sort((a, b) => b.views - a.views);
    } else {
      filteredStories.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const limitedStories = filteredStories.slice(0, parseInt(limit));

    const result = {
      data: limitedStories,
      count: limitedStories.length,
      total: inspiringStories.length
    };

    console.log(`✅ Fetched ${limitedStories.length} inspiring stories`);

    // ✅ CACHE FOR 10 MINUTES
    await cacheService.set(cacheKey, result, 600);

    res.json({
      success: true,
      data: result.data,
      count: result.count,
      total: result.total,
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
});

// ==================== INVALIDATE HELP CACHES (UTILITY) ====================
// This can be called from other routes when help data is updated
router.invalidateHelpCaches = async (userId) => {
  try {
    await cacheService.delPattern('help:*');
    if (userId) {
      await cacheService.delPattern(`help:history:${userId}*`);
    }
    console.log('🗑️ Help caches invalidated');
  } catch (error) {
    console.error('❌ Error invalidating help caches:', error);
  }
};

module.exports = router;
