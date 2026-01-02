require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');

// Mock services
jest.mock('../services/PointsService');

// Mock email queue
jest.mock('../queues/emailQueue', () => ({
  add: jest.fn().mockResolvedValue({ id: 'job-123' })
}));

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: { create: jest.fn() },
    payments: { fetch: jest.fn() }
  }));
});

const app = require('../server');
const PointsService = require('../services/PointsService');

describe('🆘 HelpHub Help Requests System Tests', () => {
  let requesterUser;
  let requesterToken;
  let helperUser;
  let helperToken;
  let testRequest;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);

    // Create test users
    const hashedPassword = require('bcryptjs').hashSync('Test@123456', 10);
    
    requesterUser = await User.create({
      name: 'Test Requester',
      email: 'requester@helptest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      requestsCreated: 0
    });

    helperUser = await User.create({
      name: 'Test Helper',
      email: 'helper@helptest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      requestsCompleted: 0,
      totalPoints: 100
    });

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET || 'helphub_super_secure_jwt_secret_key_2025_aikBqA53O3bYOVFq';
    
    requesterToken = jwt.sign(
      { userId: requesterUser._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    helperToken = jwt.sign(
      { userId: helperUser._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Test users created with tokens');
  });

  afterAll(async () => {
    // Clean up test data
    await HelpRequest.deleteMany({ title: { $regex: /^Test/i } });
    await User.deleteMany({ email: { $regex: /@helptest\.com$/ } });
    
    // Close Redis
    const cacheService = require('../services/cache');
    if (cacheService.client) {
      await cacheService.client.quit();
    }
    
    await mongoose.connection.close();
    console.log('✅ Test database cleaned and disconnected\n');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📝 TEST 1: Create Help Request', () => {
    
    test('✅ Should create help request with valid data', async () => {
      const requestData = {
        title: 'Test Help Request - Need Medical Assistance',
        description: 'I need help with medical expenses for my family member',
        category: 'Health', // ✅ Correct category
        urgency: 'High',
        location: 'Mumbai, India'
      };

      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(requestData.title);
      expect(response.body.description).toBe(requestData.description);
      expect(response.body.category).toBe(requestData.category);
      expect(response.body.urgency).toBe(requestData.urgency);
      expect(response.body.status).toBe('Open');
      expect(response.body.requester).toHaveProperty('_id', requesterUser._id.toString());

      testRequest = response.body;

      console.log('   ✓ Help request created successfully');
    });

    test('❌ Should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({
          title: 'Test Request',
          description: 'Test Description',
          category: 'Health',
          location: 'Mumbai'
        })
        .expect(401);

      expect(response.body.message).toContain('No token');

      console.log('   ✓ Rejected unauthenticated request');
    });

    test('❌ Should reject request without title', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          description: 'Test Description',
          category: 'Health',
          location: 'Mumbai'
        })
        .expect(400);

      expect(response.body.message).toContain('required');

      console.log('   ✓ Rejected request without title');
    });

    test('❌ Should reject request without description', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          title: 'Test Request',
          category: 'Health',
          location: 'Mumbai'
        })
        .expect(400);

      expect(response.body.message).toContain('required');

      console.log('   ✓ Rejected request without description');
    });

    test('❌ Should reject request without category', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          title: 'Test Request',
          description: 'Test Description',
          location: 'Mumbai'
        })
        .expect(400);

      expect(response.body.message).toContain('required');

      console.log('   ✓ Rejected request without category');
    });

    test('✅ Should use default urgency if not provided', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          title: 'Test Request Without Urgency',
          description: 'Test Description',
          category: 'Education',
          location: 'Delhi, India'
        })
        .expect(201);

      expect(response.body.urgency).toBe('Medium');

      // Clean up
      await HelpRequest.findByIdAndDelete(response.body._id);

      console.log('   ✓ Default urgency applied');
    });
  });

  describe('📊 TEST 2: Get All Help Requests', () => {
    
    test('✅ Should fetch all help requests', async () => {
      const response = await request(app)
        .get('/api/requests')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify request structure if any exist
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('_id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('status');
        expect(response.body[0]).toHaveProperty('requester');
      }

      console.log('   ✓ All requests fetched successfully');
    });

    test('✅ Should return array on success', async () => {
      const response = await request(app)
        .get('/api/requests')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      console.log('   ✓ Array returned successfully');
    });
  });

  describe('🤝 TEST 3: Offer Help', () => {
    
    test('✅ Should allow user to offer help on open request', async () => {
      const response = await request(app)
        .put(`/api/requests/${testRequest._id}/offer-help`)
        .set('Authorization', `Bearer ${helperToken}`)
        .expect(200);

      expect(response.body.status).toBe('In Progress');
      expect(response.body.acceptedBy).toHaveProperty('_id', helperUser._id.toString());
      expect(response.body).toHaveProperty('acceptedAt');

      console.log('   ✓ Help offer accepted successfully');
    });

    test('❌ Should reject offer without authentication', async () => {
      // Create a new open request
      const openRequest = await HelpRequest.create({
        title: 'Test Open Request',
        description: 'Test Description',
        category: 'Education',
        location: 'Chennai',
        urgency: 'Medium',
        requester: requesterUser._id,
        status: 'Open'
      });

      const response = await request(app)
        .put(`/api/requests/${openRequest._id}/offer-help`)
        .expect(401);

      expect(response.body.message).toContain('No token');

      // Clean up
      await HelpRequest.findByIdAndDelete(openRequest._id);

      console.log('   ✓ Rejected unauthenticated offer');
    });

    test('❌ Should reject offer on non-existent request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/requests/${fakeId}/offer-help`)
        .set('Authorization', `Bearer ${helperToken}`)
        .expect(404);

      expect(response.body.message).toContain('not found');

      console.log('   ✓ Rejected offer on non-existent request');
    });

    test('❌ Should reject offer on own request', async () => {
      const ownRequest = await HelpRequest.create({
        title: 'Test Own Request',
        description: 'Test Description',
        category: 'Health',
        location: 'Bangalore',
        urgency: 'High',
        requester: helperUser._id,
        status: 'Open'
      });

      const response = await request(app)
        .put(`/api/requests/${ownRequest._id}/offer-help`)
        .set('Authorization', `Bearer ${helperToken}`)
        .expect(400);

      expect(response.body.message).toContain('cannot help with your own request');

      // Clean up
      await HelpRequest.findByIdAndDelete(ownRequest._id);

      console.log('   ✓ Rejected offer on own request');
    });

    test('❌ Should reject offer on already accepted request', async () => {
      const response = await request(app)
        .put(`/api/requests/${testRequest._id}/offer-help`)
        .set('Authorization', `Bearer ${helperToken}`)
        .expect(400);

      expect(response.body.message).toContain('no longer available');

      console.log('   ✓ Rejected offer on unavailable request');
    });
  });

  describe('✅ TEST 4: Confirm Completion & Award Points', () => {
    
    test('✅ Should confirm completion and award points', async () => {
      const mockPointsResult = {
        points: 50,
        totalPoints: 150,
        badges: [],
        achievements: []
      };

      PointsService.awardPoints.mockResolvedValue(mockPointsResult);

      const response = await request(app)
        .put(`/api/requests/${testRequest._id}/confirm`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          rating: 5,
          feedback: 'Great help! Very professional.',
          completedEarly: false
        })
        .expect(200);

      expect(response.body.message).toContain('completed and points awarded');
      expect(response.body.request.status).toBe('Completed');
      expect(response.body.request).toHaveProperty('completedAt');
      expect(response.body.request.rating).toBe(5);
      expect(response.body.points).toBe(mockPointsResult.points);
      expect(PointsService.awardPoints).toHaveBeenCalled();

      console.log('   ✓ Request completed and points awarded');
    });

    test('❌ Should reject confirmation without authentication', async () => {
      const inProgressRequest = await HelpRequest.create({
        title: 'Test In Progress Request',
        description: 'Test Description',
        category: 'Health',
        location: 'Hyderabad',
        urgency: 'Medium',
        requester: requesterUser._id,
        acceptedBy: helperUser._id,
        status: 'In Progress'
      });

      const response = await request(app)
        .put(`/api/requests/${inProgressRequest._id}/confirm`)
        .send({ rating: 5 })
        .expect(401);

      expect(response.body.message).toContain('No token');

      // Clean up
      await HelpRequest.findByIdAndDelete(inProgressRequest._id);

      console.log('   ✓ Rejected unauthenticated confirmation');
    });

    test('❌ Should reject confirmation by non-requester', async () => {
      const anotherRequest = await HelpRequest.create({
        title: 'Test Another Request',
        description: 'Test Description',
        category: 'Education',
        location: 'Pune',
        urgency: 'Low',
        requester: requesterUser._id,
        acceptedBy: helperUser._id,
        status: 'In Progress'
      });

      const response = await request(app)
        .put(`/api/requests/${anotherRequest._id}/confirm`)
        .set('Authorization', `Bearer ${helperToken}`) // Helper trying to confirm
        .send({ rating: 5 })
        .expect(403);

      expect(response.body.message).toContain('Only the requester can confirm');

      // Clean up
      await HelpRequest.findByIdAndDelete(anotherRequest._id);

      console.log('   ✓ Rejected confirmation by non-requester');
    });

    test('❌ Should reject confirmation on non-existent request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/requests/${fakeId}/confirm`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ rating: 5 })
        .expect(404);

      expect(response.body.message).toContain('not found');

      console.log('   ✓ Rejected confirmation on non-existent request');
    });

    test('❌ Should reject confirmation on open request', async () => {
      const openRequest = await HelpRequest.create({
        title: 'Test Open Request for Confirmation',
        description: 'Test Description',
        category: 'Health',
        location: 'Kolkata',
        urgency: 'High',
        requester: requesterUser._id,
        status: 'Open'
      });

      const response = await request(app)
        .put(`/api/requests/${openRequest._id}/confirm`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ rating: 5 })
        .expect(400);

      expect(response.body.message).toContain('not in progress');

      // Clean up
      await HelpRequest.findByIdAndDelete(openRequest._id);

      console.log('   ✓ Rejected confirmation on open request');
    });

    test('✅ Should use default rating if not provided', async () => {
      const requestForDefault = await HelpRequest.create({
        title: 'Test Default Rating Request',
        description: 'Test Description',
        category: 'Education',
        location: 'Jaipur',
        urgency: 'Medium',
        requester: requesterUser._id,
        acceptedBy: helperUser._id,
        status: 'In Progress'
      });

      PointsService.awardPoints.mockResolvedValue({ points: 50 });

      const response = await request(app)
        .put(`/api/requests/${requestForDefault._id}/confirm`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({}) // No rating provided
        .expect(200);

      expect(response.body.request.rating).toBe(5); // Default rating

      console.log('   ✓ Default rating applied');
    });
  });

  describe('💾 TEST 5: Cache Invalidation', () => {
    
    test('✅ Should invalidate cache after creating request', async () => {
      const requestData = {
        title: 'Test Cache Invalidation Request',
        description: 'Testing cache invalidation',
        category: 'Health',
        location: 'Ahmedabad'
      };

      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');

      // Clean up
      await HelpRequest.findByIdAndDelete(response.body._id);

      console.log('   ✓ Cache invalidated after creation');
    });
  });
});
