const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserCoins = require('../models/UserCoins');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth');

// Helper function to sync user points and coins
async function syncUserPointsAndCoins(userId) {
  try {
    const user = await User.findById(userId).select('totalPoints requestsCompleted');
    if (!user) {
      throw new Error('User not found');
    }

    let userCoins = await UserCoins.findOne({ userId });
    
    if (!userCoins) {
      // First time setup - create coins record matching current points
      const initialCoins = user.totalPoints || 0; // 1:1 sync
      userCoins = new UserCoins({
        userId,
        totalCoins: initialCoins,
        lifetimeEarned: initialCoins,
        transactions: initialCoins > 0 ? [{
          type: 'sync',
          amount: initialCoins,
          reason: `Initial sync: ${user.totalPoints} points → ${initialCoins} coins`,
          pointsEquivalent: user.totalPoints
        }] : [],
        level: UserCoins.calculateLevel(initialCoins)
      });
      
      await userCoins.save();
      console.log(`🔄 Initial sync for user ${userId}: ${user.totalPoints} points → ${initialCoins} coins`);
    }
    
    return userCoins;
  } catch (error) {
    console.error('❌ Error syncing points and coins:', error);
    throw error;
  }
}

// GET /api/rewards - Browse all rewards (with real data)
router.get('/', async (req, res) => {
  try {
    console.log('🎁 GET /api/rewards called with params:', req.query);
    
    const {
      category,
      sortBy = 'coinsCost',
      order = 'asc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter
    let filter = { isActive: true };
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    // Pagination
    const skip = (page - 1) * limit;

    try {
      // Try to get rewards from database
      const rewards = await Reward.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      const totalRewards = await Reward.countDocuments(filter);

      if (rewards.length > 0) {
        console.log(`✅ Found ${rewards.length} rewards from database`);
        return res.json({
          success: true,
          data: rewards,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRewards / limit),
            totalRewards,
            hasNext: skip + rewards.length < totalRewards
          },
          message: `Found ${rewards.length} rewards`
        });
      }
    } catch (dbError) {
      console.log('⚠️ Database query failed, using mock data:', dbError.message);
    }

    // Fallback to mock data if database is empty or fails
    const mockRewards = [
      {
        _id: '1',
        title: 'Amazon Gift Card ₹500',
        description: 'Digital gift card for Amazon India - Redeem online instantly',
        category: 'Gift Cards',
        coinsCost: 500,
        originalPrice: 500,
        availability: 100,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop'
      },
      {
        _id: '2',
        title: 'Starbucks Coffee Voucher ₹200',
        description: 'Enjoy premium coffee at any Starbucks outlet nationwide',
        category: 'Food & Drinks',
        coinsCost: 200,
        originalPrice: 200,
        availability: 50,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop'
      },
      {
        _id: '3',
        title: 'BookMyShow Movie Ticket ₹300',
        description: 'Watch the latest movies at your favorite cinema',
        category: 'Entertainment',
        coinsCost: 300,
        originalPrice: 300,
        availability: 75,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1489185078254-c5f7c7e3b8ce?w=300&h=200&fit=crop'
      },
      {
        _id: '4',
        title: 'Flipkart Shopping Voucher ₹1000',
        description: 'Shop for electronics, fashion, and more on Flipkart',
        category: 'Gift Cards',
        coinsCost: 1000,
        originalPrice: 1000,
        availability: 25,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'
      }
    ];

    // Apply filters to mock data
    let filteredRewards = mockRewards.filter(reward => {
      if (category && category !== 'All' && reward.category !== category) return false;
      return true;
    });

    // Apply sorting to mock data
    filteredRewards.sort((a, b) => {
      if (sortBy === 'coinsCost') {
        return order === 'asc' ? a.coinsCost - b.coinsCost : b.coinsCost - a.coinsCost;
      } else if (sortBy === 'title') {
        return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      return 0;
    });

    console.log(`✅ Using mock data: ${filteredRewards.length} rewards`);

    res.json({
      success: true,
      data: filteredRewards,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRewards: filteredRewards.length,
        hasNext: false
      },
      message: `Found ${filteredRewards.length} rewards (mock data)`
    });

  } catch (error) {
    console.error('❌ Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards'
    });
  }
});

