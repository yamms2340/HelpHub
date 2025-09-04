const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'stories');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Created stories upload directory:', uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'story-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📁 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file type:', file.mimetype);
  
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

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
  // Image fields
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
  // Other fields
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

// Create model
const Story = mongoose.model('Story', storySchema);

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

// GET /api/stories/inspiring-stories - Fetch approved stories
router.get('/inspiring-stories', async (req, res) => {
  try {
    console.log('✅ GET /api/stories/inspiring-stories called');
    
    const limit = parseInt(req.query.limit) || 20;
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
      // Use custom image if available, otherwise emoji
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

// POST /api/stories/submit - Submit new story with optional image
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    console.log('✅ POST /api/stories/submit called');
    console.log('📝 Request body:', req.body);
    console.log('📁 Uploaded file:', req.file);
    
    const { title, description, category, impact, helpType, helper, location, authorName, imageUrl } = req.body;
    
    // Validate required fields
    if (!title || !description || !category) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Cleaned up uploaded file due to validation error');
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      
      return res.status(400).json({ 
        success: false,
        error: 'Title, description, and category are required',
        message: 'Missing required fields'
      });
    }

    // Handle image
    let finalImage = null;
    let hasCustomImage = false;
    
    if (req.file) {
      // File uploaded successfully
      finalImage = `/uploads/stories/${req.file.filename}`;
      hasCustomImage = true;
      console.log('✅ Image uploaded to:', finalImage);
    } else if (imageUrl && imageUrl.trim()) {
      // Image URL provided
      finalImage = imageUrl.trim();
      hasCustomImage = true;
      console.log('✅ Using provided image URL:', finalImage);
    } else {
      // No image provided, use emoji
      finalImage = getCategoryEmoji(category);
      hasCustomImage = false;
      console.log('✅ Using category emoji:', finalImage);
    }
    
    // Parse helpType if it's a JSON string
    let parsedHelpType = [];
    if (helpType) {
      try {
        parsedHelpType = typeof helpType === 'string' ? JSON.parse(helpType) : helpType;
        if (!Array.isArray(parsedHelpType)) {
          parsedHelpType = [parsedHelpType].filter(Boolean);
        }
      } catch (parseError) {
        console.warn('Failed to parse helpType, using as single value');
        parsedHelpType = [helpType].filter(Boolean);
      }
    }
    
    // Create new story
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
    
    res.status(201).json({
      success: true,
      message: 'Story submitted successfully!',
      data: {
        id: savedStory._id,
        title: savedStory.title,
        category: savedStory.category,
        helper: savedStory.helper,
        image: savedStory.image,
        imageUrl: savedStory.imageUrl,
        hasCustomImage: savedStory.hasCustomImage,
        createdAt: savedStory.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error saving story:', error);
    
    // Clean up uploaded file if save fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Cleaned up uploaded file due to save error');
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
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
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Continue to the submit handler
    router.stack.find(layer => layer.route && layer.route.path === '/submit')
      .route.stack[0].handle(req, res);
  });
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
      imageUrl: story.hasCustomImage ? story.image || story.imageUrl : getCategoryEmoji(story.category),
      date: story.createdAt,
      verified: story.verified,
      awards: story.awards || [],
      likes: story.views + 1,
      views: story.views + 1,
      rating: story.rating,
      hasCustomImage: story.hasCustomImage
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

module.exports = router;
