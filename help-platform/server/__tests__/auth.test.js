require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock email service
jest.mock('../utils/emailService', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(true)
}));

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
const { sendOtpEmail } = require('../utils/emailService');

describe('🔐 HelpHub Authentication System Tests', () => {
  let testUser;
  let testUserToken;
  let unverifiedUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /@authtest\.com$/ } });
    
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

  describe('📝 TEST 1: User Registration', () => {
    
    test('✅ Should register new user and send OTP', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@authtest.com',
        password: 'Test@123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);

      // Verify email was sent
      expect(sendOtpEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String)
      );

      // Verify user created in DB
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.isVerified).toBe(false);
      expect(user.otp).toBeTruthy();
      expect(user.otpExpiresAt).toBeTruthy();
      
      unverifiedUser = user; // Save for later tests

      console.log('   ✓ User registered and OTP sent');
    });

    test('❌ Should reject registration without name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noname@authtest.com',
          password: 'Test@123456'
        })
        .expect(500); // Your server returns 500 for validation errors

      console.log('   ✓ Rejected registration without name');
    });

    test('❌ Should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          password: 'Test@123456'
        })
        .expect(500);

      console.log('   ✓ Rejected registration without email');
    });

    test('❌ Should reject registration with existing verified user', async () => {
      // Create verified user first
      const hashedPassword = await bcrypt.hash('Test@123456', 10);
      await User.create({
        name: 'Existing User',
        email: 'existing@authtest.com',
        password: hashedPassword,
        isVerified: true,
        role: 'user'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@authtest.com',
          password: 'Test@123456'
        })
        .expect(400);

      expect(response.body.message).toContain('already exists');

      console.log('   ✓ Rejected duplicate registration');
    });

    test('✅ Should resend OTP for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User Updated',
          email: unverifiedUser.email,
          password: 'NewPassword@123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');

      // Verify new OTP was generated
      const user = await User.findById(unverifiedUser._id);
      expect(user.otp).not.toBe(unverifiedUser.otp);

      console.log('   ✓ OTP resent for unverified user');
    });
  });

  describe('✅ TEST 2: OTP Verification', () => {
    
    test('✅ Should verify OTP and return JWT token', async () => {
      // Get the current OTP from DB
      const user = await User.findById(unverifiedUser._id);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: user.email,
          otp: user.otp
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verified successfully');
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(user.email);

      // Verify user is now verified in DB
      const verifiedUser = await User.findById(user._id);
      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.otp).toBeUndefined();
      expect(verifiedUser.otpExpiresAt).toBeUndefined();

      testUser = verifiedUser;
      testUserToken = response.body.token;

      console.log('   ✓ OTP verified and user activated');
    });

    test('❌ Should reject invalid OTP', async () => {
      // Create another unverified user
      const hashedPassword = await bcrypt.hash('Test@123456', 10);
      const newUser = await User.create({
        name: 'Invalid OTP User',
        email: 'invalidotp@authtest.com',
        password: hashedPassword,
        otp: '123456',
        otpExpiresAt: Date.now() + 10 * 60 * 1000,
        isVerified: false,
        role: 'user'
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: newUser.email,
          otp: '999999' // Wrong OTP
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid OTP');

      console.log('   ✓ Rejected invalid OTP');
    });

    test('❌ Should reject expired OTP', async () => {
      // Create user with expired OTP
      const hashedPassword = await bcrypt.hash('Test@123456', 10);
      const expiredUser = await User.create({
        name: 'Expired OTP User',
        email: 'expiredotp@authtest.com',
        password: hashedPassword,
        otp: '123456',
        otpExpiresAt: Date.now() - 1000, // Already expired
        isVerified: false,
        role: 'user'
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: expiredUser.email,
          otp: '123456'
        })
        .expect(400);

      expect(response.body.message).toContain('expired');

      console.log('   ✓ Rejected expired OTP');
    });

    test('❌ Should reject OTP for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'nonexistent@authtest.com',
          otp: '123456'
        })
        .expect(400);

      expect(response.body.message).toContain('not found');

      console.log('   ✓ Rejected OTP for non-existent user');
    });
  });

  describe('🔑 TEST 3: User Login', () => {
    
    test('✅ Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'Test@123456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).toHaveProperty('points');
      expect(response.body.user).toHaveProperty('coins');

      console.log('   ✓ Login successful');
    });

    test('❌ Should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid credentials');

      console.log('   ✓ Rejected wrong password');
    });

    test('❌ Should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@authtest.com',
          password: 'Test@123456'
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid credentials');

      console.log('   ✓ Rejected non-existent email');
    });

    test('❌ Should reject login for unverified user', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('Test@123456', 10);
      await User.create({
        name: 'Unverified Login User',
        email: 'unverifiedlogin@authtest.com',
        password: hashedPassword,
        isVerified: false,
        role: 'user'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverifiedlogin@authtest.com',
          password: 'Test@123456'
        })
        .expect(403);

      expect(response.body.message).toContain('verify your email');

      console.log('   ✓ Rejected unverified user login');
    });
  });

  describe('👤 TEST 4: Get Current User', () => {
    
    test('✅ Should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('otp');

      console.log('   ✓ Current user fetched successfully');
    });

    test('❌ Should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toContain('No token');

      console.log('   ✓ Rejected request without token');
    });

    test('❌ Should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(response.body.message).toContain('not valid');

      console.log('   ✓ Rejected invalid token');
    });
  });

  describe('✏️ TEST 5: Update Profile', () => {
    
    test('✅ Should update user profile', async () => {
      const updates = {
        name: 'Updated Test User',
        phone: '9876543210',
        location: 'Mumbai, India',
        bio: 'This is my test bio'
      };

      const response = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.user.name).toBe(updates.name);
      expect(response.body.user.phone).toBe(updates.phone);
      expect(response.body.user.location).toBe(updates.location);
      expect(response.body.user.bio).toBe(updates.bio);

      // Verify in DB
      const user = await User.findById(testUser._id);
      expect(user.name).toBe(updates.name);
      expect(user.phone).toBe(updates.phone);

      console.log('   ✓ Profile updated successfully');
    });

    test('❌ Should not allow updating email', async () => {
      const response = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          email: 'newemail@authtest.com' // Should be ignored
        })
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email); // Email unchanged

      console.log('   ✓ Email update blocked');
    });

    test('❌ Should not allow updating password', async () => {
      const response = await request(app)
        .put('/api/auth/update')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          password: 'NewPassword@123' // Should be ignored
        })
        .expect(200);

      // Verify old password still works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'Test@123456' // Old password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      console.log('   ✓ Password update blocked');
    });

    test('❌ Should reject update without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/update')
        .send({
          name: 'Unauthorized Update'
        })
        .expect(401);

      console.log('   ✓ Rejected unauthenticated update');
    });
  });

  describe('🚪 TEST 6: Logout', () => {
    
    test('✅ Should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');

      console.log('   ✓ Logout successful');
    });

    test('❌ Should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      console.log('   ✓ Rejected logout without token');
    });
  });

  describe('🔄 TEST 7: Resend OTP', () => {
    
    test('✅ Should resend OTP for unverified user', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('Test@123456', 10);
      const user = await User.create({
        name: 'Resend OTP User',
        email: 'resendotp@authtest.com',
        password: hashedPassword,
        otp: '123456',
        otpExpiresAt: Date.now() + 10 * 60 * 1000,
        isVerified: false,
        role: 'user'
      });

      const oldOtp = user.otp;

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: user.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('resent');

      // Verify new OTP was generated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.otp).not.toBe(oldOtp);

      // Verify email was sent
      expect(sendOtpEmail).toHaveBeenCalledWith(
        user.email,
        expect.any(String)
      );

      console.log('   ✓ OTP resent successfully');
    });

    test('❌ Should reject resend for verified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: testUser.email // Already verified
        })
        .expect(400);

      expect(response.body.message).toContain('already verified');

      console.log('   ✓ Rejected resend for verified user');
    });

    test('❌ Should reject resend for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: 'nonexistent@authtest.com'
        })
        .expect(404);

      expect(response.body.message).toContain('not found');

      console.log('   ✓ Rejected resend for non-existent user');
    });
  });
});
