const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ Step 1: Create request (status: "Open")
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, urgency, location } = req.body;
    
    const newRequest = new HelpRequest({
      title,
      description,
      category,
      urgency,
      location,
      requester: req.user.id,
      status: 'Open'
    });
    
    const savedRequest = await newRequest.save();
    await savedRequest.populate('requester', 'name email');
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Step 2: User offers help → automatically accepted (status: "In Progress")
router.put('/:id/offer-help', auth, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'Open') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }
    
    // ✅ Directly accept helper and change status to "In Progress"
    request.status = 'In Progress';
    request.acceptedBy = req.user.id;
    request.acceptedAt = new Date();
    
    await request.save();
    await request.populate(['requester', 'acceptedBy'], 'name email');
    
    res.json(request);
  } catch (error) {
    console.error('Offer help error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { rating, feedback, completedEarly } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only requester can confirm
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the requester can confirm completion' });
    }
    
    if (request.status !== 'In Progress') {
      return res.status(400).json({ message: 'Request is not in progress' });
    }
    
    // ✅ Calculate points
    let points = 10; // base points
    if (completedEarly) points += 5;
    if (feedback && feedback.length > 50) points += 3;
    
    // ✅ Mark as completed
    request.status = 'Completed';
    request.completedAt = new Date();
    request.rating = rating || 5;
    request.feedback = feedback || '';
    request.pointsAwarded = points;
    
    await request.save();
    
    // ✅ Award points to helper
    await User.findByIdAndUpdate(request.acceptedBy, { 
      $inc: { points: points } 
    });
    
    await request.populate(['requester', 'acceptedBy'], 'name email points');
    
    res.json({ 
      message: 'Request completed and points awarded!',
      request,
      points
    });
    
  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await HelpRequest.find()
      .populate('requester', 'name email')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
