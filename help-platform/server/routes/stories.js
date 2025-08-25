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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Story = mongoose.model('Story', storySchema);

// GET /api/inspiring-stories - Fetch approved stories from MongoDB
router.get('/inspiring-stories', async (req, res) => {
  try {
    console.log('Fetching stories from MongoDB...'); // Debug log
    
    const stories = await Story.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Found ${stories.length} stories`); // Debug log
    
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
      location: story.location,
      image: getCategoryEmoji(story.category),
      rating: story.rating || 4.5,
      createdAt: story.createdAt
    }));
    
    res.json({ data: formattedStories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST /api/stories/submit - Submit new story to MongoDB
router.post('/stories/submit', async (req, res) => {
  try {
    const { title, description, category, impact, helpType } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ 
        error: 'Title, description, and category are required' 
      });
    }

    const newStory = new Story({
      title,
      description,
      category,
      impact,
      helpType,
      helper: 'Anonymous',
      location: 'Unknown',
      image: getCategoryEmoji(category),
      rating: 4.5,
      approved: true
    });

    const savedStory = await newStory.save();
    console.log('Story saved to MongoDB:', savedStory.title);
    
    res.status(201).json({
      message: 'Story submitted successfully!',
      story: savedStory
    });

  } catch (error) {
    console.error('Error saving story:', error);
    res.status(500).json({ error: 'Failed to submit story' });
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
    'Home Repairs': '🔧',
    'Transportation': '🚗'
  };
  return emojiMap[category] || '📖';
}

module.exports = router;
