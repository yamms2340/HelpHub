const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// ✅ INITIALIZE CACHE SERVICE (NEW)
const cacheService = require('./services/cache');

const app = express();

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
  'https://helphub-1-1ab2.onrender.com',
  'https://helphubplatformfrontend.onrender.com', // ✅ New frontend URL
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API is running with Image Upload Support!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: ['Auth', 'OTP', 'Points', 'Coins', 'Rewards', 'Campaigns', 'Donations', 'Impact Posts', 'Image Upload', 'Redis Cache']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    features: ['Help Requests', 'Points & Coins System', 'Rewards Store', 'Impact Posts', 'Image Upload', 'Redis Cache'],
    timestamp: new Date().toISOString()
  });
});

// 🔍 DEBUG ENDPOINT: List all routes
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

// ✅ NEW: CACHE DEBUG ENDPOINTS
app.get('/debug/cache/stats', async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    res.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

app.post('/debug/cache/clear', async (req, res) => {
  try {
    await cacheService.clearAll();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

app.delete('/debug/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    await cacheService.del(key);
    res.json({
      success: true,
      message: `Cache key '${key}' deleted`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete cache key',
      error: error.message
    });
  }
});

// ✅ MOUNT ALL ROUTES IN PRIORITY ORDER

// 1. Auth Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded at /api/auth');
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

// 3. Stories Routes (UPDATED WITH IMAGE SUPPORT)
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories', storiesRoutes);
  console.log('✅ Stories routes loaded at /api/stories (with image upload support)');
  console.log('   GET  /api/stories/inspiring-stories');
  console.log('   POST /api/stories/submit (supports image upload)');
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
  app.use('/api/rewards', rewardsRoutes);
  console.log('✅ Rewards routes loaded at /api/rewards');
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

// 7. Donation Routes
try {
  const donationRoutes = require('./routes/donations');
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes loaded at /api/donations');
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
      'GET /debug/cache/stats',
      'POST /debug/cache/clear',
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

// ✅ START SERVER ONLY IF NOT IN TEST MODE
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log('\n============================================================');
    console.log('🚀 HELPHUB SERVER STARTED');
    console.log('============================================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${mongoose.connection.name || 'Connecting...'}`);
    console.log(`💾 Redis: ${cacheService.isConnected ? 'Connected' : 'Disabled'}`);
    console.log('============================================================');
    console.log('🎯 KEY ENDPOINTS:');
    console.log(`   Health Check:    GET  http://localhost:${PORT}/api/health`);
    console.log(`   All Routes:      GET  http://localhost:${PORT}/debug/routes`);
    console.log(`   Cache Stats:     GET  http://localhost:${PORT}/debug/cache/stats`);
    console.log(`   Clear Cache:     POST http://localhost:${PORT}/debug/cache/clear`);
    console.log(`   Register:        POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   Login:           POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   Stories:         GET  http://localhost:${PORT}/api/stories/inspiring-stories`);
    console.log(`   Impact Posts:    GET  http://localhost:${PORT}/api/impact-posts`);
    console.log(`   Campaigns:       GET  http://localhost:${PORT}/api/campaigns`);
    console.log(`   Leaderboard:     GET  http://localhost:${PORT}/api/leaderboard`);
    console.log('============================================================');
    console.log('🔒 CORS ENABLED FOR:');
    allowedOrigins.forEach(origin => console.log(`   ✓ ${origin}`));
    console.log('============================================================');
    console.log('✅ ALL SYSTEMS READY!');
    console.log('============================================================\n');
  });

  // ✅ START EMAIL WORKER (ONLY IN NON-TEST MODE)
  try {
    console.log('🚀 Starting email worker...');
    require('./workers/emailWorker');
  } catch (error) {
    console.error('⚠️ Email worker failed to start:', error.message);
  }
}

// Export both app and server
module.exports = app;
module.exports.server = server;
