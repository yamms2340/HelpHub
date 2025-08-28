const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_RAWJZe53MZOrPx',
  key_secret: 'k0UoF2QyAUTjjoc8joMXGwGg',
});

console.log('🔧 Razorpay initialized successfully with key:', 'rzp_test_RAWJZe53MZOrPx');

// Create donation order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, message, campaignId } = req.body;
    
    console.log('📦 Creating donation order:', { amount, donorName, donorEmail });
    
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

    // Convert to paise
    const amountInPaise = Math.round(amountFloat * 100);
    
    if (amountInPaise < 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minimum amount is ₹1' 
      });
    }

    // Generate unique receipt ID
    const receiptId = `DONATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Razorpay order
    const razorpayOrderData = {
      amount: amountInPaise, // Integer paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
        campaignId: campaignId || 'general',
        platform: 'HelpHub'
      }
    };
    
    console.log('🎯 Creating Razorpay order with data:', razorpayOrderData);
    
    const razorpayOrder = await razorpay.orders.create(razorpayOrderData);
    
    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
    
    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: amountFloat, // Original amount in rupees
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
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Verify payment
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

// Test Razorpay connection
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

module.exports = router;
