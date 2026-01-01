const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// POST /api/auth/register - Register new user and send OTP
router.post('/register', authController.registerUser);

// POST /api/auth/verify-otp - Verify OTP and activate account
router.post('/verify-otp', authController.verifyOtp);

// POST /api/auth/login - Login existing user
router.post('/login', authController.loginUser);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authController.getCurrentUser);

module.exports = router;
