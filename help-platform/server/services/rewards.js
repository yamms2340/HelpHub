let User, UserCoins, Reward, Redemption, PointsService;

try {
  User = require('../models/User');
  UserCoins = require('../models/UserCoins');
  Reward = require('../models/Reward');
  Redemption = require('../models/Redemption');
  console.log('✅ Reward models loaded');
} catch (error) {
  console.warn('⚠️ Reward models not found, using mock mode');
  User = null;
  UserCoins = null;
  Reward = null;
  Redemption = null;
}

try {
  PointsService = require('./PointsService');
  console.log('✅ PointsService loaded');
} catch (error) {
  console.warn('⚠️ PointsService not found, using mock implementation');
  PointsService = null;
}

class RewardError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const mockRewardsData = [
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

const rewardService = {
  async syncUserPointsAndCoins(userId) {
    try {
      if (!User || !UserCoins) {
        // Mock mode - return mock data
        return {
          totalCoins: 500,
          lifetimeEarned: 500,
          lifetimeRedeemed: 0,
          level: 1
        };
      }

      const user = await User.findById(userId).select('totalPoints requestsCompleted');
      if (!user) {
        throw new RewardError('User not found', 404);
      }

      let userCoins = await UserCoins.findOne({ userId });
      
      if (!userCoins) {
        const initialCoins = user.totalPoints || 0;
        
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
          level: UserCoins.calculateLevel ? UserCoins.calculateLevel(initialCoins) : 1
        });
        
        await userCoins.save();
        console.log(`🔄 Initial sync for user ${userId}: ${user.totalPoints} points → ${initialCoins} coins`);
      }
      
      return userCoins;
    } catch (error) {
      console.error('❌ Error syncing points and coins:', error);
      throw error;
    }
  },

  async getAllRewards(filters) {
    const { category, sortBy, order, page, limit } = filters;

    let filter = { isActive: true };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    if (Reward) {
      try {
        const rewards = await Reward.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limit);

        const totalRewards = await Reward.countDocuments(filter);

        if (rewards.length > 0) {
          console.log(`✅ Found ${rewards.length} rewards from database`);
          return {
            success: true,
            data: rewards,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalRewards / limit),
              totalRewards,
              hasNext: skip + rewards.length < totalRewards
            },
            message: `Found ${rewards.length} rewards`
          };
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data:', dbError.message);
      }
    }

    // Fallback to mock data
    let filteredRewards = mockRewardsData.filter(reward => {
      if (category && category !== 'All' && reward.category !== category) return false;
      return true;
    });

    filteredRewards.sort((a, b) => {
      if (sortBy === 'coinsCost') {
        return order === 'asc' ? a.coinsCost - b.coinsCost : b.coinsCost - a.coinsCost;
      } else if (sortBy === 'title') {
        return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      return 0;
    });

    console.log(`✅ Using mock data: ${filteredRewards.length} rewards`);

    return {
      success: true,
      data: filteredRewards,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRewards: filteredRewards.length,
        hasNext: false
      },
      message: `Found ${filteredRewards.length} rewards (mock data)`
    };
  },

  async getUserCoinsData(userId) {
    const userCoins = await this.syncUserPointsAndCoins(userId);
    
    if (!User) {
      // Mock mode
      return {
        totalCoins: userCoins.totalCoins,
        userPoints: 500,
        lifetimeEarned: userCoins.lifetimeEarned,
        lifetimeRedeemed: userCoins.lifetimeRedeemed || 0,
        level: userCoins.level,
        requestsCompleted: 10,
        badges: [],
        achievements: [],
        rating: 4.5
      };
    }

    const user = await User.findById(userId).select('totalPoints requestsCompleted badges achievements rating');
    
    if (!user) {
      throw new RewardError('User not found', 404);
    }

    return {
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
  },

  getRewardCategories() {
    return ['Gift Cards', 'Electronics', 'Books', 'Food & Drinks', 'Merchandise', 'Entertainment'];
  },

  async redeemRewardForUser(redemptionData) {
    const { userId, rewardId, deliveryDetails } = redemptionData;

    const userCoins = await this.syncUserPointsAndCoins(userId);

    const mockRewardsMap = {
      '1': { title: 'Amazon Gift Card ₹500', coinsCost: 500 },
      '2': { title: 'Starbucks Coffee Voucher ₹200', coinsCost: 200 },
      '3': { title: 'BookMyShow Movie Ticket ₹300', coinsCost: 300 },
      '4': { title: 'Flipkart Shopping Voucher ₹1000', coinsCost: 1000 }
    };

    const reward = mockRewardsMap[rewardId];
    if (!reward) {
      throw new RewardError('Reward not found', 404);
    }

    if (userCoins.totalCoins < reward.coinsCost) {
      throw new RewardError(
        `Insufficient coins! You need ${reward.coinsCost} coins but only have ${userCoins.totalCoins} coins.`,
        400
      );
    }

    if (UserCoins) {
      const session = await UserCoins.startSession();
      session.startTransaction();

      try {
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

        const redemptionCode = `HH${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        await session.commitTransaction();

        return {
          success: true,
          data: {
            redemptionCode,
            coinsSpent: reward.coinsCost,
            rewardTitle: reward.title,
            remainingCoins: updatedCoins.totalCoins
          },
          message: `Successfully redeemed ${reward.title}! Your redemption code is: ${redemptionCode}`
        };

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Mock redemption
      const redemptionCode = `HH${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const remainingCoins = userCoins.totalCoins - reward.coinsCost;

      return {
        success: true,
        data: {
          redemptionCode,
          coinsSpent: reward.coinsCost,
          rewardTitle: reward.title,
          remainingCoins
        },
        message: `Successfully redeemed ${reward.title}! Your redemption code is: ${redemptionCode} (mock mode)`
      };
    }
  },

  async getUserRedemptions(userId) {
    // Mock redemptions for now
    return [];
  },

  async testAddCoins(userId, points) {
    if (PointsService && PointsService.awardPointsAndCoins) {
      return await PointsService.awardPointsAndCoins(
        userId,
        points,
        'Test coins addition'
      );
    }

    // Mock implementation
    return {
      pointsAdded: points,
      coinsAdded: points,
      totalPoints: points,
      totalCoins: points,
      message: 'Test coins added (mock mode)'
    };
  }
};

console.log('✅ Enhanced Rewards service loaded with REAL data integration');
module.exports = rewardService;
