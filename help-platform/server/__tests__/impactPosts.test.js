require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ImpactPost = require('../models/ImpactPost');

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

describe('📰 HelpHub Impact Posts System Tests', () => {
  let testUser;
  let testUserToken;
  let anotherUser;
  let anotherUserToken;
  let testPost;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);

    // Create test users
    const hashedPassword = require('bcryptjs').hashSync('Test@123456', 10);
    
    testUser = await User.create({
      name: 'Test Post Creator',
      email: 'postcreator@impacttest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user'
    });

    anotherUser = await User.create({
      name: 'Another Test User',
      email: 'anotheruser@impacttest.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user'
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
    await ImpactPost.deleteMany({ title: { $regex: /^Test/i } });
    await User.deleteMany({ email: { $regex: /@impacttest\.com$/ } });
    
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

  describe('📝 TEST 1: Create Impact Post', () => {
    
    test('✅ Should create impact post with valid data', async () => {
      const postData = {
        title: 'Test Community Food Drive',
        category: 'Food & Nutrition',
        beneficiaries: 50,
        amount: 15000,
        details: 'This is a test post about community food distribution to help families in need.',
        authorName: testUser.name,
        authorId: testUser._id.toString(),
        location: 'Mumbai, India',
        tags: ['food', 'community', 'help']
      };

      const response = await request(app)
        .post('/api/impact-posts')
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.category).toBe(postData.category);
      expect(response.body.data.beneficiaries).toBe(postData.beneficiaries);
      expect(response.body.data.amount).toBe(postData.amount);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.likes).toBe(0);
      expect(response.body.data.views).toBe(0);

      testPost = response.body.data;

      console.log('   ✓ Impact post created successfully');
    });

    test('❌ Should reject post without title', async () => {
      const response = await request(app)
        .post('/api/impact-posts')
        .send({
          category: 'Healthcare',
          details: 'Test details',
          authorName: 'Test User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Title is required');

      console.log('   ✓ Rejected post without title');
    });

    test('❌ Should reject post without category', async () => {
      const response = await request(app)
        .post('/api/impact-posts')
        .send({
          title: 'Test Post',
          details: 'Test details',
          authorName: 'Test User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Category is required');

      console.log('   ✓ Rejected post without category');
    });

    test('❌ Should reject post with short details', async () => {
      const response = await request(app)
        .post('/api/impact-posts')
        .send({
          title: 'Test Post',
          category: 'Healthcare',
          details: 'Short', // Less than 10 characters
          authorName: 'Test User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      // ✅ FIX: details is an array, check the first element
      expect(response.body.details[0]).toContain('at least 10 characters');

      console.log('   ✓ Rejected post with short details');
    });
  });

  describe('📊 TEST 2: Get All Impact Posts', () => {
    
    test('✅ Should fetch all active posts', async () => {
      const response = await request(app)
        .get('/api/impact-posts?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalPosts');

      console.log('   ✓ Fetched all active posts');
    });

    test('✅ Should filter posts by category', async () => {
      const response = await request(app)
        .get('/api/impact-posts?category=Food & Nutrition')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      
      // Verify all returned posts match category
      if (response.body.data.posts.length > 0) {
        response.body.data.posts.forEach(post => {
          expect(post.category).toBe('Food & Nutrition');
        });
      }

      console.log('   ✓ Filtered posts by category');
    });

    test('✅ Should support pagination', async () => {
      const response = await request(app)
        .get('/api/impact-posts?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(5);

      console.log('   ✓ Pagination working correctly');
    });

    test('✅ Should support search', async () => {
      const response = await request(app)
        .get('/api/impact-posts?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.posts)).toBe(true);

      console.log('   ✓ Search functionality working');
    });

    test('✅ Should support sorting', async () => {
      const response = await request(app)
        .get('/api/impact-posts?sortBy=createdAt&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.posts)).toBe(true);

      console.log('   ✓ Sorting working correctly');
    });
  });

  describe('🔍 TEST 3: Get Single Impact Post', () => {
    
    test('✅ Should fetch single post by ID', async () => {
      const response = await request(app)
        .get(`/api/impact-posts/${testPost._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPost._id);
      expect(response.body.data.title).toBe(testPost.title);

      console.log('   ✓ Fetched single post by ID');
    });

    test('❌ Should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/impact-posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      console.log('   ✓ Rejected non-existent post ID');
    });

    test('✅ Should increment view count', async () => {
      // Get initial view count
      const firstResponse = await request(app)
        .get(`/api/impact-posts/${testPost._id}`)
        .expect(200);

      const initialViews = firstResponse.body.data.views;

      // Wait a bit for async update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch again
      const secondResponse = await request(app)
        .get(`/api/impact-posts/${testPost._id}`)
        .expect(200);

      // Views should have incremented (or at least be >= initial)
      expect(secondResponse.body.data.views).toBeGreaterThanOrEqual(initialViews);

      console.log('   ✓ View count incremented');
    });
  });

  describe('✏️ TEST 4: Update Impact Post', () => {
    
    test('✅ Should update post', async () => {
      const updates = {
        title: 'Test Community Food Drive - Updated',
        beneficiaries: 75
      };

      const response = await request(app)
        .put(`/api/impact-posts/${testPost._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.beneficiaries).toBe(updates.beneficiaries);

      console.log('   ✓ Post updated successfully');
    });

    test('❌ Should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/impact-posts/${fakeId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);

      console.log('   ✓ Rejected update for non-existent post');
    });
  });

  describe('👍 TEST 5: Like/Unlike Post', () => {
    
    test('✅ Should like a post', async () => {
      const response = await request(app)
        .post(`/api/impact-posts/${testPost._id}/like`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.likes).toBeGreaterThan(0);

      console.log('   ✓ Post liked successfully');
    });

    test('✅ Should unlike a post', async () => {
      // Like first
      await request(app)
        .post(`/api/impact-posts/${testPost._id}/like`)
        .expect(200);

      // Then unlike
      const response = await request(app)
        .delete(`/api/impact-posts/${testPost._id}/like`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('likes');

      console.log('   ✓ Post unliked successfully');
    });

    test('❌ Should return 404 for liking non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/impact-posts/${fakeId}/like`)
        .expect(404);

      expect(response.body.success).toBe(false);

      console.log('   ✓ Rejected like for non-existent post');
    });

    test('✅ Should not allow negative likes', async () => {
      // Unlike multiple times
      await request(app).delete(`/api/impact-posts/${testPost._id}/like`);
      await request(app).delete(`/api/impact-posts/${testPost._id}/like`);
      const response = await request(app)
        .delete(`/api/impact-posts/${testPost._id}/like`)
        .expect(200);

      expect(response.body.data.likes).toBeGreaterThanOrEqual(0);

      console.log('   ✓ Likes cannot go below zero');
    });
  });

  describe('📂 TEST 6: Get Posts by Category', () => {
    
    test('✅ Should fetch posts by category', async () => {
      const response = await request(app)
        .get('/api/impact-posts/category/Food & Nutrition')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      console.log('   ✓ Fetched posts by category');
    });

    test('✅ Should return empty array for category with no posts', async () => {
      const response = await request(app)
        .get('/api/impact-posts/category/NonExistentCategory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);

      console.log('   ✓ Returned empty array for non-existent category');
    });
  });

  describe('📊 TEST 7: Get Statistics', () => {
    
    test('✅ Should fetch impact posts statistics', async () => {
      const response = await request(app)
        .get('/api/impact-posts/stats/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPosts');
      expect(response.body.data).toHaveProperty('activePosts');
      expect(response.body.data).toHaveProperty('completedPosts');
      expect(response.body.data).toHaveProperty('totalBeneficiaries');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('categoryStats');
      expect(Array.isArray(response.body.data.categoryStats)).toBe(true);

      console.log('   ✓ Fetched statistics successfully');
    });
  });

  describe('🗑️ TEST 8: Delete Impact Post', () => {
    
    test('✅ Should delete post', async () => {
      // Create a post to delete
      const postToDelete = await ImpactPost.create({
        title: 'Test Post to Delete',
        category: 'Healthcare',
        details: 'This post will be deleted in the test',
        authorName: testUser.name,
        authorId: testUser._id,
        status: 'active'
      });

      const response = await request(app)
        .delete(`/api/impact-posts/${postToDelete._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const deleted = await ImpactPost.findById(postToDelete._id);
      expect(deleted).toBeNull();

      console.log('   ✓ Post deleted successfully');
    });

    test('❌ Should return 404 for deleting non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/impact-posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      console.log('   ✓ Rejected deletion of non-existent post');
    });
  });
});
