const express = require('express');
const router = express.Router();

// Import models (make sure these exist in your models folder)
let User, Help;
try {
  User = require('../models/User');
  Help = require('../models/Help');
} catch (error) {
  console.warn('⚠️ User/Help models not found, using mock data');
}

// Get hall of fame (top helpers)
router.get('/hall-of-fame', async (req, res) => {
  try {
    console.log('✅ GET /api/help/hall-of-fame called');
    
    if (!User) {
      // Mock data if User model doesn't exist
      return res.json({
        success: true,
        data: [
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
          }
        ],
        message: 'Hall of fame retrieved successfully'
      });
    }

    const topHelpers = await User.find({ helpCount: { $gt: 0 } })
      .select('name email helpCount rating profilePicture')
      .sort({ helpCount: -1, rating: -1 })
      .limit(20);

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
});

// Get help history for a specific user
router.get('/history/:userId', async (req, res) => {
  try {
    console.log(`✅ GET /api/help/history/${req.params.userId} called`);
    
    if (!Help) {
      // Mock data if Help model doesn't exist
      return res.json({
        success: true,
        data: [
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
          }
        ],
        message: 'Help history retrieved successfully'
      });
    }

    const helpHistory = await Help.find({ helper: req.params.userId })
      .populate('request', 'title description category')
      .populate('requester', 'name email')
      .sort({ completedAt: -1 });

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
});

// Get statistics for the platform  
router.get('/stats', async (req, res) => {
  try {
    console.log('✅ GET /api/help/stats called');
    
    if (!User || !Help) {
      // Mock data if models don't exist
      return res.json({
        success: true,
        data: {
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
            emergency: 15
          }
        },
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

    res.json({
      success: true,
      data: {
        totalHelpers,
        totalHelp,
        averageRating: avgRating[0]?.avgRating || 0,
        thisMonth: {
          newHelpers: monthlyHelpers,
          completedHelp: monthlyHelp
        }
      },
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

// Get inspiring stories (alias to stories route)
router.get('/inspiring-stories', async (req, res) => {
  try {
    console.log('✅ GET /api/help/inspiring-stories called');
    
    const limit = parseInt(req.query.limit) || 10;
    
    // Mock inspiring stories data
    const inspiringStories = [
      {
        id: 1,
        title: 'From Struggle to Success',
        author: 'Anonymous Helper',
        story: 'Started helping one person at a time, now impacting hundreds of lives.',
        impact: '200+ people helped',
        category: 'Community',
        date: new Date(),
        likes: 156,
        views: 823
      },
      {
        id: 2,
        title: 'The Power of Small Acts',
        author: 'Maria Rodriguez',
        story: 'Small daily acts of kindness grew into a community movement.',
        impact: '500+ families supported',
        category: 'Community Support',
        date: new Date(),
        likes: 234,
        views: 1205
      }
    ];

    const limitedStories = inspiringStories.slice(0, limit);

    res.json({
      success: true,
      data: limitedStories,
      count: limitedStories.length,
      total: inspiringStories.length,
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

module.exports = router;
