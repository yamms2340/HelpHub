const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
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
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Healthcare', 'Education', 'Food & Nutrition', 'Housing', 'Environment', 'Emergency', 'Community', 'Other']
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  // ✅ Enhanced donors array with donation details
  donors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    donorName: {
      type: String,
      required: true,
      trim: true
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionId: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    donatedAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }],
  updates: [{
    title: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  endDate: {
    type: Date
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // ✅ Performance tracking
  metrics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    },
    averageDonation: {
      type: Number,
      default: 0
    },
    lastDonationAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Virtual field for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.round((this.currentAmount / this.targetAmount) * 100 * 100) / 100;
});

// ✅ Virtual field for donor count
campaignSchema.virtual('donorCount').get(function() {
  return this.donors.length;
});

// ✅ Virtual field for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// ✅ Pre-save middleware to update metrics
campaignSchema.pre('save', function(next) {
  if (this.donors.length > 0) {
    // Update average donation
    const totalAmount = this.donors.reduce((sum, donor) => sum + donor.amount, 0);
    this.metrics.averageDonation = Math.round((totalAmount / this.donors.length) * 100) / 100;
    
    // Update last donation time
    const lastDonation = this.donors[this.donors.length - 1];
    if (lastDonation) {
      this.metrics.lastDonationAt = lastDonation.donatedAt;
    }
  }
  next();
});

// ✅ Index for better query performance
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ 'donors.donor': 1 });

module.exports = mongoose.model('Campaign', campaignSchema);