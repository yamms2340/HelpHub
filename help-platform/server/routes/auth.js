const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * =========================
 * OTP STORAGE (TEMP)
 * =========================
 * NOTE:
 * - For learning: Map is OK
 * - In production: use DB / Redis
 */
const otpStore = new Map();

/**
 * =========================
 * EMAIL TRANSPORTER (RENDER SAFE)
 * =========================
 * Set these in Render dashboard:
 * EMAIL_USER
 * EMAIL_PASS (Gmail App Password)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * =========================
 * SEND OTP
 * POST /api/auth/send-otp
 * =========================
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, otp);

    await transporter.sendMail({
      to: email,
      subject: 'HelpHub Email Verification',
      text: `Your OTP is ${otp}. It is valid for a short time.`,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

/**
 * =========================
 * VERIFY OTP
 * POST /api/auth/verify-otp
 * =========================
 */
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = otpStore.get(email);

  if (storedOtp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  otpStore.delete(email);

  res.json({ success: true, message: 'OTP verified' });
});

/**
 * =========================
 * REGISTER
 * POST /api/auth/register
 * =========================
 * IMPORTANT:
 * - Called ONLY AFTER OTP verification
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * =========================
 * LOGIN
 * POST /api/auth/login
 * =========================
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * =========================
 * GET CURRENT USER
 * GET /api/auth/me
 * =========================
 */
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      helpCount: req.user.helpCount,
      rating: req.user.rating,
    },
  });
});

module.exports = router;
