const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'sync', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  relatedId: {
    type: String, // ✅ Changed from ObjectId to String for flexibility
    default: null
  },
  relatedModel: {
    type: String,
    enum: ['Request', 'Donation', 'Campaign', 'Reward', null],
    default: null
  },
  pointsEquivalent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // ✅ Add timestamps support for transactions
});

const userCoinsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalCoins: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimeEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimeRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [transactionSchema], // ✅ Now supports timestamps
  level: {
    type: String,
    enum: ['Beginner', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Beginner'
  },
  lastSyncDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate user level based on lifetime earned
userCoinsSchema.statics.calculateLevel = function(lifetimeEarned) {
  if (lifetimeEarned >= 10000) return 'Diamond';
  if (lifetimeEarned >= 5000) return 'Platinum';
  if (lifetimeEarned >= 2000) return 'Gold';
  if (lifetimeEarned >= 1000) return 'Silver';
  if (lifetimeEarned >= 500) return 'Bronze';
  return 'Beginner';
};

userCoinsSchema.index({ userId: 1 });
userCoinsSchema.index({ lifetimeEarned: -1 });

module.exports = mongoose.model('UserCoins', userCoinsSchema);
