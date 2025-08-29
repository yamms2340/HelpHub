const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Create Story Schema and Model
const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  impact: String,
  helpType: [String],
  helper: {
    type: String,
    default: 'Anonymous'
  },
  authorName: String,
  location: {
    type: String,
    default: 'Unknown'
  },
  image: String,
  rating: {
    type: Number,
    default: 4.5
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
  achievements: [String],
  awards: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Story = mongoose.model('Story', storySchema);

// GET /api/stories/inspiring-stories - Fetch approved stories from MongoDB
router.get('/inspiring-stories', async (req, res) => {
  try {
    console.log('✅ GET /api/stories/inspiring-stories called');
    
    const limit = parseInt(req.query.limit) || 20;
    
    const stories = await Story.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`✅ Found ${stories.length} stories`);
    
    // Transform to match frontend expected format
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
      image: getCategoryEmoji(story.category),
      rating: story.rating || 4.5,
      verified: story.verified || false,
      likes: story.likes || 0,
      views: story.views || 0,
      achievements: story.achievements || [],
      awards: story.awards || [],
      createdAt: story.createdAt,
      date: story.createdAt
    }));
    
    res.json({ 
      success: true,
      data: formattedStories,
      count: formattedStories.length,
      message: 'Inspiring stories retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching inspiring stories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch stories',
      message: error.message
    });
  }
});

// GET /api/stories - Get all hall of fame entries (alias)
router.get('/', async (req, res) => {
  try {
    console.log('✅ GET /api/stories called (hall of fame)');
    
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
      imageUrl: getCategoryEmoji(story.category),
      date: story.createdAt,
      verified: story.verified || false,
      story: story.description,
      achievements: story.achievements || [],
      awards: story.awards || [],
      likes: story.likes || 0,
      views: story.views || 0
    }));

    res.json({
      success: true,
      data: hallOfFameEntries,
      count: hallOfFameEntries.length,
      message: 'Hall of Fame entries retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching hall of fame:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hall of fame entries',
      message: error.message
    });
  }
});

// GET /api/stories/stats - Get hall of fame stats
router.get('/stats', async (req, res) => {
  try {
    console.log('✅ GET /api/stories/stats called');
    
    const totalStories = await Story.countDocuments({ approved: true });
    const verifiedStories = await Story.countDocuments({ approved: true, verified: true });
    const pendingStories = await Story.countDocuments({ approved: false });
    
    // Get category breakdown
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

    res.json({
      success: true,
      data: stats,
      message: 'Stats retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// POST /api/stories/submit - Submit new story to MongoDB
router.post('/submit', async (req, res) => {
  try {
    console.log('✅ POST /api/stories/submit called');
    console.log('Request body:', req.body);
    
    const { title, description, category, impact, helpType, helper, location, authorName } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, description, and category are required',
        message: 'Missing required fields'
      });
    }

    const newStory = new Story({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      impact: impact || 'Positive community impact',
      helpType: Array.isArray(helpType) ? helpType : [helpType].filter(Boolean),
      helper: helper || authorName || 'Anonymous',
      authorName: authorName || helper || 'Anonymous',
      location: location || 'Unknown',
      image: getCategoryEmoji(category),
      rating: 4.5,
      approved: true,
      verified: false,
      likes: 0,
      views: 0
    });

    const savedStory = await newStory.save();
    console.log('✅ Story saved to MongoDB:', savedStory.title);
    
    res.status(201).json({
      success: true,
      message: 'Story submitted successfully!',
      data: {
        id: savedStory._id,
        title: savedStory.title,
        category: savedStory.category,
        helper: savedStory.helper,
        createdAt: savedStory.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error saving story:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit story',
      message: error.message
    });
  }
});

// POST /api/stories/submit-story - Alias for submit (compatibility)
router.post('/submit-story', (req, res) => {
  console.log('🔀 Redirecting submit-story to submit');
  req.url = '/submit';
  router.handle(req, res);
});

// GET /api/stories/:id - Get specific story by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ GET /api/stories/${id} called`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story ID format'
      });
    }

    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Increment view count
    await Story.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const formattedStory = {
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
      imageUrl: getCategoryEmoji(story.category),
      date: story.createdAt,
      verified: story.verified,
      awards: story.awards || [],
      likes: story.views + 1,
      views: story.views + 1,
      rating: story.rating
    };

    res.json({
      success: true,
      data: formattedStory,
      message: 'Story retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve story',
      error: error.message
    });
  }
});

// Helper function to get emoji by category
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

module.exports = router;
