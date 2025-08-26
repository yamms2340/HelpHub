const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  // Legacy field (keep for backwards compatibility)
  helpCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // ✅ NEW LEADERBOARD FIELDS
  totalPoints: {
    type: Number,
    default: 0
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  weeklyPoints: {
    type: Number,
    default: 0
  },
  requestsCompleted: {
    type: Number,
    default: 0
  },
  requestsCreated: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  achievements: [{
    name: String,
    icon: String,
    points: Number,
    earnedAt: { type: Date, default: Date.now }
  }],
  lastPointsReset: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient leaderboard queries
userSchema.index({ totalPoints: -1 });
userSchema.index({ monthlyPoints: -1 });
userSchema.index({ weeklyPoints: -1 });

module.exports = mongoose.model('User', userSchema);
