const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/emailService');

const router = express.Router();

/* ============================
   REGISTER (send OTP email)
============================ */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    // Case 1: verified user exists → block
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      // Case 2: resend OTP
      user.name = name;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      // Case 3: new user
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        role: 'user',  // ✅ FIXED: Default role
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false,
      });

      await user.save();
    }

    await sendOtpEmail(user.email, otp);

    return res.status(201).json({
      success: true,
      message: 'OTP sent to your email.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,  // ✅ Added role
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   VERIFY OTP
============================ */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 VERIFY OTP REQUEST');
    console.log('📩 Email received:', email);
    console.log('🔢 OTP received (raw):', otp, 'type:', typeof otp);

    const user = await User.findOne({ email });

    if (!user) {
      console.error('❌ VERIFY FAIL: user not found');
      return res.status(400).json({ message: 'User not found' });
    }

    console.log('🧾 USER FOUND:', {
      id: user._id.toString(),
      email: user.email,
      isVerified: user.isVerified,
      otpInDB: user.otp,
      otpTypeInDB: typeof user.otp,
      otpExpiresAt: new Date(user.otpExpiresAt),
      now: new Date(),
    });

    if (!user.otp || !user.otpExpiresAt) {
      console.error('❌ VERIFY FAIL: OTP missing in DB');
      return res
        .status(400)
        .json({ message: 'No OTP generated. Please register again.' });
    }

    if (Date.now() > user.otpExpiresAt) {
      console.error('❌ VERIFY FAIL: OTP expired');
      return res
        .status(400)
        .json({ message: 'OTP expired. Please request a new one.' });
    }

    // ⚠️ MOST COMMON BUG: STRING vs NUMBER mismatch
    if (String(user.otp) !== String(otp)) {
      console.error('❌ VERIFY FAIL: OTP mismatch');
      console.error('➡ DB OTP:', user.otp, 'type:', typeof user.otp);
      console.error('➡ INPUT OTP:', otp, 'type:', typeof otp);

      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    console.log('✅ OTP VERIFIED SUCCESSFULLY for', email);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,  // ✅ Added role
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
      },
    });
  } catch (error) {
    console.error('🔥 VERIFY OTP SERVER ERROR');
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
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

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: 'Please verify your email with OTP first.' });
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

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,  // ✅ Added role
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   GET CURRENT USER
============================ */
router.get('/me', auth, async (req, res) => {  // ✅ FIXED: router
  try {
    console.log('🔍 req.user.userId:', req.user.userId);
    
    // CRITICAL: Fetch FRESH from DB (includes role!)
    const user = await User.findById(req.user.userId).select('-password');
    
    console.log('🔍 DB USER ROLE:', user.role);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        helpCount: user.helpCount || 0,
        rating: user.rating || 0,
      },
    });
  } catch (error) {
    console.error('🔥 /me ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
