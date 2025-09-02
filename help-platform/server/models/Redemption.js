const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  coinsSpent: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  redemptionCode: {
    type: String,
    required: true,
    unique: true
  },
  deliveryDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

redemptionSchema.index({ userId: 1 });
redemptionSchema.index({ status: 1 });
redemptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
