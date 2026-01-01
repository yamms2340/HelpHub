const mongoose = require('mongoose');
const fs = require('fs');
const cacheService = require('./cache');

// Story Schema
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
  image: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Story = mongoose.model('Story', storySchema);

class StoryError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Helper function
function getCategoryEmoji(category) {
  const emojiMap = {
    'Tech Support': '👩‍💻',
    'Senior Care': '👴',
    'Mental Health': '🧠',
    'Community Building': '🏘️',
    'Emergency Response': '🚨',
    'Education': '📚',
    'Healthcare': '🏥',
    'Home Repairs': '🔧',
    'Transportation': '🚗',
    'Environment': '🌱',
    'Food & Nutrition': '🍎',
    'Housing': '🏠',
    'Empowerment': '💪'
  };
  return emojiMap[category] || '📖';
}

const storyService = {
  async getInspiringStories(limit = 20) {
    const cacheKey = `stories:inspiring:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Stories served from cache');
      return cached;
    }
    
    const stories = await Story.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`✅ Found ${stories.length} stories`);
    
    const formattedStories = stories.map(story => ({
      id: story._id,
      title: story.title,
      description: story.description,
      summary: story.description ? story.description.substring(0, 150) + '...' : '',
      fullStory: story.description,
      category: story.category,
      impact: story.impact || 'Positive impact',
      helpType: story.helpType || [],
      helper: story.helper,
      authorName: story.authorName || story.helper,
      location: story.location,
      image: story.hasCustomImage ? story.image || story.imageUrl : getCategoryEmoji(story.category),
      imageUrl: story.hasCustomImage ? story.image || story.imageUrl : getCategoryEmoji(story.category),
      hasCustomImage: story.hasCustomImage || false,
      rating: story.rating || 4.5,
      verified: story.verified || false,
      likes: story.likes || 0,
      views: story.views || 0,
      achievements: story.achievements || [],
      awards: story.awards || [],
      createdAt: story.createdAt,
      date: story.createdAt
    }));
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, formattedStories, 300);
    
    return formattedStories;
  },

  async getAllStories() {
    const cacheKey = 'stories:all';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const stories = await Story.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const hallOfFameEntries = stories.map(story => ({
      id: story._id,
      name: story.helper || story.authorName || 'Anonymous Hero',
      title: story.title,
      description: story.description,
      category: story.category,
      impact: story.impact,
      imageUrl: story.hasCustomImage ? story.image || story.imageUrl : getCategoryEmoji(story.category),
      date: story.createdAt,
      verified: story.verified || false,
      story: story.description,
      achievements: story.achievements || [],
      awards: story.awards || [],
      likes: story.likes || 0,
      views: story.views || 0,
      hasCustomImage: story.hasCustomImage || false
    }));
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, hallOfFameEntries, 300);
    
    return hallOfFameEntries;
  },

  async getStats() {
    const cacheKey = 'stories:stats';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const totalStories = await Story.countDocuments({ approved: true });
    const verifiedStories = await Story.countDocuments({ approved: true, verified: true });
    const pendingStories = await Story.countDocuments({ approved: false });
    
    const categories = await Story.aggregate([
      { $match: { approved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const categoryBreakdown = {};
    categories.forEach(cat => {
      categoryBreakdown[cat._id.toLowerCase().replace(' ', '')] = cat.count;
    });

    const stats = {
      totalHeroes: totalStories,
      totalImpact: `${totalStories * 50}+ lives`,
      categories: categoryBreakdown,
      recentlyAdded: pendingStories,
      verificationsComplete: verifiedStories,
      pendingReview: pendingStories,
      monthlyGrowth: '+12%'
    };
    
    // Cache for 10 minutes
    await cacheService.set(cacheKey, stats, 600);
    
    return stats;
  },

  async submitStory(storyData) {
    const { title, description, category, impact, helpType, helper, location, authorName, imageUrl, file } = storyData;
    
    // Validate required fields
    if (!title || !description || !category) {
      // Clean up file if validation fails
      if (file) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('File cleanup error:', err);
        }
      }
      throw new StoryError('Title, description, and category are required', 400);
    }

    // Handle image
    let finalImage = null;
    let hasCustomImage = false;
    
    if (file) {
      finalImage = `/uploads/stories/${file.filename}`;
      hasCustomImage = true;
      console.log('✅ Image uploaded to:', finalImage);
    } else if (imageUrl && imageUrl.trim()) {
      finalImage = imageUrl.trim();
      hasCustomImage = true;
      console.log('✅ Using provided image URL:', finalImage);
    } else {
      finalImage = getCategoryEmoji(category);
      hasCustomImage = false;
      console.log('✅ Using category emoji:', finalImage);
    }
    
    // Parse helpType
    let parsedHelpType = [];
    if (helpType) {
      try {
        parsedHelpType = typeof helpType === 'string' ? JSON.parse(helpType) : helpType;
        if (!Array.isArray(parsedHelpType)) {
          parsedHelpType = [parsedHelpType].filter(Boolean);
        }
      } catch (parseError) {
        parsedHelpType = [helpType].filter(Boolean);
      }
    }
    
    // Create story
    const newStory = new Story({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      impact: impact || 'Positive community impact',
      helpType: parsedHelpType,
      helper: helper || authorName || 'Anonymous',
      authorName: authorName || helper || 'Anonymous',
      location: location || 'Unknown',
      image: finalImage,
      imageUrl: hasCustomImage ? finalImage : null,
      hasCustomImage: hasCustomImage,
      rating: 4.5,
      approved: true,
      verified: false,
      likes: 0,
      views: 0
    });

    const savedStory = await newStory.save();
    console.log('✅ Story saved to MongoDB:', savedStory.title);
    
    // Invalidate caches
    await cacheService.del('stories:inspiring:20');
    await cacheService.del('stories:all');
    await cacheService.del('stories:stats');
    
    return {
      id: savedStory._id,
      title: savedStory.title,
      category: savedStory.category,
      helper: savedStory.helper,
      image: savedStory.image,
      imageUrl: savedStory.imageUrl,
      hasCustomImage: savedStory.hasCustomImage,
      createdAt: savedStory.createdAt
    };
  },

  async getStoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new StoryError('Invalid story ID format', 400);
    }

    const story = await Story.findById(id);
    
    if (!story) {
      throw new StoryError('Story not found', 404);
    }

    // Increment view count
    await Story.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return {
      id: story._id,
      name: story.helper || story.authorName,
      title: story.title,
      description: story.description,
      fullStory: story.description,
      category: story.category,
      impact: story.impact,
      achievements: story.achievements || [],
      helpType: story.helpType || [],
      helper: story.helper,
      location: story.location,
      imageUrl: story.hasCustomImage ? story.image || story.imageUrl : getCategoryEmoji(story.category),
      date: story.createdAt,
      verified: story.verified,
      awards: story.awards || [],
      likes: story.views + 1,
      views: story.views + 1,
      rating: story.rating,
      hasCustomImage: story.hasCustomImage
    };
  }
};

module.exports = storyService;
