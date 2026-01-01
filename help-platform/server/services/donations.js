const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const cacheService = require('./cache');

class DonationError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ✅ Initialize Razorpay with proper error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'k0UoF2QyAUTjjoc8joMXGwGg',
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error);
}

const donationService = {
  async createDonationOrder(orderData) {
    const { amount, donorName, donorEmail, donorPhone, message, campaignId } = orderData;
    
    // ✅ Validate Razorpay instance
    if (!razorpay) {
      throw new DonationError(
        'Payment gateway not initialized. Please contact support.',
        500
      );
    }

    // Validate amount
    const amountFloat = parseFloat(amount);
    if (!amountFloat || amountFloat < 1) {
      throw new DonationError('Amount must be at least ₹1', 400);
    }

    if (amountFloat > 100000) {
      throw new DonationError('Maximum donation amount is ₹1,00,000', 400);
    }

    // Validate required fields
    if (!donorName || !donorEmail) {
      throw new DonationError('Donor name and email are required', 400);
    }

    // Convert to paise
    const amountInPaise = Math.round(amountFloat * 100);
    
    // Generate unique receipt ID
    const receiptId = `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ CRITICAL: Handle general vs campaign donations
    const isGeneralDonation = !campaignId || campaignId === 'general';
    let campaign = null;
    let actualCampaignId = null;
    let campaignTitle = 'General Donation';
    
    if (!isGeneralDonation) {
      // Try cache first
      const cacheKey = `campaign:${campaignId}`;
      campaign = await cacheService.get(cacheKey);
      
      if (!campaign) {
        try {
          campaign = await Campaign.findById(campaignId);
          if (campaign) {
            // Cache for 5 minutes
            await cacheService.set(cacheKey, campaign, 300);
          }
        } catch (campaignError) {
          console.warn('⚠️ Campaign check failed:', campaignError.message);
        }
      }
      
      if (!campaign) {
        throw new DonationError('Campaign not found', 404);
      }
      if (campaign.status !== 'active') {
        throw new DonationError('Campaign is not active', 400);
      }
      actualCampaignId = campaignId;
      campaignTitle = campaign.title;
    }
    
    // ✅ Create Razorpay order with proper structure
    const razorpayOrderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
        donorPhone: donorPhone || '',
        campaignId: isGeneralDonation ? 'general' : campaignId,
        campaignTitle: campaignTitle,
        platform: 'HelpHub'
      }
    };
    
    console.log('🎯 Creating Razorpay order with data:', razorpayOrderData);
    
    // ✅ Proper error handling for Razorpay API call
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(razorpayOrderData);
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', razorpayError);
      throw new DonationError(
        razorpayError.error?.description || 'Failed to create payment order. Please try again.',
        500,
        process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      );
    }
    
    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
    
    // ✅ Save donation record with null campaignId for general donations
    try {
      const donation = new Donation({
        orderId: razorpayOrder.id,
        amount: amountFloat,
        currency: 'INR',
        donorName,
        donorEmail,
        donorPhone: donorPhone || '',
        message: message || '',
        campaignId: actualCampaignId, // null for general, ObjectId for campaigns
        campaignTitle: campaignTitle,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      });
      await donation.save();
      
      // Cache pending donation for verification (30 minutes)
      await cacheService.set(`donation:pending:${razorpayOrder.id}`, donation, 1800);
      
      console.log('✅ Donation record saved:', donation._id);
    } catch (saveError) {
      console.error('⚠️ Could not save donation record:', saveError.message);
      // Continue anyway - we'll handle it in verification
    }
    
    return {
      orderId: razorpayOrder.id,
      amount: amountFloat,
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx',
      transactionId: receiptId
    };
  },

  async verifyDonationPayment(paymentData) {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      transactionId 
    } = paymentData;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new DonationError('Missing payment verification data', 400);
    }
    
    // ✅ Signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'k0UoF2QyAUTjjoc8joMXGwGg';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      throw new DonationError('Payment verification failed - invalid signature', 400);
    }
    
    console.log('✅ Signature verified successfully');
    
    // ✅ Fetch payment details from Razorpay
    let paymentDetails = null;
    let paymentAmount = 0;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      paymentAmount = paymentDetails.amount / 100;
      console.log('💰 Payment verified:', {
        amount: `₹${paymentAmount}`,
        status: paymentDetails.status
      });
    } catch (fetchError) {
      console.warn('⚠️ Could not fetch payment details:', fetchError.message);
    }

    // ✅ CRITICAL: Update donation AND campaign in proper sequence
    let donation = null;
    let campaignUpdated = false;
    let updatedCampaign = null;
    
    try {
      // Try to get from cache first
      donation = await cacheService.get(`donation:pending:${razorpay_order_id}`);
      
      if (!donation) {
        donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
      }
      
      if (!donation) {
        // ✅ Create donation if not found (fallback)
        console.warn('❌ Donation not found, creating new record for order:', razorpay_order_id);
        
        const isGeneralDonation = !paymentDetails.notes.campaignId || 
                                  paymentDetails.notes.campaignId === 'general';
        
        donation = new Donation({
          orderId: razorpay_order_id,
          amount: paymentAmount,
          currency: 'INR',
          donorName: paymentDetails.notes.donorName || 'Anonymous',
          donorEmail: paymentDetails.notes.donorEmail || '',
          donorPhone: paymentDetails.notes.donorPhone || '',
          message: '',
          campaignId: isGeneralDonation ? null : paymentDetails.notes.campaignId,
          campaignTitle: paymentDetails.notes.campaignTitle || 'General Donation',
          status: 'pending',
          razorpayOrderId: razorpay_order_id
        });
      }

      // Update donation status
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature;
      donation.status = 'completed';
      donation.paidAt = new Date();
      await donation.save();
      
      // Clean up pending cache
      await cacheService.del(`donation:pending:${razorpay_order_id}`);
      
      console.log('✅ Donation record updated:', donation._id);

      // ✅ CRITICAL: Update campaign ONLY if campaignId exists (not null and not general)
      if (donation.campaignId) {
        try {
          const campaign = await Campaign.findById(donation.campaignId);
          
          if (campaign) {
            console.log('📊 Before update:', {
              campaignId: campaign._id,
              currentAmount: campaign.currentAmount,
              donationAmount: donation.amount
            });
            
            // Add donor to campaign
            campaign.donors.push({
              donor: donation._id,
              donorName: donation.donorName,
              donorEmail: donation.donorEmail,
              amount: donation.amount,
              transactionId: razorpay_payment_id,
              message: donation.message || '',
              donatedAt: new Date()
            });

            // ✅ CRITICAL: Properly increment current amount
            const previousAmount = campaign.currentAmount || 0;
            campaign.currentAmount = previousAmount + donation.amount;
            
            console.log('💰 After calculation:', {
              previousAmount,
              donationAmount: donation.amount,
              newAmount: campaign.currentAmount,
              targetAmount: campaign.targetAmount
            });

            // Check if campaign target is reached
            if (campaign.currentAmount >= campaign.targetAmount && campaign.status === 'active') {
              campaign.status = 'completed';
              console.log('🎉 Campaign completed!');
            }

            // ✅ CRITICAL: Save campaign changes
            await campaign.save();
            campaignUpdated = true;
            
            // Fetch fresh campaign data to return
            updatedCampaign = await Campaign.findById(campaign._id)
              .select('_id title currentAmount targetAmount status donors')
              .lean();
            
            // Invalidate campaign caches
            await cacheService.del(`campaign:${donation.campaignId}`);
            await cacheService.del('campaigns:active');
            await cacheService.del('campaigns:stats');
            await cacheService.del(`campaign:${donation.campaignId}:donations`);
            
            console.log('✅ Campaign updated successfully:', {
              id: updatedCampaign._id,
              currentAmount: updatedCampaign.currentAmount,
              targetAmount: updatedCampaign.targetAmount,
              donorsCount: updatedCampaign.donors.length
            });
          } else {
            console.warn('⚠️ Campaign not found:', donation.campaignId);
          }
        } catch (campaignError) {
          console.error('❌ Error updating campaign:', campaignError);
          // Continue - don't fail verification if campaign update fails
        }
      } else {
        console.log('ℹ️ General donation - no specific campaign to update');
      }
      
      // Invalidate donation stats cache
      await cacheService.del('donations:stats');
      await cacheService.del('donations:all');
      
    } catch (updateError) {
      console.error('❌ Error in donation/campaign update:', updateError);
      throw new DonationError(
        'Failed to update donation records',
        500,
        process.env.NODE_ENV === 'development' ? updateError.message : undefined
      );
    }
    
    return { 
      transactionId,
      razorpay_payment_id,
      razorpay_order_id,
      amount: paymentAmount,
      verified: true,
      paymentMethod: paymentDetails?.method || 'Unknown',
      paymentStatus: paymentDetails?.status || 'captured',
      campaignUpdated: campaignUpdated,
      updatedCampaign: updatedCampaign,
      donationId: donation?._id
    };
  },

  async testRazorpayConnection() {
    if (!razorpay) {
      throw new DonationError('Razorpay not initialized', 500);
    }
    
    const testOrder = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: { purpose: 'Connection Test' }
    });
    
    return {
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx',
      testOrderId: testOrder.id,
      testAmount: '₹1.00',
      status: testOrder.status,
      timestamp: new Date().toISOString()
    };
  },

  async getAllDonations() {
    const cacheKey = 'donations:all';
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const donations = await Donation.find({ status: 'completed' })
      .sort({ paidAt: -1 })
      .limit(100);

    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const result = {
      donations,
      statistics: totalDonations[0] || { total: 0, count: 0 }
    };

    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, 120);

    return result;
  }
};

module.exports = donationService;
