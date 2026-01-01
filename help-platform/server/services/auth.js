const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/emailService');
const cacheService = require('./cache');

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const authService = {
  async registerUser(name, email, password) {
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      throw new AuthError('User already exists', 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      user.name = name;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false,
      });

      await user.save();
    }

    // Cache OTP for rate limiting and verification (10 minutes)
    await cacheService.set(`otp:${email}`, {
      otp,
      expiresAt: otpExpiresAt,
      attempts: 0
    }, 600);

    // Track OTP request count for rate limiting
    const otpCount = await cacheService.incr(`otp:count:${email}`, 600);
    console.log(`📧 OTP request count for ${email}: ${otpCount}`);

    await sendOtpEmail(user.email, otp);

    return {
      success: true,
      message: 'OTP sent to your email.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  },

  async verifyUserOtp(email, otp) {
    const user = await User.findOne({ email });

    if (!user) {
      console.error('❌ VERIFY FAIL: user not found');
      throw new AuthError('User not found', 400);
    }

    // Check cached OTP first (faster)
    const cachedOtpData = await cacheService.get(`otp:${email}`);
    
    if (cachedOtpData) {
      // Increment verification attempts
      cachedOtpData.attempts = (cachedOtpData.attempts || 0) + 1;
      
      // Block after 5 failed attempts
      if (cachedOtpData.attempts > 5) {
        await cacheService.del(`otp:${email}`);
        throw new AuthError('Too many failed attempts. Please request a new OTP.', 429);
      }

      await cacheService.set(`otp:${email}`, cachedOtpData, 600);
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
      throw new AuthError('No OTP generated. Please register again.', 400);
    }

    if (Date.now() > user.otpExpiresAt) {
      console.error('❌ VERIFY FAIL: OTP expired');
      // Clean up cache
      await cacheService.del(`otp:${email}`);
      throw new AuthError('OTP expired. Please request a new one.', 400);
    }

    if (String(user.otp) !== String(otp)) {
      console.error('❌ VERIFY FAIL: OTP mismatch');
      console.error('➡ DB OTP:', user.otp, 'type:', typeof user.otp);
      console.error('➡ INPUT OTP:', otp, 'type:', typeof otp);
      throw new AuthError('Invalid OTP', 400);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Clean up OTP cache after successful verification
    await cacheService.del(`otp:${email}`);
    await cacheService.del(`otp:count:${email}`);

    console.log('✅ OTP VERIFIED SUCCESSFULLY for', email);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Cache user session (7 days)
    await cacheService.set(`session:${user._id}`, {
      userId: user._id,
      email: user.email,
      name: user.name
    }, 604800); // 7 days in seconds

    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount,
        rating: user.rating,
      },
    };
  },

  async loginUser(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthError('Invalid credentials', 400);
    }

    if (!user.isVerified) {
      throw new AuthError('Please verify your email with OTP first.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Track failed login attempts
      const failedAttempts = await cacheService.incr(`login:failed:${email}`, 900); // 15 min
      
      if (failedAttempts >= 5) {
        throw new AuthError('Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes.', 429);
      }
      
      throw new AuthError('Invalid credentials', 400);
    }

    // Clear failed attempts on successful login
    await cacheService.del(`login:failed:${email}`);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Cache user session (7 days)
    await cacheService.set(`session:${user._id}`, {
      userId: user._id,
      email: user.email,
      name: user.name,
      lastLogin: new Date()
    }, 604800); // 7 days in seconds

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        helpCount: user.helpCount,
        rating: user.rating,
      },
    };
  },
};

module.exports = authService;
