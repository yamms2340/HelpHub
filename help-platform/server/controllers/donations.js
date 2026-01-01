const donationService = require('../services/donations');

const donationController = {
  async createDonationOrder(req, res) {
    try {
      const { amount, donorName, donorEmail, donorPhone, message, campaignId } = req.body;
      
      console.log('📦 Creating donation order:', { amount, donorName, donorEmail, campaignId });
      
      const orderData = await donationService.createDonationOrder({
        amount,
        donorName,
        donorEmail,
        donorPhone,
        message,
        campaignId
      });
      
      res.json({
        success: true,
        data: orderData,
        message: 'Order created successfully'
      });
      
    } catch (error) {
      console.error('❌ Create order error:', error);
      
      const statusCode = error.statusCode || 500;
      
      let errorMessage = 'Failed to create payment order';
      if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.details : undefined
      });
    }
  },

  async verifyDonationPayment(req, res) {
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
      
      const verificationResult = await donationService.verifyDonationPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        transactionId
      });
      
      res.json({
        success: true,
        message: `Donation of ₹${verificationResult.amount} verified successfully! 🎉`,
        data: verificationResult
      });
      
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      
      const statusCode = error.statusCode || 500;
      
      res.status(statusCode).json({ 
        success: false, 
        message: error.message || 'Payment verification failed',
        error: process.env.NODE_ENV === 'development' ? error.details : undefined
      });
    }
  },

  async testRazorpayConnection(req, res) {
    try {
      console.log('🧪 Testing Razorpay connection...');
      
      const testResult = await donationService.testRazorpayConnection();
      
      res.json({
        success: true,
        message: '✅ Razorpay connection successful!',
        data: testResult
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
  },

  async getAllDonations(req, res) {
    try {
      const result = await donationService.getAllDonations();
      
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
  }
};

module.exports = donationController;
