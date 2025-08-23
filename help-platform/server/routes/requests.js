const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const Help = require('../models/Help');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create help request
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, urgency, location } = req.body;

    const helpRequest = new HelpRequest({
      title,
      description,
      category,
      urgency,
      location,
      requester: req.user._id
    });

    await helpRequest.save();
    await helpRequest.populate('requester', 'name email');

    res.status(201).json(helpRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// In your requests.js route file, update the GET route:

// Get all help requests
router.get('/', async (req, res) => {
  try {
    const { category, urgency, status = 'Open' } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;

    const requests = await HelpRequest.find(filter)
      .populate('requester', 'name email')  // Make sure User model exists
      .populate('acceptedBy', 'name email') // Make sure this is correct
      .sort({ createdAt: -1 });

    console.log('📊 Found requests:', requests.length); // Debug log
    console.log('📋 Requests data:', requests); // Debug log

    res.json(requests);
  } catch (error) {
    console.error('❌ API Error:', error); // Debug log
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Accept help request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Open') {
      return res.status(400).json({ message: 'Request is not available' });
    }

    if (request.requester.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot accept your own request' });
    }

    request.status = 'In Progress';
    request.acceptedBy = req.user._id;
    await request.save();

    await request.populate(['requester', 'acceptedBy'], 'name email');

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete help request
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'In Progress') {
      return res.status(400).json({ message: 'Request is not in progress' });
    }

    // Update request
    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();

    // Create help record
    const help = new Help({
      request: request._id,
      helper: request.acceptedBy,
      requester: request.requester,
      rating,
      feedback
    });
    await help.save();

    // Update helper's stats
    const helper = await User.findById(request.acceptedBy);
    helper.helpCount += 1;
    helper.totalRatings += rating;
    helper.rating = helper.totalRatings / helper.helpCount;
    await helper.save();

    res.json({ message: 'Request completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
