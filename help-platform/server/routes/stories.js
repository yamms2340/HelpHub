const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cacheService = require('../services/cache');

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
  imageUrl: String, // ✅ For uploaded images
  hasCustomImage: { type: Boolean, default: false }, // ✅ Flag for custom images
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

// ==================== GET INSPIRING STORIES ====================
router.get('/inspiring-stories', async (req, res) => {
  try {
    console.log('✅ GET /api/stories/inspiring-stories called');
    
    const { 
      limit = 20, 
      category, 
      verified, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const cacheKey = `stories:inspiring:${category || 'all'}:${verified || 'all'}:${sortBy}:${sortOrder}:limit${limit}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Inspiring stories served from cache');
      return res.json({ 
        success: true,
        data: cached.data,
        count: cached.count,
        message: 'Inspiring stories retrieved successfully (cached)'
      });
    }

    const filter = { approved: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const stories = await Story.find(filter)
      .sort(sort)
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${stories.length} stories from DB`);
    
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
      imageUrl: story.imageUrl || null, // ✅ Include uploaded image URL
      hasCustomImage: story.hasCustomImage || false, // ✅ Include flag
      rating: story.rating || 4.5,
      verified: story.verified || false,
      likes: story.likes || 0,
      views: story.views || 0,
      achievements: story.achievements || [],
      awards: story.awards || [],
      createdAt: story.createdAt,
      date: story.createdAt
    }));

    const result = {
      data: formattedStories,
      count: formattedStories.length
    };

    await cacheService.set(cacheKey, result, 300);
    
    res.json({ 
      success: true,
      data: result.data,
      count: result.count,
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

// ==================== GET HALL OF FAME ====================
router.get('/', async (req, res) => {
  try {
    console.log('✅ GET /api/stories called (hall of fame)');
    
    const { limit = 50, category, verified } = req.query;

    const cacheKey = `stories:halloffame:${category || 'all'}:${verified || 'all'}:limit${limit}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Hall of fame served from cache');
      return res.json({
        success: true,
        data: cached.data,
        count: cached.count,
        message: 'Hall of Fame entries retrieved successfully (cached)'
      });
    }

    const filter = { approved: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
    
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const hallOfFameEntries = stories.map(story => ({
      id: story._id,
      name: story.helper || story.authorName || 'Anonymous Hero',
      title: story.title,
      description: story.description,
      category: story.category,
      impact: story.impact,
      imageUrl: story.imageUrl || getCategoryEmoji(story.category),
      hasCustomImage: story.hasCustomImage || false,
      date: story.createdAt,
      verified: story.verified || false,
      story: story.description,
      achievements: story.achievements || [],
      awards: story.awards || [],
      likes: story.likes || 0,
      views: story.views || 0
    }));

    const result = {
      data: hallOfFameEntries,
      count: hallOfFameEntries.length
    };

    console.log(`✅ Found ${hallOfFameEntries.length} hall of fame entries`);

    await cacheService.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result.data,
      count: result.count,
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

// ==================== GET STATISTICS ====================
router.get('/stats', async (req, res) => {
  try {
    console.log('✅ GET /api/stories/stats called');

    const cacheKey = 'stories:stats';

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Story stats served from cache');
      return res.json({
        success: true,
        data: cached,
        message: 'Stats retrieved successfully (cached)'
      });
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
      categoryBreakdown[cat._id.toLowerCase().replace(/\s+/g, '')] = cat.count;
    });

    const engagement = await Story.aggregate([
      { $match: { approved: true } },
      { 
        $group: { 
          _id: null, 
          totalViews: { $sum: '$views' }, 
          totalLikes: { $sum: '$likes' } 
        } 
      }
    ]);

    const stats = {
      totalHeroes: totalStories,
      totalImpact: `${totalStories * 50}+ lives`,
      totalViews: engagement[0]?.totalViews || 0,
      totalLikes: engagement[0]?.totalLikes || 0,
      categories: categoryBreakdown,
      recentlyAdded: pendingStories,
      verificationsComplete: verifiedStories,
      pendingReview: pendingStories,
      monthlyGrowth: '+12%',
      averageRating: 4.5
    };

    console.log('✅ Story stats calculated');

    await cacheService.set(cacheKey, stats, 180);

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

// ==================== SUBMIT NEW STORY (FIXED WITH DEBUGGING) ====================
router.post('/submit', async (req, res) => {
  try {
    console.log('✅ POST /api/stories/submit called');
    console.log('🔍 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Request headers:', req.headers);
    
    const { 
      title, 
      description, 
      category,
      categoryName, // Alternative field names
      selectedCategory,
      impact, 
      impactAchieved,
      helpType, 
      typeOfHelp,
      helper, 
      yourName,
      location, 
      authorName,
      imageUrl // For uploaded images
    } = req.body;
    
    // ✅ FLEXIBLE CATEGORY DETECTION
    const finalCategory = category || categoryName || selectedCategory;
    
    console.log('🔍 Category detection:', {
      category,
      categoryName,
      selectedCategory,
      finalCategory
    });
    
    // Validation
    if (!finalCategory || finalCategory === '' || finalCategory === 'Select Category') {
      console.error('❌ Category validation failed');
      console.error('   Received category:', finalCategory);
      console.error('   All request keys:', Object.keys(req.body));
      console.error('   Full body:', req.body);
      
      return res.status(400).json({ 
        success: false,
        error: 'Category is required',
        message: 'Please select a category',
        debug: {
          receivedCategory: finalCategory,
          receivedKeys: Object.keys(req.body),
          bodyPreview: req.body
        }
      });
    }

    // ✅ FLEXIBLE FIELD MAPPING
    const finalHelper = helper || yourName || authorName || 'Anonymous';
    const finalImpact = impact || impactAchieved;
    const finalHelpType = helpType || typeOfHelp;

    // ✅ AUTO-GENERATE TITLE if not provided
    const finalTitle = title?.trim() || 
                      `${finalCategory} Help by ${finalHelper}`;

    // ✅ AUTO-GENERATE DESCRIPTION if not provided
    const finalDescription = description?.trim() || 
                            `${finalHelper} provided ${finalCategory} support${location ? ` in ${location}` : ''}. ${finalImpact ? `Impact: ${finalImpact} people helped.` : 'Making a positive difference in the community.'}`;

    console.log('📝 Creating story with:', {
      title: finalTitle,
      category: finalCategory,
      helper: finalHelper,
      hasImage: !!imageUrl
    });

    const newStory = new Story({
      title: finalTitle,
      description: finalDescription,
      category: finalCategory.trim(),
      impact: finalImpact ? `${finalImpact} people helped` : 'Positive community impact',
      helpType: Array.isArray(finalHelpType) ? finalHelpType : [finalHelpType].filter(Boolean),
      helper: finalHelper,
      authorName: finalHelper,
      location: location || 'Unknown',
      image: getCategoryEmoji(finalCategory),
      imageUrl: imageUrl || null, // ✅ Store uploaded image URL
      hasCustomImage: !!imageUrl, // ✅ Set flag if image provided
      rating: 4.5,
      approved: true,
      verified: false,
      likes: 0,
      views: 0
    });

    const savedStory = await newStory.save();
    console.log('✅ Story saved to MongoDB:', savedStory.title);

    await cacheService.delPattern('stories:*');
    await cacheService.delPattern('help:inspiring-stories*');
    console.log('🗑️ Story caches invalidated after submission');
    
    res.status(201).json({
      success: true,
      message: 'Story submitted successfully! 🎉',
      data: {
        id: savedStory._id,
        title: savedStory.title,
        description: savedStory.description,
        category: savedStory.category,
        helper: savedStory.helper,
        impact: savedStory.impact,
        imageUrl: savedStory.imageUrl,
        hasCustomImage: savedStory.hasCustomImage,
        createdAt: savedStory.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error saving story:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit story',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ==================== SUBMIT STORY (ALIAS) ====================
router.post('/submit-story', async (req, res) => {
  console.log('🔀 Redirecting submit-story to submit');
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      title, 
      description, 
      category,
      categoryName,
      selectedCategory,
      impact, 
      impactAchieved,
      helpType, 
      typeOfHelp,
      helper, 
      yourName,
      location, 
      authorName,
      imageUrl
    } = req.body;
    
    const finalCategory = category || categoryName || selectedCategory;
    
    if (!finalCategory || finalCategory === '' || finalCategory === 'Select Category') {
      console.error('❌ Category validation failed in alias route');
      return res.status(400).json({ 
        success: false,
        error: 'Category is required',
        message: 'Please select a category',
        debug: {
          receivedCategory: finalCategory,
          bodyKeys: Object.keys(req.body)
        }
      });
    }

    const finalHelper = helper || yourName || authorName || 'Anonymous';
    const finalImpact = impact || impactAchieved;
    const finalHelpType = helpType || typeOfHelp;

    const finalTitle = title?.trim() || 
                      `${finalCategory} Help by ${finalHelper}`;

    const finalDescription = description?.trim() || 
                            `${finalHelper} provided ${finalCategory} support${location ? ` in ${location}` : ''}. ${finalImpact ? `Impact: ${finalImpact} people helped.` : 'Making a positive difference in the community.'}`;

    const newStory = new Story({
      title: finalTitle,
      description: finalDescription,
      category: finalCategory.trim(),
      impact: finalImpact ? `${finalImpact} people helped` : 'Positive community impact',
      helpType: Array.isArray(finalHelpType) ? finalHelpType : [finalHelpType].filter(Boolean),
      helper: finalHelper,
      authorName: finalHelper,
      location: location || 'Unknown',
      image: getCategoryEmoji(finalCategory),
      imageUrl: imageUrl || null,
      hasCustomImage: !!imageUrl,
      rating: 4.5,
      approved: true,
      verified: false,
      likes: 0,
      views: 0
    });

    const savedStory = await newStory.save();
    
    await cacheService.delPattern('stories:*');
    await cacheService.delPattern('help:inspiring-stories*');
    console.log('🗑️ Story caches invalidated after submission (alias)');
    
    res.status(201).json({
      success: true,
      message: 'Story submitted successfully! 🎉',
      data: {
        id: savedStory._id,
        title: savedStory.title,
        description: savedStory.description,
        category: savedStory.category,
        helper: savedStory.helper,
        impact: savedStory.impact,
        imageUrl: savedStory.imageUrl,
        hasCustomImage: savedStory.hasCustomImage,
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

// ==================== GET SINGLE STORY BY ID ====================
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

    const cacheKey = `story:${id}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Story served from cache:', id);
      
      Story.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
      
      return res.json({
        success: true,
        data: cached,
        message: 'Story retrieved successfully (cached)'
      });
    }

    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

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
      imageUrl: story.imageUrl || getCategoryEmoji(story.category),
      hasCustomImage: story.hasCustomImage || false,
      date: story.createdAt,
      verified: story.verified,
      awards: story.awards || [],
      likes: story.likes,
      views: story.views + 1,
      rating: story.rating
    };

    console.log('✅ Story fetched from DB:', id);

    await cacheService.set(cacheKey, formattedStory, 120);

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

// ==================== LIKE STORY ====================
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👍 POST /api/stories/${id}/like`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story ID format'
      });
    }

    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    console.log('✅ Story liked:', id);

    await cacheService.del(`story:${id}`);
    console.log('🗑️ Story cache invalidated after like');

    res.json({
      success: true,
      message: 'Story liked successfully',
      data: { likes: story.likes }
    });
  } catch (error) {
    console.error('❌ Error liking story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like story',
      error: error.message
    });
  }
});

// ==================== DELETE STORY (ADMIN) ====================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/stories/${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story ID format'
      });
    }

    const deletedStory = await Story.findByIdAndDelete(id);

    if (!deletedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    console.log('✅ Story deleted:', id);

    await cacheService.del(`story:${id}`);
    await cacheService.delPattern('stories:*');
    await cacheService.delPattern('help:inspiring-stories*');
    console.log('🗑️ Story caches invalidated after deletion');

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
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

console.log('✅ Stories routes loaded with Redis caching');
module.exports = router;
