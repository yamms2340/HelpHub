const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const cacheService = require('../services/cache');
const emailQueue = require('../queues/emailQueue');

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

// ==================== CREATE ORDER ====================
router.post('/create-order', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, message, campaignId } = req.body;
    
    console.log('📦 Creating donation order:', { amount, donorName, donorEmail, campaignId });
    
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not initialized. Please contact support.'
      });
    }

    const amountFloat = parseFloat(amount);
    if (!amountFloat || amountFloat < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be at least ₹1' 
      });
    }

    if (amountFloat > 100000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum donation amount is ₹1,00,000' 
      });
    }

    if (!donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Donor name and email are required'
      });
    }

    const amountInPaise = Math.round(amountFloat * 100);
    const receiptId = `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const isGeneralDonation = !campaignId || campaignId === 'general';
    let campaign = null;
    let actualCampaignId = null;
    let campaignTitle = 'General Donation';
    
    if (!isGeneralDonation) {
      try {
        const Campaign = require('../models/Campaign');
        campaign = await Campaign.findById(campaignId);
        
        if (!campaign) {
          return res.status(404).json({
            success: false,
            message: 'Campaign not found'
          });
        }
        
        // ✅ CHECK IF CAMPAIGN IS ACTIVE AND NOT COMPLETED
        if (campaign.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: campaign.status === 'completed' 
              ? 'This campaign has already reached its target and is now closed. Thank you for your interest!' 
              : 'Campaign is not active'
          });
        }
        
        // ✅ CHECK IF DONATION WOULD EXCEED TARGET (OPTIONAL - ALLOW OVERFUNDING)
        const potentialTotal = campaign.currentAmount + amountFloat;
        if (potentialTotal > campaign.targetAmount * 1.1) { // Allow 10% overfunding
          return res.status(400).json({
            success: false,
            message: `This campaign only needs ₹${Math.max(0, campaign.targetAmount - campaign.currentAmount).toFixed(2)} more to reach its target. Please adjust your donation amount.`,
            remainingAmount: Math.max(0, campaign.targetAmount - campaign.currentAmount)
          });
        }
        
        actualCampaignId = campaignId;
        campaignTitle = campaign.title;
      } catch (campaignError) {
        console.warn('⚠️ Campaign check failed:', campaignError.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid campaign'
        });
      }
    }
    
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
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(razorpayOrderData);
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: razorpayError.error?.description || 'Failed to create payment order. Please try again.',
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      });
    }
    
    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
    
    try {
      const Donation = require('../models/Donation');
      const donation = new Donation({
        orderId: razorpayOrder.id,
        amount: amountFloat,
        currency: 'INR',
        donorName,
        donorEmail,
        donorPhone: donorPhone || '',
        message: message || '',
        campaignId: actualCampaignId,
        campaignTitle: campaignTitle,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      });
      await donation.save();
      console.log('✅ Donation record saved:', donation._id);
    } catch (saveError) {
      console.error('⚠️ Could not save donation record:', saveError.message);
    }
    
    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: amountFloat,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx',
        transactionId: receiptId
      },
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('❌ Create order error:', error);
    
    let errorMessage = 'Failed to create payment order';
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// ==================== VERIFY PAYMENT ====================
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      transactionId 
    } = req.body;
    
    console.log('🔍 Verifying payment:', { 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id 
    });
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification data' 
      });
    }
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'k0UoF2QyAUTjjoc8joMXGwGg';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed - invalid signature' 
      });
    }
    
    console.log('✅ Signature verified successfully');
    
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

    let donation = null;
    let campaignUpdated = false;
    let updatedCampaign = null;
    let campaignCompleted = false;
    
    try {
      const Donation = require('../models/Donation');
      const Campaign = require('../models/Campaign');
      
      donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (!donation) {
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

      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature;
      donation.status = 'completed';
      donation.paidAt = new Date();
      await donation.save();
      console.log('✅ Donation record updated:', donation._id);

      // ✅ UPDATE CAMPAIGN AND AUTO-COMPLETE IF TARGET REACHED
      if (donation.campaignId) {
        try {
          const campaign = await Campaign.findById(donation.campaignId);
          
          if (campaign) {
            console.log('📊 Before update:', {
              campaignId: campaign._id,
              currentAmount: campaign.currentAmount,
              donationAmount: donation.amount,
              targetAmount: campaign.targetAmount
            });
            
            campaign.donors.push({
              donor: donation._id,
              donorName: donation.donorName,
              donorEmail: donation.donorEmail,
              amount: donation.amount,
              transactionId: razorpay_payment_id,
              message: donation.message || '',
              donatedAt: new Date()
            });

            const previousAmount = campaign.currentAmount || 0;
            campaign.currentAmount = previousAmount + donation.amount;
            
            console.log('💰 After calculation:', {
              previousAmount,
              donationAmount: donation.amount,
              newAmount: campaign.currentAmount,
              targetAmount: campaign.targetAmount
            });

            // ✅ AUTO-COMPLETE CAMPAIGN WHEN TARGET REACHED
            if (campaign.currentAmount >= campaign.targetAmount && campaign.status === 'active') {
              campaign.status = 'completed';
              campaign.completedAt = new Date();
              campaignCompleted = true;
              console.log('🎉 Campaign COMPLETED and CLOSED! Target reached:', campaign.title);
              console.log(`   Final Amount: ₹${campaign.currentAmount} / ₹${campaign.targetAmount}`);
            }

            await campaign.save();
            campaignUpdated = true;
            
            updatedCampaign = await Campaign.findById(campaign._id)
              .select('_id title currentAmount targetAmount status completedAt donors')
              .lean();
            
            console.log('✅ Campaign updated successfully:', {
              id: updatedCampaign._id,
              currentAmount: updatedCampaign.currentAmount,
              targetAmount: updatedCampaign.targetAmount,
              status: updatedCampaign.status,
              donorsCount: updatedCampaign.donors.length,
              completed: campaignCompleted
            });

            await cacheService.del(`campaign:${donation.campaignId}`);
            await cacheService.del(`campaign:${donation.campaignId}:donations`);
            await cacheService.delPattern('campaigns:*');
            console.log('🗑️ Campaign caches invalidated after donation');
          } else {
            console.warn('⚠️ Campaign not found:', donation.campaignId);
          }
        } catch (campaignError) {
          console.error('❌ Error updating campaign:', campaignError);
        }
      } else {
        console.log('ℹ️ General donation - no specific campaign to update');
      }

      // ✅ SEND EMAIL
      if (donation.donorEmail) {
        const emailPaymentDetails = {
          email: donation.donorEmail,
          donorName: donation.donorName,
          amount: donation.amount,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          campaignName: donation.campaignTitle || 'General Donation',
          method: paymentDetails?.method || 'Online Payment',
          campaignCompleted: campaignCompleted
        };

        await emailQueue.add('send-donation-email', emailPaymentDetails);
        console.log('📧 Email job queued for:', donation.donorEmail);
      }

      await cacheService.delPattern('donations:*');
      console.log('🗑️ Donations cache invalidated');

    } catch (updateError) {
      console.error('❌ Error in donation/campaign update:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update donation records',
        error: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      });
    }
    
    res.json({
      success: true,
      message: campaignCompleted 
        ? `Donation of ₹${paymentAmount} verified! 🎉 Campaign has reached its target and is now completed!`
        : `Donation of ₹${paymentAmount} verified successfully! 🎉`,
      data: { 
        transactionId,
        razorpay_payment_id,
        razorpay_order_id,
        amount: paymentAmount,
        verified: true,
        paymentMethod: paymentDetails?.method || 'Unknown',
        paymentStatus: paymentDetails?.status || 'captured',
        campaignUpdated: campaignUpdated,
        campaignCompleted: campaignCompleted,
        updatedCampaign: updatedCampaign,
        donationId: donation?._id
      }
    });
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Verification error'
    });
  }
});

// ==================== GET ALL DONATIONS ====================
router.get('/', async (req, res) => {
  try {
    const { limit = 100, page = 1, status = 'completed' } = req.query;

    const cacheKey = `donations:${status}:page${page}:limit${limit}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Donations served from cache');
      return res.json({
        success: true,
        data: cached
      });
    }

    const Donation = require('../models/Donation');
    
    const donations = await Donation.find({ status })
      .sort({ paidAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const result = {
      donations,
      statistics: totalDonations[0] || { total: 0, count: 0 }
    };

    console.log(`✅ Fetched ${donations.length} donations from DB`);

    await cacheService.set(cacheKey, result, 180);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations'
    });
  }
});

// ==================== TEST RAZORPAY ====================
router.get('/test-razorpay', async (req, res) => {
  try {
    console.log('🧪 Testing Razorpay connection...');
    
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: '❌ Razorpay not initialized',
      });
    }
    
    const testOrder = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: { purpose: 'Connection Test' }
    });
    
    res.json({
      success: true,
      message: '✅ Razorpay connection successful!',
      data: {
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx',
        testOrderId: testOrder.id,
        testAmount: '₹1.00',
        status: testOrder.status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Razorpay test failed:', error);
    res.status(500).json({
      success: false,
      message: '❌ Razorpay connection failed',
      error: error.message,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RAWJZe53MZOrPx'
    });
  }
});

module.exports = router;
