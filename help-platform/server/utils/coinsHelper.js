const User = require('../models/User');
const UserCoins = require('../models/UserCoins');

// Award points and coins together (atomic operation)
async function awardPointsAndCoins(userId, pointsToAdd, reason = 'Points earned', relatedId = null, relatedModel = null) {
  try {
    console.log(`🪙 Awarding ${pointsToAdd} points and coins to user ${userId}`);

    const session = await User.startSession();
    session.startTransaction();

    try {
      // Add points to User (permanent achievement)
      await User.findByIdAndUpdate(
        userId,
        { $inc: { totalPoints: pointsToAdd } },
        { session }
      );

      // Add coins to UserCoins (spendable currency)
      const updatedCoins = await UserCoins.findOneAndUpdate(
        { userId },
        {
          $inc: { 
            totalCoins: pointsToAdd, 
            lifetimeEarned: pointsToAdd 
          },
          $push: {
            transactions: {
              type: 'earned',
              amount: pointsToAdd,
              reason,
              relatedId,
              relatedModel
            }
          },
          $set: { 
            lastSyncDate: new Date(),
            level: UserCoins.calculateLevel(lifetimeEarned + pointsToAdd)
          }
        },
        { upsert: true, new: true, session }
      );

      await session.commitTransaction();
      console.log(`✅ Awarded ${pointsToAdd} points and coins`);
      
      return { points: pointsToAdd, coins: pointsToAdd, newLevel: updatedCoins.level };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('❌ Error awarding points and coins:', error);
    throw error;
  }
}

// Deduct coins for purchases (points remain unchanged)
async function deductCoins(userId, coinsToSpend, reason = 'Reward purchase', relatedId = null) {
  try {
    console.log(`💰 Deducting ${coinsToSpend} coins from user ${userId}`);

    // Check balance first
    const userCoins = await UserCoins.findOne({ userId });
    if (!userCoins || userCoins.totalCoins < coinsToSpend) {
      throw new Error(`Insufficient coins. Available: ${userCoins?.totalCoins || 0}, Required: ${coinsToSpend}`);
    }

    // Deduct coins atomically
    const updatedCoins = await UserCoins.findOneAndUpdate(
      { userId },
      {
        $inc: { 
          totalCoins: -coinsToSpend, 
          lifetimeRedeemed: coinsToSpend 
        },
        $push: {
          transactions: {
            type: 'redeemed',
            amount: -coinsToSpend,
            reason,
            relatedId
          }
        }
      },
      { new: true }
    );

    console.log(`✅ Deducted ${coinsToSpend} coins. Remaining: ${updatedCoins.totalCoins}`);
    return updatedCoins;
  } catch (error) {
    console.error('❌ Error deducting coins:', error);
    throw error;
  }
}

// Get or create user coins
async function getUserCoins(userId) {
  try {
    let userCoins = await UserCoins.findOne({ userId });
    
    if (!userCoins) {
      // Get user's current points and sync
      const user = await User.findById(userId);
      const userPoints = user?.totalPoints || 0;
      
      userCoins = new UserCoins({
        userId,
        totalCoins: userPoints,
        lifetimeEarned: userPoints,
        transactions: userPoints > 0 ? [{
          type: 'sync',
          amount: userPoints,
          reason: `Initial sync with ${userPoints} points`
        }] : [],
        level: UserCoins.calculateLevel(userPoints)
      });
      
      await userCoins.save();
      console.log(`✅ Initialized ${userPoints} coins for user ${userId}`);
    }
    
    return userCoins;
  } catch (error) {
    console.error('❌ Error getting user coins:', error);
    throw error;
  }
}

module.exports = {
  awardPointsAndCoins,
  deductCoins,
  getUserCoins
};
