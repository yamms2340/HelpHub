require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');

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

describe('🎯 HelpHub Campaign System Tests', () => {
  let testUser;
  let testUserToken;
  let anotherUser;
  let anotherUserToken;
  let testCampaign;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);

    // Create test users
    testUser = await User.create({
      name: 'Test Campaign Creator',
      email: 'campaigncreator@test.com',
      password: '$2a$10$abcdefghijklmnopqrstuv',
      role: 'user'
    });

    anotherUser = await User.create({
      name: 'Another Test User',
      email: 'anotheruser@test.com',
      password: '$2a$10$abcdefghijklmnopqrstuv',
      role: 'user'
    });

    // Generate JWT tokens with CORRECT field name
    const jwtSecret = process.env.JWT_SECRET || 'helphub_super_secure_jwt_secret_key_2025_aikBqA53O3bYOVFq';
    
    testUserToken = jwt.sign(
      { 
        userId: testUser._id.toString(), // ✅ Must be 'userId' to match auth middleware
        email: testUser.email,
        name: testUser.name
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    anotherUserToken = jwt.sign(
      { 
        userId: anotherUser._id.toString(), // ✅ Must be 'userId'
        email: anotherUser.email,
        name: anotherUser.name
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Test users created with tokens');
  });

  afterAll(async () => {
    // Clean up test data
    await Campaign.deleteMany({ title: { $regex: /^Test/i } });
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Donation.deleteMany({ donorEmail: { $regex: /@test\.com$/ } });
    
    // Close Redis
    const cacheService = require('../services/cache');
    if (cacheService.client) {
      await cacheService.client.quit();
    }
    
    await mongoose.connection.close();
    console.log('✅ Test database cleaned and disconnected\n');
    
    setTimeout(() => process.exit(0), 1000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📝 TEST 1: Create Campaign', () => {
    
    test('✅ Should create campaign with valid data and auth', async () => {
      const campaignData = {
        title: 'Test Campaign for Education',
        description: 'This is a test campaign to help students with education',
        targetAmount: 50000,
        category: 'Education',
        urgency: 'High',
        location: 'Mumbai, India',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(campaignData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(campaignData.title);
      expect(response.body.data.targetAmount).toBe(campaignData.targetAmount);
      expect(response.body.data.currentAmount).toBe(0);
      expect(response.body.data.status).toBe('active');

      testCampaign = response.body.data;
      
      console.log('   ✓ Campaign created successfully');
    });

    test('❌ Should reject campaign without authentication', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .send({
          title: 'Test Campaign',
          description: 'Test Description',
          targetAmount: 10000,
          category: 'Healthcare'
        })
        .expect(401);
      
      console.log('   ✓ Rejected unauthenticated request');
    });

    test('❌ Should reject campaign without title', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          description: 'Test Description',
          targetAmount: 10000,
          category: 'Healthcare'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
      
      console.log('   ✓ Rejected campaign without title');
    });

    test('❌ Should reject campaign with zero target amount', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Test Campaign',
          description: 'Test Description',
          targetAmount: 0,
          category: 'Healthcare'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      
      console.log('   ✓ Rejected zero target amount');
    });
  });

  describe('📊 TEST 2: Get Campaigns', () => {
    
    test('✅ Should fetch all active campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log('   ✓ Fetched active campaigns');
    });

    test('✅ Should fetch single campaign by ID', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaign._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testCampaign._id);
      
      console.log('   ✓ Fetched single campaign');
    });

    test('❌ Should return 404 for non-existent campaign', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/campaigns/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      
      console.log('   ✓ Rejected non-existent campaign ID');
    });
  });

  describe('📈 TEST 3: Campaign Statistics', () => {
    
    test('✅ Should fetch campaign statistics', async () => {
      const response = await request(app)
        .get('/api/campaigns/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCampaigns');
      expect(response.body.data).toHaveProperty('totalTargetAmount');
      
      console.log('   ✓ Fetched campaign statistics');
    });
  });

  describe('💰 TEST 4: Donate to Campaign', () => {
    
    test('✅ Should add donation to campaign', async () => {
      const donationData = {
        amount: 5000,
        donorName: 'Test Donor',
        donorEmail: 'testdonor@test.com',
        transactionId: 'txn_test_12345',
        message: 'Great cause!'
      };

      const response = await request(app)
        .post(`/api/campaigns/${testCampaign._id}/donate`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send(donationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.donation.amount).toBe(5000);
      
      console.log('   ✓ Donation added successfully');
    });

    test('❌ Should reject donation without authentication', async () => {
      const response = await request(app)
        .post(`/api/campaigns/${testCampaign._id}/donate`)
        .send({ amount: 1000 })
        .expect(401);
      
      console.log('   ✓ Rejected unauthenticated donation');
    });

    test('❌ Should reject donation with zero amount', async () => {
      const response = await request(app)
        .post(`/api/campaigns/${testCampaign._id}/donate`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ amount: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
      
      console.log('   ✓ Rejected zero donation amount');
    });
  });

  describe('✏️ TEST 5: Update Campaign', () => {
    
    test('✅ Should update campaign by creator', async () => {
      const updateData = {
        title: 'Test Campaign for Education - Updated',
        urgency: 'Critical'
      };

      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      
      console.log('   ✓ Campaign updated successfully');
    });

    test('❌ Should reject update by non-creator', async () => {
      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
      
      console.log('   ✓ Rejected update by non-creator');
    });
  });

  describe('🗑️ TEST 6: Delete Campaign', () => {
    
    test('✅ Should delete campaign without donations', async () => {
      const deletableCampaign = await Campaign.create({
        title: 'Test Deletable Campaign',
        description: 'This campaign can be deleted',
        targetAmount: 20000,
        currentAmount: 0,
        category: 'Environment',
        creator: testUser._id,
        status: 'active',
        donors: []
      });

      const response = await request(app)
        .delete(`/api/campaigns/${deletableCampaign._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deleted = await Campaign.findById(deletableCampaign._id);
      expect(deleted).toBeNull();
      
      console.log('   ✓ Campaign deleted successfully');
    });

    test('❌ Should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${testCampaign._id}`)
        .expect(401);
      
      console.log('   ✓ Rejected unauthenticated deletion');
    });

    test('❌ Should reject deletion of campaign with donations', async () => {
      const response = await request(app)
        .delete(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('donations');
      
      console.log('   ✓ Rejected deletion of funded campaign');
    });
  });
});
