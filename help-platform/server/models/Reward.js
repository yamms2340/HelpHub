const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Gift Cards', 'Electronics', 'Books', 'Food & Drinks', 'Merchandise', 'Experiences', 'Other']
  },
  coinsCost: {
    type: Number,
    required: true,
    min: 1
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Reward'
  },
  availability: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRedeemed: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  terms: {
    type: String,
    default: 'Standard terms and conditions apply'
  },
  validUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

rewardSchema.index({ category: 1 });
rewardSchema.index({ coinsCost: 1 });
rewardSchema.index({ isActive: 1 });
rewardSchema.index({ isFeatured: -1 });

module.exports = mongoose.model('Reward', rewardSchema);
