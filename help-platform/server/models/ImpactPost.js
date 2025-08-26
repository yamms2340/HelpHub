const mongoose = require('mongoose');

const impactPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['Healthcare', 'Education', 'Food & Nutrition', 'Housing', 'Environment', 'Empowerment', 'User Story']
  },
  beneficiaries: {
    type: Number,
    default: 0,
    min: 0
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  },
  details: {
    type: String,
    required: true,
    maxLength: 1000
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'pending', 'archived'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ImpactPost', impactPostSchema);
