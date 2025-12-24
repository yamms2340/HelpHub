const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================================
   🏦 GET ALL DONATIONS
================================ */
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('campaignId', 'title targetAmount currentAmount')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('❌ Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations'
    });
  }
});

/* ================================
   💰 CREATE DONATION ORDER
================================ */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, campaignId = 'general' } = req.body;

    console.log('📦 Creating donation order:', {
      amount,
      donorName,
      donorEmail,
      campaignId
    });

    // Validate amount (min ₹10)
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is ₹10'
      });
    }

    // Get campaign details if provided
    let campaignTitle = 'General Donation';
    let campaign = null;
    
    if (campaignId !== 'general') {
      campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaignTitle = campaign.title;
      }
    }

    // 1. Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        donorName,
        donorEmail,
        donorPhone: donorPhone || '',
        campaignId,
        campaignTitle,
        platform: 'HelpHub'
      }
    };

    console.log('🎯 Creating Razorpay order with data:', orderOptions);

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);

    // 2. Save pending donation record
    const donation = new Donation({
      razorpayOrderId: razorpayOrder.id,
      amount,
      donorName,
      donorEmail,
      donorPhone: donorPhone || '',
      campaignId: campaignId === 'general' ? null : campaignId,
      status: 'pending'
    });

    await donation.save();
    console.log('✅ Donation record saved:', donation._id);

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      },
      key: process.env.RAZORPAY_KEY_ID,
      donationId: donation._id
    });

  } catch (error) {
    console.error('💥 Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation order',
      error: error.message
    });
  }
});

/* ================================
   ✅ VERIFY PAYMENT
================================ */
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationId } = req.body;

    console.log('🔍 Verifying payment:', { razorpayOrderId, razorpayPaymentId, donationId });

    // 1. Verify Razorpay signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // 2. Update donation as successful
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    donation.razorpayPaymentId = razorpayPaymentId;
    donation.status = 'completed';
    donation.completedAt = new Date();

    await donation.save();
    console.log('✅ Donation marked as completed:', donationId);

    // 3. Update campaign (if applicable)
    if (donation.campaignId) {
      await Campaign.findByIdAndUpdate(donation.campaignId, {
        $inc: { currentAmount: donation.amount },
        $push: { donors: {
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          amount: donation.amount,
          date: donation.completedAt
        }}
      });
      console.log('✅ Campaign updated:', donation.campaignId);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      donation: {
        id: donation._id,
        amount: donation.amount,
        status: donation.status
      }
    });

  } catch (error) {
    console.error('💥 Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

/* ================================
   📊 DONATION STATS
================================ */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalCompletedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalDonations: 0,
        totalAmount: 0,
        completedDonations: 0,
        totalCompletedAmount: 0
      }
    });
  } catch (error) {
    console.error('❌ Donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation stats'
    });
  }
});

module.exports = router;
