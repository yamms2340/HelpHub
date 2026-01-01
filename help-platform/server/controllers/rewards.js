const rewardService = require('../services/rewards');

const rewardController = {
  async getAllRewards(req, res) {
    try {
      console.log('🎁 GET /api/rewards called with params:', req.query);
      
      const {
        category,
        sortBy = 'coinsCost',
        order = 'asc',
        page = 1,
        limit = 12
      } = req.query;

      const result = await rewardService.getAllRewards({
        category,
        sortBy,
        order,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(result);

    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rewards'
      });
    }
  },

  async getUserCoins(req, res) {
    try {
      const userId = req.user.id;
      console.log(`🪙 Getting REAL coins data for user: ${userId}`);
      
      const coinsData = await rewardService.getUserCoinsData(userId);
      
      console.log(`📊 REAL user data for ${userId}:`, coinsData);

      res.json({
        success: true,
        data: coinsData,
        message: `User has ${coinsData.totalCoins} coins (synced from ${coinsData.userPoints} points)`
      });
    } catch (error) {
      console.error('❌ Get coins error:', error);
      
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coins: ' + error.message
      });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = rewardService.getRewardCategories();
      
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
  },

  async redeemReward(req, res) {
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

      const redemptionResult = await rewardService.redeemRewardForUser({
        userId,
        rewardId,
        deliveryDetails
      });

      console.log(`✅ Redemption successful: ${redemptionResult.data.redemptionCode}`);
      console.log(`💰 User now has ${redemptionResult.data.remainingCoins} coins (spent ${redemptionResult.data.coinsSpent})`);

      res.json(redemptionResult);

    } catch (error) {
      console.error('❌ Redeem error:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Redemption failed: ' + error.message
      });
    }
  },

  async getUserRedemptions(req, res) {
    try {
      const userId = req.user.id;
      console.log('📦 GET /api/rewards/redemptions called for user:', userId);
      
      const redemptions = await rewardService.getUserRedemptions(userId);
      
      res.json({
        success: true,
        data: redemptions,
        message: `Found ${redemptions.length} redemptions`
      });
    } catch (error) {
      console.error('❌ Error fetching redemptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch redemptions'
      });
    }
  },

  async testAddCoins(req, res) {
    try {
      const userId = req.user.id;
      const { points = 100 } = req.body;

      console.log(`🧪 TEST: Adding ${points} points/coins to user ${userId}`);

      const result = await rewardService.testAddCoins(userId, points);

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
  }
};

console.log('✅ Enhanced Rewards controller loaded with REAL data integration');
module.exports = rewardController;
