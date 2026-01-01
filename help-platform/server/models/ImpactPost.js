const mongoose = require('mongoose');

const impactPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters'],
    minLength: [3, 'Title must be at least 3 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Healthcare', 'Education', 'Food & Nutrition', 'Housing', 'Environment', 'Community', 'Emergency', 'User Story', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  beneficiaries: {
    type: Number,
    default: 0,
    min: [0, 'Beneficiaries cannot be negative'],
    max: [10000, 'Beneficiaries seems too high, please verify']
  },
  amount: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative'],
    max: [10000000, 'Amount seems too high, please verify']
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true,
    maxLength: [2000, 'Details cannot exceed 2000 characters'],
    minLength: [10, 'Details must be at least 10 characters']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  authorName: {
    type: String,
    trim: true,
    default: 'Anonymous',
    maxLength: [100, 'Author name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'pending', 'archived', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  location: {
    type: String,
    trim: true,
    maxLength: [200, 'Location cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [50, 'Tag cannot exceed 50 characters']
  }],
  images: [{
    url: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      maxLength: [200, 'Image caption cannot exceed 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxLength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Virtual fields
impactPostSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

impactPostSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

impactPostSchema.virtual('isRecent').get(function() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return this.createdAt > weekAgo;
});

// ✅ Indexes for performance
impactPostSchema.index({ status: 1, createdAt: -1 });
impactPostSchema.index({ category: 1, status: 1 });
impactPostSchema.index({ authorId: 1, status: 1 });
impactPostSchema.index({ isVerified: 1, status: 1 });
impactPostSchema.index({ createdAt: -1 });
impactPostSchema.index({ title: 'text', details: 'text' }, { 
  name: 'text_search_index',
  weights: { title: 10, details: 5 }
});

// ✅ Pre-save middleware
impactPostSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'active') {
    this.moderatedAt = new Date();
  }
  
  if (this.tags) {
    this.tags = this.tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10);
  }
  
  next();
});

// ✅ Static methods
impactPostSchema.statics.getVerifiedPosts = function(limit = 10) {
  return this.find({ 
    status: 'active', 
    isVerified: true 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('authorId', 'name email');
};

impactPostSchema.statics.getRecentPosts = function(days = 7, limit = 20) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    status: 'active',
    createdAt: { $gte: dateThreshold }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('authorId', 'name email');
};

impactPostSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalBeneficiaries: { $sum: '$beneficiaries' }
      } 
    },
    { $sort: { count: -1 } }
  ]);
};

// ✅ Instance methods
impactPostSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

impactPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

impactPostSchema.methods.toggleLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  return this.save();
};

module.exports = mongoose.model('ImpactPost', impactPostSchema);