// GET /api/rewards/coins - Get REAL user coins data
router.get('/coins', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🪙 Getting REAL coins data for user: ${userId}`);
    
    // Sync points and coins
    const userCoins = await syncUserPointsAndCoins(userId);
    
    // Get user data
    const user = await User.findById(userId).select('totalPoints requestsCompleted badges achievements rating');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const responseData = {
      totalCoins: userCoins.totalCoins,
      userPoints: user.totalPoints || 0,
      lifetimeEarned: userCoins.lifetimeEarned,
      lifetimeRedeemed: userCoins.lifetimeRedeemed,
      level: userCoins.level,
      requestsCompleted: user.requestsCompleted || 0,
      badges: user.badges || [],
      achievements: user.achievements || [],
      rating: user.rating || 0
    };

    console.log(`📊 REAL user data for ${userId}:`, responseData);

    res.json({
      success: true,
      data: responseData,
      message: `User has ${userCoins.totalCoins} coins (synced from ${user.totalPoints} points)`
    });
  } catch (error) {
    console.error('❌ Get coins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coins: ' + error.message
    });
  }
});

// GET /api/rewards/categories - Get reward categories
router.get('/categories', (req, res) => {
  try {
    const categories = ['Gift Cards', 'Electronics', 'Books', 'Food & Drinks', 'Merchandise', 'Entertainment'];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// POST /api/rewards/redeem - Redeem reward with REAL coin deduction
router.post('/redeem', auth, async (req, res) => {
  try {
    const { rewardId, deliveryDetails } = req.body;
    const userId = req.user.id;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: 'Reward ID is required'
      });
    }

    console.log(`🎁 User ${userId} attempting to redeem reward ${rewardId}`);

    // Get user coins (sync if needed)
    const userCoins = await syncUserPointsAndCoins(userId);

    // Mock reward data (you can replace this with database lookup)
    const mockRewards = {
      '1': { title: 'Amazon Gift Card ₹500', coinsCost: 500 },
      '2': { title: 'Starbucks Coffee Voucher ₹200', coinsCost: 200 },
      '3': { title: 'BookMyShow Movie Ticket ₹300', coinsCost: 300 },
      '4': { title: 'Flipkart Shopping Voucher ₹1000', coinsCost: 1000 }
    };

    const reward = mockRewards[rewardId];
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if user has enough coins
    if (userCoins.totalCoins < reward.coinsCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins! You need ${reward.coinsCost} coins but only have ${userCoins.totalCoins} coins.`
      });
    }

    const session = await UserCoins.startSession();
    session.startTransaction();

    try {
      // Deduct coins
      const updatedCoins = await UserCoins.findOneAndUpdate(
        { userId },
        {
          $inc: { 
            totalCoins: -reward.coinsCost, 
            lifetimeRedeemed: reward.coinsCost 
          },
          $push: {
            transactions: {
              type: 'redeemed',
              amount: -reward.coinsCost,
              reason: `Redeemed: ${reward.title}`,
              relatedId: rewardId,
              relatedModel: 'Reward'
            }
          }
        },
        { session, new: true }
      );

      // Generate redemption code
      const redemptionCode = `HH${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create redemption record (mock for now)
      const redemptionData = {
        userId,
        rewardId,
        coinsSpent: reward.coinsCost,
        redemptionCode,
        status: 'pending',
        createdAt: new Date()
      };

      await session.commitTransaction();

      console.log(`✅ Redemption successful: ${redemptionCode}`);
      console.log(`💰 User now has ${updatedCoins.totalCoins} coins (spent ${reward.coinsCost})`);

      res.json({
        success: true,
        data: {
          redemptionCode,
          coinsSpent: reward.coinsCost,
          rewardTitle: reward.title,
          remainingCoins: updatedCoins.totalCoins
        },
        message: `Successfully redeemed ${reward.title}! Your redemption code is: ${redemptionCode}`
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('❌ Redeem error:', error);
    res.status(500).json({
      success: false,
      message: 'Redemption failed: ' + error.message
    });
  }
});

// GET /api/rewards/redemptions - Get user redemptions
router.get('/redemptions', auth, (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📦 GET /api/rewards/redemptions called for user:', userId);
    
    // Mock redemption data (replace with database query)
    const mockRedemptions = [];
    
    res.json({
      success: true,
      data: mockRedemptions,
      message: 'Found 0 redemptions (mock data)'
    });
  } catch (error) {
    console.error('❌ Error fetching redemptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch redemptions'
    });
  }
});

// 🧪 TEST ENDPOINT: Add coins for testing
router.post('/test-add-coins', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { points = 100 } = req.body;

    console.log(`🧪 TEST: Adding ${points} points/coins to user ${userId}`);

    const result = await PointsService.awardPointsAndCoins(
      userId,
      points,
      'Test coins addition'
    );

    res.json({
      success: true,
      data: result,
      message: `Test: Added ${points} points and coins`
    });
  } catch (error) {
    console.error('❌ Test add coins error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

console.log('✅ Enhanced Rewards routes loaded with REAL data integration');
module.exports = router;
