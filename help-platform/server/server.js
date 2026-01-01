const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { connectRedis } = require('./config/redis');
const { apiLimiter, authLimiter, otpLimiter, donationLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

const app = express();

// Connect to Redis on startup
connectRedis();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Create stories subdirectory
const storiesUploadsDir = path.join(__dirname, 'uploads', 'stories');
if (!fs.existsSync(storiesUploadsDir)) {
  fs.mkdirSync(storiesUploadsDir, { recursive: true });
  console.log('✅ Created stories uploads directory');
}

// ✅ CORS Configuration - UPDATED FOR PRODUCTION
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://helphub-services-xhmh.onrender.com',
  'https://helphub-1-1ab2.onrender.com', // ✅ New frontend URL
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static file serving enabled for /uploads');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check endpoint (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API is running with Redis Cache & Rate Limiting!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: ['Auth', 'OTP', 'Redis Cache', 'Rate Limiting', 'Points', 'Coins', 'Rewards', 'Campaigns', 'Donations', 'Impact Posts', 'Image Upload']
  });
});

// Root endpoint (no rate limit)
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '2.0.0',
    features: ['Redis Caching', 'Rate Limiting', 'Help Requests', 'Points & Coins System', 'Rewards Store', 'Impact Posts', 'Image Upload'],
    timestamp: new Date().toISOString()
  });
});

// 🔍 DEBUG ENDPOINT: List all routes (no rate limit)
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        routes.push({
          path: prefix + middleware.route.path,
          methods: methods
        });
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        const routerPrefix = middleware.regexp.source
          .replace(/^\^\\?/, '')
          .replace(/\$.*/, '')
          .replace(/\\\//g, '/');
        
        extractRoutes(middleware.handle.stack, routerPrefix);
      }
    });
  }
  
  if (app._router && app._router.stack) {
    extractRoutes(app._router.stack);
  }
  
  res.json({
    success: true,
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    timestamp: new Date().toISOString()
  });
});

// Apply general API rate limiting to all /api routes
app.use('/api/', apiLimiter);
console.log('✅ General API rate limiting enabled (60 req/min)');

// ✅ MOUNT ALL ROUTES IN PRIORITY ORDER

// 1. Auth Routes (with strict rate limiting)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/verify-otp', otpLimiter);
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded at /api/auth with rate limiting (5 req/15min)');
} catch (error) {
  console.log('⚠️ Auth routes not found:', error.message);
}

// 2. Request Routes
try {
  const requestRoutes = require('./routes/requests');
  app.use('/api/requests', requestRoutes);
  console.log('✅ Request routes loaded at /api/requests');
} catch (error) {
  console.log('⚠️ Request routes not found:', error.message);
}

// 3. Stories Routes (UPDATED WITH IMAGE SUPPORT + Upload Rate Limiting)
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories/submit', uploadLimiter);
  app.use('/api/stories/submit-story', uploadLimiter);
  app.use('/api/stories', storiesRoutes);
  console.log('✅ Stories routes loaded at /api/stories (with image upload support + rate limiting)');
  console.log('   GET  /api/stories/inspiring-stories');
  console.log('   POST /api/stories/submit (supports image upload - 5 req/10min)');
  console.log('   GET  /api/stories/:id');
} catch (error) {
  console.log('⚠️ Stories routes not found:', error.message);
}

// 4. Impact Posts Routes
try {
  const impactPostsRoutes = require('./routes/impactPostsRouter');
  app.use('/api/impact-posts', impactPostsRoutes);
  console.log('✅ Impact Posts routes loaded at /api/impact-posts');
} catch (error) {
  console.error('❌ Impact Posts routes failed to load:', error.message);
}

// 5. Rewards Routes
try {
  const rewardsRoutes = require('./routes/rewards');
  app.use('/api/rewards/redeem', donationLimiter);
  app.use('/api/rewards', rewardsRoutes);
  console.log('✅ Rewards routes loaded at /api/rewards (redemption rate limited)');
} catch (error) {
  console.error('❌ Rewards routes failed to load:', error.message);
}

// 6. Campaign Routes
try {
  const campaignRoutes = require('./routes/campaign');
  app.use('/api/campaigns', campaignRoutes);
  console.log('✅ Campaign routes loaded at /api/campaigns');
} catch (error) {
  console.error('❌ Failed to load campaign routes:', error.message);
}

// 7. Donation Routes (with payment rate limiting)
try {
  const donationRoutes = require('./routes/donations');
  app.use('/api/donations/create-order', donationLimiter);
  app.use('/api/donations/verify-payment', donationLimiter);
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes loaded at /api/donations (payment rate limited - 10 req/5min)');
} catch (error) {
  console.error('❌ Failed to load donation routes:', error.message);
}

// 8. Help Routes
try {
  const helpRoutes = require('./routes/help');
  app.use('/api/help', helpRoutes);
  console.log('✅ Help routes loaded at /api/help');
} catch (error) {
  console.log('⚠️ Help routes not found:', error.message);
}

// 9. Leaderboard Routes
try {
  const leaderboardRoutes = require('./routes/LeaderBoard');
  app.use('/api/leaderboard', leaderboardRoutes);
  console.log('✅ Leaderboard routes loaded at /api/leaderboard');
} catch (error) {
  console.log('⚠️ Leaderboard routes not found:', error.message);
}

// Campaign statistics endpoint
app.get('/api/campaigns/stats', async (req, res) => {
  try {
    const Campaign = require('./models/Campaign');
    
    const stats = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          totalDonors: { $sum: { $size: '$donors' } },
          totalDonatedAllTime: { $sum: '$currentAmount' }
        }
      }
    ]);

    const campaignStats = stats[0] || {
      totalCampaigns: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalDonors: 0,
      totalDonatedAllTime: 0
    };

    res.json({
      success: true,
      data: campaignStats
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics'
    });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded.'
    });
  }
  
  if (error instanceof Error && error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Access denied from this origin.'
    });
  }
  
  console.error('💥 Server error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: 'Server Error',
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 🔥 ENHANCED 404 HANDLER (MUST BE AFTER ALL ROUTES)
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
    requestedRoute: {
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    },
    availableRoutes: [
      'GET /api/health',
      'GET /debug/routes',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/verify-otp',
      'GET /api/stories/inspiring-stories',
      'POST /api/stories/submit (with image upload)',
      'GET /api/impact-posts',
      'POST /api/impact-posts',
      'GET /api/rewards',
      'GET /api/rewards/coins',
      'POST /api/rewards/redeem',
      'GET /api/requests',
      'POST /api/requests',
      'GET /api/campaigns',
      'GET /api/leaderboard'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 HelpHub Server Running on Port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log(`🎁 All Systems READY with Redis Cache & Rate Limiting!`);
  console.log(`📋 Test these endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/debug/routes`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/stories/inspiring-stories`);
  console.log(`   POST http://localhost:${PORT}/api/stories/submit (FormData with image)`);
  console.log(`   Static files: http://localhost:${PORT}/uploads/stories/`);
  console.log(`✅ Image upload system ready!`);
  console.log(`\n🔒 CORS enabled for:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log(`\n⚡ Redis Features:`);
  console.log(`   - Caching enabled for campaigns, leaderboard, impact posts`);
  console.log(`   - Rate limiting: Auth (5/15min), Donations (10/5min), API (60/min)`);
});

module.exports = app;
