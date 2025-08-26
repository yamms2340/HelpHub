const mongoose = require('mongoose');

const userScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  bonusPoints: {
    type: Number,
    default: 0
  },
  completedEarly: {
    type: Boolean,
    default: false
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient leaderboard queries
userScoreSchema.index({ userId: 1, earnedAt: -1 });
userScoreSchema.index({ earnedAt: -1 });

module.exports = mongoose.model('UserScore', userScoreSchema);
