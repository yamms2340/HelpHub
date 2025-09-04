const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

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

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static file serving enabled for /uploads');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API is running with Image Upload Support!',
    timestamp: new Date().toISOString(),
    features: ['Points', 'Coins', 'Rewards', 'Redemptions', 'Impact Posts', 'Image Upload']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    features: ['Help Requests', 'Points & Coins System', 'Rewards Store', 'Impact Posts', 'Image Upload'],
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
  const impactPostsRoutes = require('./routes/impactPostsRoutes');
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎁 All Systems READY with Image Upload Support!`);
  console.log(`📋 Test these endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/debug/routes`);
  console.log(`   GET  http://localhost:${PORT}/api/stories/inspiring-stories`);
  console.log(`   POST http://localhost:${PORT}/api/stories/submit (FormData with image)`);
  console.log(`   Static files: http://localhost:${PORT}/uploads/stories/`);
  console.log(`✅ Image upload system ready!`);
});

module.exports = app;
