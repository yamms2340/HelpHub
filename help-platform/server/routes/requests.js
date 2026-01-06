const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const PointsService = require('../services/PointsService');
const auth = require('../middleware/auth');
const cacheService = require('../services/cache');

// ==================== CREATE REQUEST ====================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, urgency, location } = req.body;
    
    console.log('📝 POST /api/requests - Creating new request');

    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Title, description, and category are required' 
      });
    }
    
    const newRequest = new HelpRequest({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency: urgency || 'Medium',
      location: location?.trim() || '',
      requester: req.user.id,
      status: 'Open'
    });
    
    const savedRequest = await newRequest.save();
    await savedRequest.populate('requester', 'name email');
    
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { requestsCreated: 1 } 
    });
    
    console.log('✅ Request created successfully:', savedRequest._id);

    await cacheService.delPattern('requests:*');
    await cacheService.delPattern(`user:${req.user.id}:requests*`);
    console.log('🗑️ Requests cache invalidated after creation');
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('❌ Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET ALL REQUESTS ====================
router.get('/', async (req, res) => {
  try {
    console.log('📖 GET /api/requests - Fetching all requests');

    const cacheKey = 'requests:all';

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Requests served from cache');
      return res.json(cached);
    }

    const requests = await HelpRequest.find()
      .populate('requester', 'name email')
      .populate('acceptedBy', 'name email totalPoints')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${requests.length} requests from DB`);

    await cacheService.set(cacheKey, requests, 180);
    
    res.json(requests);
  } catch (error) {
    console.error('❌ Get requests error:', error);
    res.json([]);
  }
});

// ==================== GET MY REQUESTS (does not includes completed)====================
router.get('/my', auth, async (req, res) => {
  try {
    console.log(`👤 GET /api/requests/my - User: ${req.user.id}`);

    const cacheKey = `user:${req.user.id}:requests`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ My requests served from cache');
      return res.json(cached);
    }

    // ✅ FULL DEBUG LOGS
    const requests = await HelpRequest.find({
  requester: req.user.id,
  // status: { $ne: 'Completed' }
})

      .populate('requester', 'name email')
      .populate('acceptedBy', 'name email totalPoints')
      .sort({ createdAt: -1 });

    // 🔥 PRINT FULL DETAILS TO TERMINAL
    console.log('🔍 === FULL REQUEST DEBUG ===');
    console.log('CURRENT USER ID:', req.user.id);
    console.log('FETCHED COUNT:', requests.length);
    console.log('REQUESTS:', JSON.stringify(requests, null, 2));
    
    requests.forEach((req, index) => {
      console.log(`\n📋 REQUEST ${index + 1}:`);
      console.log('  - _id:', req._id);
      console.log('  - title:', req.title);
      console.log('  - requester.id:', req.requester?._id);
      console.log('  - requester.email:', req.requester?.email);
      console.log('  - requester.name:', req.requester?.name);
      console.log('  - acceptedBy.id:', req.acceptedBy?._id);
      console.log('  - acceptedBy.name:', req.acceptedBy?.name);
      console.log('  - status:', req.status);
    });
    console.log('🔍 =====================');

    await cacheService.set(cacheKey, requests, 180);

    res.json(requests);
  } catch (error) {
    console.error('❌ Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==================== OFFER HELP ====================
router.put('/:id/offer-help', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    
    console.log(`🤝 PUT /api/requests/${requestId}/offer-help`);

    const request = await HelpRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'Open') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }
    
    if (request.requester.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot help with your own request' });
    }
    
    request.status = 'In Progress';
    request.acceptedBy = req.user.id;
    request.acceptedAt = new Date();
    
    await request.save();
    await request.populate(['requester', 'acceptedBy'], 'name email');
    
    console.log('✅ Help offer accepted:', requestId);

    await cacheService.del(`request:${requestId}`);
    await cacheService.delPattern('requests:*');
    await cacheService.delPattern(`user:${request.requester}:requests*`);
    await cacheService.delPattern(`user:${req.user.id}:requests*`);
    console.log('🗑️ Requests cache invalidated after accepting help');
    
    res.json(request);
  } catch (error) {
    console.error('❌ Offer help error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== COMPLETE REQUEST & AWARD POINTS ====================
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { rating, feedback, completedEarly } = req.body;
    const requestId = req.params.id;
    
    console.log(`✅ PUT /api/requests/${requestId}/confirm`);

    const request = await HelpRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the requester can confirm completion' });
    }
    
    if (request.status !== 'In Progress') {
      return res.status(400).json({ message: 'Request is not in progress' });
    }
    
    if (!request.acceptedBy) {
      return res.status(400).json({ message: 'No helper assigned to this request' });
    }
    
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
    
    request.status = 'Completed';
    request.completedAt = new Date();
    request.rating = rating || 5;
    request.feedback = feedback || '';
    request.pointsAwarded = pointsResult.points;
    
    await request.save();
    await request.populate(['requester', 'acceptedBy'], 'name email totalPoints');
    
    console.log('✅ Request completed and points awarded:', {
      requestId,
      points: pointsResult.points,
      helperId: request.acceptedBy
    });

    await cacheService.del(`request:${requestId}`);
    await cacheService.delPattern('requests:*');
    await cacheService.delPattern(`user:${request.requester}:requests*`);
    await cacheService.delPattern(`user:${request.acceptedBy}:requests*`);
    await cacheService.delPattern('leaderboard:*');
    await cacheService.delPattern('help:*');
    
    console.log('🗑️ Requests, leaderboard, and help caches invalidated after completion');
    
    res.json({ 
      message: 'Request completed and points awarded!',
      request,
      points: pointsResult.points,
      badges: pointsResult.badges,
      achievements: pointsResult.achievements
    });
    
  } catch (error) {
    console.error('❌ Confirm completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
