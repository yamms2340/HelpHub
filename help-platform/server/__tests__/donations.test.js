require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// Mock the email queue
jest.mock('../queues/emailQueue', () => ({
  add: jest.fn().mockResolvedValue({ id: 'job-123' })
}));

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 50000,
        currency: 'INR',
        status: 'created'
      })
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: 'pay_test123',
        amount: 50000,
        status: 'captured',
        method: 'upi'
      })
    }
  }));
});

// Import app AFTER mocks
const app = require('../server');

describe('🚀 HelpHub Donation System Tests', () => {
  
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://yaminireddy:yamini@cluster0.morp0a9.mongodb.net/helpplatform-test?retryWrites=true&w=majority';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    console.log('\n✅ Connected to test database:', mongoose.connection.name);
  });

  afterAll(async () => {
    // Clean up test data
    await Donation.deleteMany({ donorEmail: { $regex: /@test\.com$/ } });
    await Campaign.deleteMany({ title: { $regex: /^Test/ } });
    
    await mongoose.connection.close();
    console.log('✅ Test database cleaned and disconnected\n');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📝 TEST 1: Create Donation Order', () => {
    
    test('✅ Should create order with valid donation data', async () => {
      const donationData = {
        amount: 500,
        donorName: 'Jest Test User',
        donorEmail: 'jesttest@test.com',
        donorPhone: '9876543210',
        campaignId: 'general'
      };

      const response = await request(app)
        .post('/api/donations/create-order')
        .send(donationData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data.amount).toBe(500);
      expect(response.body.data.currency).toBe('INR');
      expect(response.body.data.razorpayKeyId).toBeDefined();
      
      console.log('   ✓ Order created successfully');
    });

    test('❌ Should reject donation with amount < ₹1', async () => {
      const response = await request(app)
        .post('/api/donations/create-order')
        .send({
          amount: 0.5,
          donorName: 'Invalid User',
          donorEmail: 'invalid@test.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least ₹1');
      
      console.log('   ✓ Rejected amount < ₹1');
    });

    test('❌ Should reject donation > ₹1,00,000', async () => {
      const response = await request(app)
        .post('/api/donations/create-order')
        .send({
          amount: 150000,
          donorName: 'Rich User',
          donorEmail: 'rich@test.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Maximum');
      
      console.log('   ✓ Rejected amount > ₹1,00,000');
    });

    test('❌ Should reject without donor name', async () => {
      const response = await request(app)
        .post('/api/donations/create-order')
        .send({
          amount: 500,
          donorEmail: 'noname@test.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Donor name and email are required');
      
      console.log('   ✓ Rejected missing donor name');
    });

    test('❌ Should reject without donor email', async () => {
      const response = await request(app)
        .post('/api/donations/create-order')
        .send({
          amount: 500,
          donorName: 'No Email User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Donor name and email are required');
      
      console.log('   ✓ Rejected missing donor email');
    });
  });

  describe('🔐 TEST 2: Verify Payment Signature', () => {
    
    test('✅ Should verify payment with valid signature', async () => {
      const orderId = 'order_verify_test_123';
      const paymentId = 'pay_verify_test_123';
      
      // Generate VALID signature using your actual secret
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Create pending donation first
      await Donation.create({
        orderId: orderId,
        razorpayOrderId: orderId,
        amount: 750,
        currency: 'INR',
        donorName: 'Payment Verify User',
        donorEmail: 'verify@test.com',
        campaignTitle: 'General Donation',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verified).toBe(true);
      expect(response.body.data.amount).toBe(500); // Mocked amount
      
      // Verify donation was updated in database
      const updatedDonation = await Donation.findOne({ razorpayOrderId: orderId });
      expect(updatedDonation.status).toBe('completed');
      expect(updatedDonation.razorpayPaymentId).toBe(paymentId);
      expect(updatedDonation.paidAt).toBeDefined();
      
      console.log('   ✓ Payment verified and donation updated');
    });

    test('❌ Should reject payment with invalid signature', async () => {
      const response = await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_order_id: 'order_fake_123',
          razorpay_payment_id: 'pay_fake_123',
          razorpay_signature: 'completely_wrong_signature_12345'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('invalid signature');
      
      console.log('   ✓ Rejected invalid signature');
    });

    test('❌ Should reject payment without order_id', async () => {
      const response = await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_payment_id: 'pay_test',
          razorpay_signature: 'sig_test'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing payment verification data');
      
      console.log('   ✓ Rejected missing order_id');
    });
  });

  describe('🎯 TEST 3: Campaign Integration', () => {
    
    test('✅ Should update campaign when donation is verified', async () => {
      // 1. Create test campaign with ALL required fields
      const campaign = await Campaign.create({
        title: 'Test Campaign for Donation',
        description: 'Testing campaign update on donation',
        targetAmount: 10000,
        currentAmount: 0,
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(),
        creator: new mongoose.Types.ObjectId(), // ✅ ADDED
        category: 'Education', // ✅ ADDED
        donors: []
      });

      const orderId = 'order_campaign_test_456';
      const paymentId = 'pay_campaign_test_456';
      
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // 2. Create donation linked to campaign
      await Donation.create({
        orderId: orderId,
        razorpayOrderId: orderId,
        amount: 1500,
        currency: 'INR',
        donorName: 'Campaign Donor',
        donorEmail: 'campaigndonor@test.com',
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        status: 'pending'
      });

      // 3. Verify payment
      const response = await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.campaignUpdated).toBe(true);

      // 4. Verify campaign was updated in database
      const updatedCampaign = await Campaign.findById(campaign._id);
      expect(updatedCampaign.currentAmount).toBe(1500);
      expect(updatedCampaign.donors.length).toBe(1);
      expect(updatedCampaign.donors[0].amount).toBe(1500);
      expect(updatedCampaign.donors[0].donorName).toBe('Campaign Donor');
      
      console.log('   ✓ Campaign updated with donation');
    });

    test('✅ Should mark campaign as completed when target reached', async () => {
      // Create campaign with low target
      const campaign = await Campaign.create({
        title: 'Test Completion Campaign',
        description: 'Testing campaign completion',
        targetAmount: 1000,
        currentAmount: 500,
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(),
        creator: new mongoose.Types.ObjectId(), // ✅ ADDED
        category: 'Healthcare', // ✅ ADDED
        donors: []
      });

      const orderId = 'order_complete_test_789';
      const paymentId = 'pay_complete_test_789';
      
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Donation that will complete the campaign (500 + 600 = 1100 >= 1000)
      await Donation.create({
        orderId: orderId,
        razorpayOrderId: orderId,
        amount: 600,
        currency: 'INR',
        donorName: 'Final Donor',
        donorEmail: 'final@test.com',
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        status: 'pending'
      });

      await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
        .expect(200);

      const completedCampaign = await Campaign.findById(campaign._id);
      expect(completedCampaign.currentAmount).toBeGreaterThanOrEqual(completedCampaign.targetAmount);
      expect(completedCampaign.status).toBe('completed');
      
      console.log('   ✓ Campaign marked as completed');
    });
  });

  describe('📧 TEST 4: Email Queue Integration', () => {
    
    test('✅ Should add email job to queue after successful payment', async () => {
      const emailQueue = require('../queues/emailQueue');
      
      const orderId = 'order_email_test_999';
      const paymentId = 'pay_email_test_999';
      
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      await Donation.create({
        orderId: orderId,
        razorpayOrderId: orderId,
        amount: 999,
        currency: 'INR',
        donorName: 'Email Test User',
        donorEmail: 'emailtest@test.com',
        status: 'pending'
      });

      await request(app)
        .post('/api/donations/verify-payment')
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
        .expect(200);

      // Verify email queue was called with correct data
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-donation-email',
        expect.objectContaining({
          email: 'emailtest@test.com',
          donorName: 'Email Test User',
          amount: 999
        })
      );
      
      console.log('   ✓ Email job queued successfully');
    });
  });

  describe('📊 TEST 5: Get Donations', () => {
    
    test('✅ Should fetch completed donations', async () => {
      const response = await request(app)
        .get('/api/donations?status=completed&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('donations');
      expect(response.body.data).toHaveProperty('statistics');
      expect(Array.isArray(response.body.data.donations)).toBe(true);
      
      console.log('   ✓ Fetched donations list');
    });
  });
});
