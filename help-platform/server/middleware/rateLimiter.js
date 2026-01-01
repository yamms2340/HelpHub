const rateLimit = require('express-rate-limit');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  // ✅ DEVELOPMENT MODE: Very relaxed limits
  if (isDevelopment) {
    console.log('⚠️ Development mode: Rate limiting relaxed');
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 1000, // 1000 requests per minute in development
      message: {
        success: false,
        message: message,
      },
      skip: (req) => {
        // Skip rate limiting for localhost in development
        return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost';
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // ✅ PRODUCTION MODE: Strict limits
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      console.log(`⚠️ Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
  });
};

// Auth endpoints - very strict (5 attempts per 15 minutes)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 5, // Relaxed in dev
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
});

// OTP endpoints - strict (3 OTP requests per 10 minutes)
const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: isDevelopment ? 1000 : 3, // Relaxed in dev
  message: 'Too many OTP requests, please try again after 10 minutes.',
});

// General API endpoints - moderate (60 requests per minute)
const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: isDevelopment ? 1000 : 60, // Relaxed in dev
  message: 'Too many requests, please slow down.',
});

// Donation/payment endpoints - moderate (10 attempts per 5 minutes)
const donationLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: isDevelopment ? 1000 : 10, // Relaxed in dev
  message: 'Too many donation attempts, please try again later.',
});

// File upload endpoints - strict (5 uploads per 10 minutes)
const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: isDevelopment ? 100 : 5, // Relaxed in dev
  message: 'Too many upload attempts, please try again later.',
});

// Strict limiter for sensitive operations (10 requests per minute)
const strictLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: isDevelopment ? 1000 : 10, // Relaxed in dev
  message: 'Rate limit exceeded for this action.',
});

module.exports = {
  createRateLimiter,
  authLimiter,
  otpLimiter,
  apiLimiter,
  donationLimiter,
  uploadLimiter,
  strictLimiter,
};
