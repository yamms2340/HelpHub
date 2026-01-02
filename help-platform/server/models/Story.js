const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
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
    enum: ['Tech Support', 'Senior Care', 'Mental Health', 'Community Building', 
           'Emergency Response', 'Education', 'Home Repairs', 'Transportation']
  },
  impact: {
    type: String,
    default: ''
  },
  helpType: [{
    type: String,
    enum: ['One-time Help', 'Ongoing Support', 'Emergency Response', 
           'Skill Sharing', 'Community Project']
  }],
  helper: {
    type: String,
    default: 'Anonymous'
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  // Image handling fields
  image: {
    type: String,
    default: null // Will store the image path or emoji
  },
  imageUrl: {
    type: String,
    default: null // Alternative field for image URL
  },
  hasCustomImage: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  approved: {
    type: Boolean,
    default: true
  },
  verified: {
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
  },
  achievements: [{
    type: String
  }],
  awards: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Helper method to get category emoji
storySchema.methods.getCategoryEmoji = function() {
  const emojiMap = {
    'Tech Support': '👩‍💻',
    'Senior Care': '👴',
    'Mental Health': '🧠',
    'Community Building': '🏘️',
    'Emergency Response': '🚨',
    'Education': '📚',
    'Home Repairs': '🔧',
    'Transportation': '🚗'
  };
  return emojiMap[this.category] || '📖';
};

// Get display image (custom image or emoji fallback)
storySchema.methods.getDisplayImage = function() {
  if (this.hasCustomImage && (this.image || this.imageUrl)) {
    return this.image || this.imageUrl;
  }
  return this.getCategoryEmoji();
};

// Set emoji before saving if no custom image
storySchema.pre('save', function(next) {
  if (this.isNew && !this.hasCustomImage) {
    this.image = this.getCategoryEmoji();
  }
  next();
});

module.exports = mongoose.model('Story', storySchema);
