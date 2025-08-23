const express = require('express');
const User = require('../models/User');
const Help = require('../models/Help');

const router = express.Router();

// Get hall of fame (top helpers)
router.get('/hall-of-fame', async (req, res) => {
  try {
    const topHelpers = await User.find({ helpCount: { $gt: 0 } })
      .select('name email helpCount rating profilePicture')
      .sort({ helpCount: -1, rating: -1 })
      .limit(20);

    res.json(topHelpers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get help history for a specific user
router.get('/history/:userId', async (req, res) => {
  try {
    const helpHistory = await Help.find({ helper: req.params.userId })
      .populate('request', 'title description category')
      .populate('requester', 'name email')
      .sort({ completedAt: -1 });

    res.json(helpHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics for the platform
router.get('/stats', async (req, res) => {
  try {
    const totalHelpers = await User.countDocuments({ helpCount: { $gt: 0 } });
    const totalHelp = await Help.countDocuments();
    const avgRating = await User.aggregate([
      { $match: { helpCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      totalHelpers,
      totalHelp,
      averageRating: avgRating[0]?.avgRating || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
