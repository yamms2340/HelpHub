const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/emailService');

const router = express.Router();

// Input validation middleware
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be 6+ characters' });
  }
  next();
};

/* ============================
   REGISTER (send OTP email)
============================ */
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Register attempt:', { name, email });

    let user = await User.findOne({ email });

    // Case 1: verified user exists → block
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user && !user.isVerified) {
      // Case 2: resend OTP to existing unverified user
      console.log('🔄 Resending OTP to existing user:', email);
      user.name = name;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      // Case 3: new user
      console.log('👤 Creating new user:', email);
      const hashedPassword = await bcrypt.hash(password, 12); // Stronger salt

      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false,
        helpCount: 0,
        rating: 0,
      });

      await user.save();
    }

    // Send OTP email
    console.log('📧 Sending OTP to:', email);
    await sendOtpEmail(user.email, otp);

    return res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Check inbox/spam.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('💥 Register error:', error.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

/* ============================
   VERIFY OTP
============================ */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 VERIFY OTP:', { email, otp });

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'User not found. Register first.' });
    }

    console.log('✅ User found:', {
      id: user._id,
      otpInDB: user.otp,
      otpExpiresAt: new Date(user.otpExpiresAt),
      now: new Date(),
    });

    // Check OTP exists
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'No OTP found. Register again.' });
    }

    // Check OTP expired
    if (Date.now() > user.otpExpiresAt) {
      console.log('⏰ OTP expired for:', email);
      return res.status(400).json({ message: 'OTP expired. Request new one.' });
    }

    // Verify OTP (string comparison)
    if (String(user.otp) !== String(otp)) {
      console.log('❌ OTP mismatch:', { db: user.otp, input: otp });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ Mark verified + clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    console.log('🎉 OTP VERIFIED for:', email);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Email verified! Welcome to HelpHub.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
      },
    });
  } catch (error) {
    console.error('💥 Verify OTP error:', error);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});

/* ============================
   LOGIN
============================ */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Must be verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email with OTP first.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login success:', user.email);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
      },
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

/* ============================
   GET CURRENT USER
============================ */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('💥 Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
