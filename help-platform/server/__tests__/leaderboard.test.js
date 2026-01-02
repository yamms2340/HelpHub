require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock services
jest.mock('../services/leaderboardService');
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
const LeaderboardService = require('../services/leaderboardService');
const PointsService = require('../services/PointsService');

describe('🏆 HelpHub Leaderboard System Tests', () => {
  let testUser;
  let testUserToken;
  let anotherUser;
  let anotherUserToken;

  // Mock leaderboard data
  const mockLeaderboardData = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Top User',
      email: 'top@test.com',
      totalPoints: 1000,
      monthlyPoints: 500,
      weeklyPoints: 200,
      requestsCompleted: 50,
      rank: 1
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Second User',
      email: 'second@test.com',
      totalPoints: 800,
      monthlyPoints: 400,
      weeklyPoints: 150,
      requestsCompleted: 40,
      rank: 2
    }
  ];

  const mockUserStats = {
    userId: '507f1f77bcf86cd799439011',
    name: 'Test User',
    totalPoints: 500,
    monthlyPoints: 200,
    weeklyPoints: 100,
    requestsCompleted: 25,
    requestsCreated: 10,
    badges: [],
    achievements: []
  };

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);

    // Create test users
    const hashedPassword = require('bcryptjs').hashSync('Test@123456', 10);
    
    testUser = await User.create({
      name: 'Test Leaderboard User',
      email: 'leaderuser@leadertest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      totalPoints: 500,
      monthlyPoints: 200,
      weeklyPoints: 100
    });

    anotherUser = await User.create({
      name: 'Another Leader User',
      email: 'anotherleader@leadertest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      totalPoints: 300,
      monthlyPoints: 150,
      weeklyPoints: 75
    });

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET || 'helphub_super_secure_jwt_secret_key_2025_aikBqA53O3bYOVFq';
    
    testUserToken = jwt.sign(
      { userId: testUser._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    anotherUserToken = jwt.sign(
      { userId: anotherUser._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('✅ Test users created with tokens');
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /@leadertest\.com$/ } });
    
    // Close Redis
    const cacheService = require('../services/cache');
    if (cacheService.client) {
      await cacheService.client.quit();
    }
    
    await mongoose.connection.close();
    console.log('✅ Test database cleaned and disconnected\n');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear cache before each test
    const cacheService = require('../services/cache');
    await cacheService.delPattern('leaderboard:*');
  });

  describe('📊 TEST 1: Get Leaderboard', () => {
    
    test('✅ Should fetch all-time leaderboard', async () => {
      LeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardData);

      const response = await request(app)
        .get('/api/leaderboard?timeframe=all&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.timeframe).toBe('all');
      expect(response.body.count).toBe(mockLeaderboardData.length);
      expect(LeaderboardService.getLeaderboard).toHaveBeenCalledWith('all', 10);

      console.log('   ✓ All-time leaderboard fetched');
    });

    test('✅ Should fetch monthly leaderboard', async () => {
      LeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardData);

      const response = await request(app)
        .get('/api/leaderboard?timeframe=month&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.timeframe).toBe('month');
      expect(LeaderboardService.getLeaderboard).toHaveBeenCalledWith('month', 5);

      console.log('   ✓ Monthly leaderboard fetched');
    });

    test('✅ Should fetch weekly leaderboard', async () => {
      LeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardData);

      const response = await request(app)
        .get('/api/leaderboard?timeframe=week')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.timeframe).toBe('week');

      console.log('   ✓ Weekly leaderboard fetched');
    });
  });

  describe('👤 TEST 2: Get User Stats', () => {
    
    test('✅ Should fetch user stats by ID', async () => {
      LeaderboardService.getUserStats.mockResolvedValue(mockUserStats);

      const response = await request(app)
        .get(`/api/leaderboard/user/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPoints');
      expect(response.body.data).toHaveProperty('monthlyPoints');
      expect(response.body.data).toHaveProperty('weeklyPoints');
      expect(LeaderboardService.getUserStats).toHaveBeenCalledWith(testUser._id.toString());

      console.log('   ✓ User stats fetched successfully');
    });
  });

  describe('🏅 TEST 3: Award Points', () => {
    
    test('✅ Should award points with authentication', async () => {
      const pointsResult = {
        totalPoints: 600,
        monthlyPoints: 300,
        weeklyPoints: 200,
        pointsAwarded: 100
      };

      PointsService.awardPoints.mockResolvedValue(pointsResult);

      const response = await request(app)
        .post('/api/leaderboard/award-points')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          userId: testUser._id.toString(),
          requestData: { category: 'Healthcare' },
          completionData: { rating: 5 }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Points awarded successfully');
      expect(response.body.data).toHaveProperty('pointsAwarded');

      console.log('   ✓ Points awarded successfully');
    });

    test('❌ Should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/leaderboard/award-points')
        .send({
          userId: testUser._id.toString()
        })
        .expect(401);

      expect(response.body.message).toContain('No token');

      console.log('   ✓ Rejected unauthenticated request');
    });

    test('❌ Should reject request without userId', async () => {
      const response = await request(app)
        .post('/api/leaderboard/award-points')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          requestData: { category: 'Healthcare' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('userId is required');

      console.log('   ✓ Rejected request without userId');
    });
  });

  describe('📈 TEST 4: Get Stats Overview', () => {
    
    test('✅ Should fetch comprehensive stats overview', async () => {
      LeaderboardService.getLeaderboard
        .mockResolvedValueOnce(mockLeaderboardData) // all
        .mockResolvedValueOnce(mockLeaderboardData) // month
        .mockResolvedValueOnce(mockLeaderboardData); // week

      const response = await request(app)
        .get('/api/leaderboard/stats/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('allTime');
      expect(response.body.data).toHaveProperty('monthly');
      expect(response.body.data).toHaveProperty('weekly');
      expect(response.body.data).toHaveProperty('summary');

      console.log('   ✓ Stats overview fetched');
    });
  });

  describe('🔄 TEST 5: Reset Points (Admin)', () => {
    
    test('✅ Should reset points with authentication', async () => {
      LeaderboardService.resetMonthlyWeeklyPoints.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/api/leaderboard/reset-points')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Points reset completed');
      expect(LeaderboardService.resetMonthlyWeeklyPoints).toHaveBeenCalled();

      console.log('   ✓ Points reset successfully');
    });

    test('❌ Should reject reset without authentication', async () => {
      const response = await request(app)
        .post('/api/leaderboard/reset-points')
        .expect(401);

      expect(response.body.message).toContain('No token');

      console.log('   ✓ Rejected unauthenticated reset');
    });
  });

  describe('💾 TEST 6: Caching Behavior', () => {
    
    test('✅ Should cache leaderboard results', async () => {
      LeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardData);

      // First request - should call service
      await request(app)
        .get('/api/leaderboard?timeframe=all')
        .expect(200);

      expect(LeaderboardService.getLeaderboard).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      await request(app)
        .get('/api/leaderboard?timeframe=all')
        .expect(200);

      // Still only called once because second request used cache
      expect(LeaderboardService.getLeaderboard).toHaveBeenCalledTimes(1);

      console.log('   ✓ Caching mechanism verified');
    });
  });
});
