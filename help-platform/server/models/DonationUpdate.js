const mongoose = require('mongoose');

const DonationUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Healthcare', 'Education', 'Emergency', 'Community', 'Environment', 'Other']
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  beneficiaryCount: {
    type: Number,
    default: 1,
    min: 1
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  deadline: {
    type: Date,
    required: true
  },
  contactInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  progressUpdates: [{
    message: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  donations: [{
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    date: { type: Date, default: Date.now },
    message: String,
    isAnonymous: { type: Boolean, default: false }
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Add indexes for better query performance
DonationUpdateSchema.index({ createdBy: 1 });
DonationUpdateSchema.index({ category: 1 });
DonationUpdateSchema.index({ status: 1 });
DonationUpdateSchema.index({ urgencyLevel: 1 });
DonationUpdateSchema.index({ deadline: 1 });

// Virtual for progress percentage
DonationUpdateSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

// Virtual for remaining amount
DonationUpdateSchema.virtual('remainingAmount').get(function() {
  return this.targetAmount - this.currentAmount;
});

module.exports = mongoose.model('DonationUpdate', DonationUpdateSchema);
