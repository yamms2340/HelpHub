const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/emailService');
const cacheService = require('../services/cache'); // ✅ ADD CACHE

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
        role: 'user',
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
        role: user.role,
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

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      helpCount: user.helpCount || 0,
      rating: user.rating || 0,
      points: user.points || 0,
      totalPoints: user.totalPoints || 0,
      coins: user.coins || 0
    };

    // ✅ CACHE USER DATA (30 minutes)
    await cacheService.set(`user:${user._id}`, userData, 1800);
    console.log('💾 User cached after verification:', user._id);

    return res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userData,
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

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      helpCount: user.helpCount || 0,
      rating: user.rating || 0,
      points: user.points || 0,
      totalPoints: user.totalPoints || 0,
      coins: user.coins || 0
    };

    // ✅ CACHE USER DATA (30 minutes)
    await cacheService.set(`user:${user._id}`, userData, 1800);
    console.log('💾 User cached after login:', user._id);

    return res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   GET CURRENT USER
============================ */
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('🔍 GET /me for userId:', userId);

    // ✅ TRY CACHE FIRST
    const cacheKey = `user:${userId}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      console.log('✅ User data served from cache:', userId);
      return res.json({
        success: true,
        user: cached
      });
    }

    // ✅ FETCH FROM DB IF NOT IN CACHE
    console.log('⚠️ Cache miss, fetching from DB:', userId);
    const user = await User.findById(userId).select('-password -otp -otpExpiresAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      helpCount: user.helpCount || 0,
      rating: user.rating || 0,
      points: user.points || 0,
      totalPoints: user.totalPoints || 0,
      coins: user.coins || 0,
      requestsCreated: user.requestsCreated || 0,
      requestsCompleted: user.requestsCompleted || 0
    };

    // ✅ CACHE FOR 30 MINUTES
    await cacheService.set(cacheKey, userData, 1800);
    console.log('💾 User cached:', userId);

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('🔥 /me ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ============================
   UPDATE PROFILE
============================ */
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    console.log('✏️ UPDATE PROFILE for userId:', userId);

    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.isVerified;
    delete updates.role;
    delete updates.otp;
    delete updates.otpExpiresAt;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiresAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      helpCount: user.helpCount || 0,
      rating: user.rating || 0,
      points: user.points || 0,
      totalPoints: user.totalPoints || 0,
      coins: user.coins || 0
    };

    // ✅ INVALIDATE AND UPDATE CACHE
    await cacheService.del(`user:${userId}`);
    await cacheService.set(`user:${userId}`, userData, 1800);
    console.log('🔄 User cache updated after profile change:', userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/* ============================
   LOGOUT
============================ */
router.post('/logout', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // ✅ INVALIDATE USER CACHE ON LOGOUT
    await cacheService.del(`user:${userId}`);
    console.log('🗑️ User cache cleared on logout:', userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/* ============================
   RESEND OTP
============================ */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already verified' 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
