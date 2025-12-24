const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth');

// Create request
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
    
    // Increment user's requestsCreated counter
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { requestsCreated: 1 } 
    });
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Offer help - automatically accepts
router.put('/:id/offer-help', auth, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'Open') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }
    
    // Check if user is trying to help their own request
    if (request.requester.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot help with your own request' });
    }
    
    // Accept helper and change status to "In Progress"
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

// Complete request and award points
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { rating, feedback, completedEarly } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only requester can confirm
    if (request.requester.toString() !== req.user.id) {
      console.log("requester: "+request.requester.toString());
        console.log("user id: "+req.user.id);
      return res.status(403).json({ message: 'Only the requester can confirm completion' });
    }
    
    if (request.status !== 'In Progress') {
      return res.status(400).json({ message: 'Request is not in progress' });
    }
    
    if (!request.acceptedBy) {
      return res.status(400).json({ message: 'No helper assigned to this request' });
    }
    
    // Award points using PointsService
    const pointsResult = await PointsService.awardPoints(
      request.acceptedBy, 
      {
        id: request._id,
        category: request.category,
        urgency: request.urgency
      },
      {
        rating: rating || 5,
        completedEarly: completedEarly || false
      }
    );
    
    // Mark as completed
    request.status = 'Completed';
    request.completedAt = new Date();
    request.rating = rating || 5;
    request.feedback = feedback || '';
    request.pointsAwarded = pointsResult.points;
    
    await request.save();
    await request.populate(['requester', 'acceptedBy'], 'name email totalPoints');
    
    res.json({ 
      message: 'Request completed and points awarded!',
      request,
      points: pointsResult.points,
      badges: pointsResult.badges,
      achievements: pointsResult.achievements
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
      .populate('acceptedBy', 'name email totalPoints')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
