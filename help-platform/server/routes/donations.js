const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// ✅ FIXED: Initialize Razorpay with proper error handling
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

// ✅ FIXED: CREATE ORDER ENDPOINT with proper general donation handling
router.post('/create-order', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, message, campaignId } = req.body;
    
    console.log('📦 Creating donation order:', { amount, donorName, donorEmail, campaignId });
    
    // ✅ Validate Razorpay instance
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not initialized. Please contact support.'
      });
    }

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
    
    // ✅ CRITICAL FIX: Handle general vs campaign donations
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
        if (campaign.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Campaign is not active'
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
    
    // ✅ FIXED: Create Razorpay order with proper structure
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
    
    // ✅ FIXED: Proper error handling for Razorpay API call
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
    
    // ✅ CRITICAL FIX: Save donation record with null campaignId for general donations
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
        campaignId: actualCampaignId, // null for general, ObjectId for campaigns
        campaignTitle: campaignTitle,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      });
      await donation.save();
      console.log('✅ Donation record saved:', donation._id);
    } catch (saveError) {
      console.error('⚠️ Could not save donation record:', saveError.message);
      // Continue anyway - we'll handle it in verification
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

// ✅ CRITICAL FIX: VERIFY PAYMENT ENDPOINT - Properly handles general donations
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
    
    // ✅ FIXED: Signature verification
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

    // ✅ CRITICAL FIX: Update donation AND campaign in proper sequence
    let donation = null;
    let campaignUpdated = false;
    let updatedCampaign = null;
    
    try {
      const Donation = require('../models/Donation');
      const Campaign = require('../models/Campaign');
      
      // Find donation
      donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
      
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
    } catch (updateError) {
      console.error('❌ Error in donation/campaign update:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update donation records',
        error: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      });
    }
    
    // ✅ Send success response with updated campaign data
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
        paymentStatus: paymentDetails?.status || 'captured',
        campaignUpdated: campaignUpdated,
        updatedCampaign: updatedCampaign, // ✅ Return fresh campaign data
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

// ✅ TEST RAZORPAY CONNECTION
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
