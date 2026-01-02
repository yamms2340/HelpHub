const User = require('../models/User');
const UserScore = require('../models/UserScore');
const UserCoins = require('../models/UserCoins');

class PointsService {
  // 🎯 DEFINE CONVERSION RATE (1 point = 1 coin)
  static POINTS_TO_COINS_RATIO = 1;

  static calculateBasePoints(category, urgency) {
    const categoryPoints = {
      'Technology': 80,
      'Education': 70,
      'Transportation': 60,
      'Food': 50,
      'Health': 100,
      'Household': 60,
      'Other': 50
    };

    const urgencyMultiplier = {
      'Low': 1,
      'Medium': 1.2,
      'High': 1.5,
      'Critical': 2
    };

    const base = categoryPoints[category] || 50;
    return Math.round(base * (urgencyMultiplier[urgency] || 1));
  }

  static calculateBonusPoints(rating, completedEarly) {
    let bonus = 0;
    
    if (rating === 5) bonus += 25;
    else if (rating === 4) bonus += 15;
    
    if (completedEarly) bonus += 15;
    
    return bonus;
  }

  // 🔥 MAIN FUNCTION: Award points AND coins together (atomic operation)
  static async awardPointsAndCoins(userId, pointsToAdd, reason = 'Points earned', relatedId = null, relatedModel = null) {
    try {
      console.log(`🪙 Awarding ${pointsToAdd} points and coins to user ${userId}`);

      const session = await User.startSession();
      session.startTransaction();

      try {
        // 1. Add points to User (permanent achievement)
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $inc: { totalPoints: pointsToAdd } },
          { session, new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        // 2. Calculate coins from points (1:1 ratio)
        const coinsToAdd = Math.floor(pointsToAdd * this.POINTS_TO_COINS_RATIO);

        // 3. Add coins to UserCoins (spendable currency)
        const updatedCoins = await UserCoins.findOneAndUpdate(
          { userId },
          {
            $inc: { 
              totalCoins: coinsToAdd, 
              lifetimeEarned: coinsToAdd 
            },
            $push: {
              transactions: {
                type: 'earned',
                amount: coinsToAdd,
                reason,
                relatedId,
                relatedModel,
                pointsEquivalent: pointsToAdd
              }
            },
            $set: { lastSyncDate: new Date() }
          },
          { upsert: true, new: true, session }
        );

        // 4. Update level based on lifetime earned
        const newLevel = UserCoins.calculateLevel(updatedCoins.lifetimeEarned);
        if (newLevel !== updatedCoins.level) {
          await UserCoins.findByIdAndUpdate(
            updatedCoins._id,
            { level: newLevel },
            { session }
          );
        }

        await session.commitTransaction();
        console.log(`✅ Awarded ${pointsToAdd} points + ${coinsToAdd} coins`);
        console.log(`📊 User now has ${updatedUser.totalPoints} points, ${updatedCoins.totalCoins} coins`);
        
        return { 
          points: pointsToAdd, 
          coins: coinsToAdd, 
          totalPoints: updatedUser.totalPoints,
          totalCoins: updatedCoins.totalCoins,
          newLevel 
        };
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

  static async awardPoints(userId, requestData, completionData) {
    try {
      const basePoints = this.calculateBasePoints(requestData.category, requestData.urgency);
      const bonusPoints = this.calculateBonusPoints(
        completionData.rating, 
        completionData.completedEarly
      );
      const totalPoints = basePoints + bonusPoints;

      // Create score record
      const userScore = new UserScore({
        userId,
        requestId: requestData.id,
        points: basePoints,
        bonusPoints,
        category: requestData.category,
        urgency: requestData.urgency,
        rating: completionData.rating,
        completedEarly: completionData.completedEarly
      });

      await userScore.save();

      // Get current date info for monthly/weekly reset logic
      const now = new Date();
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if we need to reset monthly/weekly points
      const lastReset = user.lastPointsReset || new Date();
      const needsMonthlyReset = now.getMonth() !== lastReset.getMonth() || 
                               now.getFullYear() !== lastReset.getFullYear();
      const needsWeeklyReset = this.getWeekNumber(now) !== this.getWeekNumber(lastReset);

      let updateData = {
        $inc: {
          requestsCompleted: 1,
          helpCount: 1
        }
      };

      // Reset monthly/weekly points if needed
      if (needsMonthlyReset) {
        updateData.monthlyPoints = totalPoints;
      } else {
        updateData.$inc = { ...updateData.$inc, monthlyPoints: totalPoints };
      }

      if (needsWeeklyReset) {
        updateData.weeklyPoints = totalPoints;
      } else {
        updateData.$inc = { ...updateData.$inc, weeklyPoints: totalPoints };
      }

      if (needsMonthlyReset || needsWeeklyReset) {
        updateData.lastPointsReset = now;
      }

      // Update user stats (without totalPoints - handled by awardPointsAndCoins)
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

      // 🔥 AWARD POINTS AND COINS TOGETHER
      const coinsResult = await this.awardPointsAndCoins(
        userId,
        totalPoints,
        `Completed ${requestData.category} request`,
        requestData.id,
        'Request'
      );

      // Update rating if provided
      if (completionData.rating) {
        const newTotalRatings = (updatedUser.totalRatings || 0) + 1;
        const currentRating = updatedUser.rating || 0;
        const newAverageRating = ((currentRating * (updatedUser.totalRatings || 0)) + completionData.rating) / newTotalRatings;
        
        await User.findByIdAndUpdate(userId, {
          rating: Math.round(newAverageRating * 10) / 10,
          totalRatings: newTotalRatings
        });
      }

      // Check for new badges/achievements
      const finalUser = await User.findById(userId);
      const newBadges = await this.checkForNewBadges(finalUser);
      const newAchievements = await this.checkForNewAchievements(finalUser);

      // Update user with new badges/achievements
      if (newBadges.length > 0 || newAchievements.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            badges: { $each: newBadges },
            achievements: { $each: newAchievements }
          }
        });
      }

      return {
        points: totalPoints,
        coins: coinsResult.coins,
        totalPoints: coinsResult.totalPoints,
        totalCoins: coinsResult.totalCoins,
        badges: newBadges,
        achievements: newAchievements,
        level: coinsResult.newLevel
      };

    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  static getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  static async checkForNewBadges(user) {
    const badges = [];
    const existingBadgeNames = user.badges?.map(b => b.name) || [];

    if (user.requestsCompleted >= 1 && !existingBadgeNames.includes('First Helper')) {
      badges.push({ name: 'First Helper', icon: '🎯' });
    }
    if (user.requestsCompleted >= 5 && !existingBadgeNames.includes('Regular Helper')) {
      badges.push({ name: 'Regular Helper', icon: '⭐' });
    }
    if (user.requestsCompleted >= 10 && !existingBadgeNames.includes('Super Helper')) {
      badges.push({ name: 'Super Helper', icon: '🚀' });
    }
    if (user.requestsCompleted >= 25 && !existingBadgeNames.includes('Helper Pro')) {
      badges.push({ name: 'Helper Pro', icon: '💎' });
    }
    if (user.totalPoints >= 1000 && !existingBadgeNames.includes('Point Master')) {
      badges.push({ name: 'Point Master', icon: '👑' });
    }
    if (user.rating >= 4.5 && user.totalRatings >= 5 && !existingBadgeNames.includes('Highly Rated')) {
      badges.push({ name: 'Highly Rated', icon: '⭐⭐⭐⭐⭐' });
    }

    return badges;
  }

  static async checkForNewAchievements(user) {
    const achievements = [];
    const existingAchievementNames = user.achievements?.map(a => a.name) || [];

    if (user.requestsCompleted >= 1 && !existingAchievementNames.includes('First Help')) {
      achievements.push({ name: 'First Help', icon: '🎯', points: 25 });
    }
    if (user.requestsCompleted >= 5 && !existingAchievementNames.includes('Helper Streak')) {
      achievements.push({ name: 'Helper Streak', icon: '🔥', points: 50 });
    }
    if (user.requestsCompleted >= 10 && !existingAchievementNames.includes('Community Champion')) {
      achievements.push({ name: 'Community Champion', icon: '🏆', points: 100 });
    }

    return achievements;
  }
}

module.exports = PointsService;
