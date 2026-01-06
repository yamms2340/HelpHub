const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cacheService = require('../services/cache');

// ✅ USE ONLY ONE upload SOURCE
const upload = require('../middleware/upload');

// ==================== STORY SCHEMA ====================
const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  impact: String,
  helpType: [String],
  helper: { type: String, default: 'Anonymous' },
  location: { type: String, default: 'Unknown' },
  imageUrl: String,
  hasCustomImage: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  approved: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// ✅ SAFE MODEL REGISTRATION (VERY IMPORTANT)
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

// ==================== SUBMIT STORY ====================
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, impact, helpType, helper, location } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, category required' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const story = await Story.create({
      title,
      description,
      category,
      impact,
      helpType,
      helper: helper || 'Anonymous',
      location: location || 'Unknown',
      imageUrl,
      hasCustomImage: !!imageUrl
    });

    await cacheService.delPattern('stories:*');

    res.status(201).json({ success: true, data: story });
  } catch (err) {
    console.error('❌ Story submit error:', err);
    res.status(500).json({ message: 'Story submission failed' });
  }
});

// ==================== INSPIRING STORIES ====================
router.get('/inspiring-stories', async (req, res) => {
  const stories = await Story.find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, data: stories });
});

console.log('✅ Stories routes loaded successfully');
module.exports = router;
