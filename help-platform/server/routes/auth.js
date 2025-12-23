const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');

const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/* ================================
   RESEND SETUP
================================ */
const resend = new Resend(process.env.RESEND_API_KEY);

/* ================================
   OTP STORAGE (in-memory)
================================ */
const otpStore = new Map();
const verifiedEmails = new Set();

/* ================================
   SEND OTP
================================ */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    await resend.emails.send({
      from: 'HelpHub <onboarding@resend.dev>',
      to: email,
      subject: 'Email Verification',
      html: `<h3>Your OTP is</h3><h2>${otp}</h2>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('RESEND OTP ERROR:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

/* ================================
   VERIFY OTP
================================ */
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  otpStore.delete(email);
  verifiedEmails.add(email);

  res.json({ success: true });
});

/* ================================
   REGISTER
================================ */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!verifiedEmails.has(email)) {
      return res.status(403).json({ message: 'OTP verification required' });
    }

    verifiedEmails.delete(email);

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed
    });

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
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

/* ================================
   LOGIN
================================ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
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
      email: user.email
    }
  });
});

/* ================================
   ME
================================ */
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = router;
