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
  location: {
    type: String,
    default: 'Unknown'
  },
  image: {
    type: String,
    default: '📖'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  approved: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Helper function to assign emoji based on category
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

// Set emoji before saving
storySchema.pre('save', function(next) {
  if (this.isNew) {
    this.image = this.getCategoryEmoji();
  }
  next();
});

module.exports = mongoose.model('Story', storySchema);
