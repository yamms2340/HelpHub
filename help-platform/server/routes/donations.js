const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// ✅ Initialize Razorpay with YOUR credentials
const razorpay = new Razorpay({
  key_id: 'rzp_test_RAWJZe53MZOrPx',
  key_secret: 'k0UoF2QyAUTjjoc8joMXGwGg',
});

console.log('🔧 Razorpay initialized successfully with key:', 'rzp_test_RAWJZe53MZOrPx');

// ✅ CREATE ORDER ENDPOINT
router.post('/create-order', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, message, campaignId } = req.body;
    
    console.log('📦 Creating donation order:', { amount, donorName, donorEmail, campaignId });
    
    // Validate amount
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

    // Validate required fields
    if (!donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Donor name and email are required'
      });
    }

    // Convert to paise
    const amountInPaise = Math.round(amountFloat * 100);
    
    // Generate unique receipt ID
    const receiptId = `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if campaignId exists and is valid
    let campaign = null;
    if (campaignId && campaignId !== 'main-campaign' && campaignId !== 'general') {
      try {
        const Campaign = require('../models/Campaign');
        campaign = await Campaign.findById(campaignId);
        if (!campaign) {
          return res.status(404).json({
            success: false,
            message: 'Campaign not found'
          });
        }
        if (campaign.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Campaign is not active'
          });
        }
      } catch (campaignError) {
        console.warn('⚠️ Campaign check failed:', campaignError.message);
      }
    }
    
    // Create Razorpay order
    const razorpayOrderData = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
        donorPhone: donorPhone || '',
        campaignId: campaignId || 'general',
        campaignTitle: campaign ? campaign.title : 'General Donation',
        platform: 'HelpHub'
      }
    };
    
    console.log('🎯 Creating Razorpay order with data:', razorpayOrderData);
    
    const razorpayOrder = await razorpay.orders.create(razorpayOrderData);
    
    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
    
    // Save transaction record (optional - create Donation model if needed)
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
        campaignId: campaignId || null,
        campaignTitle: campaign ? campaign.title : 'General Donation',
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      });
      await donation.save();
    } catch (saveError) {
      console.warn('⚠️ Could not save donation record:', saveError.message);
    }
    
    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: amountFloat,
        currency: 'INR',
        razorpayKeyId: 'rzp_test_RAWJZe53MZOrPx',
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

// ✅ VERIFY PAYMENT ENDPOINT
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
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification data' 
      });
    }
    
    // ✅ Signature verification with your secret
    const expectedSignature = crypto
      .createHmac('sha256', 'k0UoF2QyAUTjjoc8joMXGwGg')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
    // Fetch payment details
    let paymentDetails = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('💰 Payment verified:', {
        amount: `₹${paymentDetails.amount / 100}`,
        status: paymentDetails.status
      });
    } catch (fetchError) {
      console.warn('⚠️ Could not fetch payment details:', fetchError.message);
    }
    
    const paymentAmount = paymentDetails ? paymentDetails.amount / 100 : 0;

    // Update donation record and campaign (if applicable)
    try {
      const Donation = require('../models/Donation');
      const donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (donation) {
        donation.razorpayPaymentId = razorpay_payment_id;
        donation.razorpaySignature = razorpay_signature;
        donation.status = 'completed';
        donation.paidAt = new Date();
        await donation.save();

        // Update campaign if donation is for a specific campaign
        if (donation.campaignId && donation.campaignId !== 'general') {
          try {
            const Campaign = require('../models/Campaign');
            const campaign = await Campaign.findById(donation.campaignId);
            if (campaign) {
              campaign.donors.push({
                donor: donation._id,
                donorName: donation.donorName,
                donorEmail: donation.donorEmail,
                amount: donation.amount,
                transactionId: razorpay_payment_id,
                message: donation.message || '',
                donatedAt: new Date()
              });

              campaign.currentAmount += donation.amount;

              if (campaign.currentAmount >= campaign.targetAmount) {
                campaign.status = 'completed';
              }

              await campaign.save();
              console.log('✅ Campaign updated with donation');
            }
          } catch (campaignError) {
            console.error('❌ Error updating campaign:', campaignError);
          }
        }
      }
    } catch (updateError) {
      console.warn('⚠️ Could not update records:', updateError.message);
    }
    
    res.json({
      success: true,
      message: `Donation of ₹${paymentAmount} verified successfully! 🎉`,
      data: { 
        transactionId,
        razorpay_payment_id,
        razorpay_order_id,
        amount: paymentAmount,
        verified: true,
        paymentMethod: paymentDetails?.method || 'Unknown',
        paymentStatus: paymentDetails?.status || 'captured'
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

// ✅ TEST RAZORPAY CONNECTION
router.get('/test-razorpay', async (req, res) => {
  try {
    console.log('🧪 Testing Razorpay connection...');
    
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        purpose: 'Connection Test'
      }
    });
    
    res.json({
      success: true,
      message: '✅ Razorpay connection successful!',
      data: {
        keyId: 'rzp_test_RAWJZe53MZOrPx',
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
      keyId: 'rzp_test_RAWJZe53MZOrPx'
    });
  }
});

// Get all donations
router.get('/', async (req, res) => {
  try {
    const Donation = require('../models/Donation');
    const donations = await Donation.find({ status: 'completed' })
      .sort({ paidAt: -1 })
      .limit(100);

    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        donations,
        statistics: totalDonations[0] || { total: 0, count: 0 }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations'
    });
  }
});

module.exports = router;
