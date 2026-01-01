const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donations');

// POST /api/donations/create-order - Create Razorpay order
router.post('/create-order', donationController.createDonationOrder);

// POST /api/donations/verify-payment - Verify payment and update records
router.post('/verify-payment', donationController.verifyDonationPayment);

// GET /api/donations/test-razorpay - Test Razorpay connection
router.get('/test-razorpay', donationController.testRazorpayConnection);

// GET /api/donations - Get all donations
router.get('/', donationController.getAllDonations);

module.exports = router;
