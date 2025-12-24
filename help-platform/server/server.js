const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

/* ================================
   📁 CREATE UPLOAD DIRECTORIES
================================ */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

const storiesUploadsDir = path.join(__dirname, 'uploads', 'stories');
if (!fs.existsSync(storiesUploadsDir)) {
  fs.mkdirSync(storiesUploadsDir, { recursive: true });
  console.log('✅ Created stories uploads directory');
}

/* ================================
   🌐 CORS CONFIGURATION (Render + Local)
================================ */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://helphub-otp-backend.onrender.com'
  ],
  credentials: true
}));

/* ================================
   🔧 MIDDLEWARE
================================ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static file serving enabled for /uploads');

/* ================================
   💾 DATABASE CONNECTION
================================ */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/* ================================
   🏥 HEALTH CHECK & ROOT
================================ */
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API is running!',
    timestamp: new Date().toISOString(),
    features: ['Auth', 'OTP', 'Requests', 'Points', 'Coins', 'Rewards', 'Campaigns', 'Donations', 'Stories', 'Impact Posts']
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    features: ['Help Requests', 'Points & Coins System', 'Rewards Store', 'Campaigns', 'Donations', 'Impact Posts', 'Stories with Image Upload'],
    timestamp: new Date().toISOString()
  });
});

/* ================================
   🔍 DEBUG ENDPOINT
================================ */
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

/* ================================
   🛣️ API ROUTES (PRIORITY ORDER)
================================ */

// 1. AUTH + OTP ROUTES
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded at /api/auth');
} catch (error) {
  console.error('❌ Auth routes failed:', error.message);
}

// 2. HELP REQUESTS
try {
  const requestRoutes = require('./routes/requests');
  app.use('/api/requests', requestRoutes);
  console.log('✅ Request routes loaded at /api/requests');
} catch (error) {
  console.error('❌ Request routes failed:', error.message);
}

// 3. REWARDS + COINS
try {
  const rewardsRoutes = require('./routes/rewards');
  app.use('/api/rewards', rewardsRoutes);
  console.log('✅ Rewards routes loaded at /api/rewards');
} catch (error) {
  console.error('❌ Rewards routes failed:', error.message);
}

// 4. LEADERBOARD
try {
  const leaderboardRoutes = require('./routes/LeaderBoard');
  app.use('/api/leaderboard', leaderboardRoutes);
  console.log('✅ Leaderboard routes loaded at /api/leaderboard');
} catch (error) {
  console.error('❌ Leaderboard routes failed:', error.message);
}

// 5. HELP (hall-of-fame, stats, inspiring stories)
try {
  const helpRoutes = require('./routes/help');
  app.use('/api/help', helpRoutes);
  console.log('✅ Help routes loaded at /api/help');
} catch (error) {
  console.error('❌ Help routes failed:', error.message);
}

// 6. STORIES (WITH IMAGE UPLOAD SUPPORT)
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories', storiesRoutes);
  console.log('✅ Stories routes loaded at /api/stories (with image upload)');
} catch (error) {
  console.error('❌ Stories routes failed:', error.message);
}

// 7. IMPACT POSTS
try {
  const impactPostsRoutes = require('./routes/impactPostsRouter');
  app.use('/api/impact-posts', impactPostsRoutes);
  console.log('✅ Impact Posts routes loaded at /api/impact-posts');
} catch (error) {
  console.error('❌ Impact Posts routes failed:', error.message);
}

// 8. CAMPAIGNS
try {
  const campaignRoutes = require('./routes/campaign');
  app.use('/api/campaigns', campaignRoutes);
  console.log('✅ Campaign routes loaded at /api/campaigns');
} catch (error) {
  console.error('❌ Campaign routes failed:', error.message);
}

// 9. DONATIONS (RAZORPAY)
try {
  const donationRoutes = require('./routes/donations');
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes loaded at /api/donations');
} catch (error) {
  console.error('❌ Donation routes failed:', error.message);
}

/* ================================
   📊 CAMPAIGN STATS ENDPOINT
================================ */
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

/* ================================
   ⚠️ ERROR HANDLING MIDDLEWARE
================================ */
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

/* ================================
   🚫 404 HANDLER (MUST BE LAST)
================================ */
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
    availableEndpoints: [
      'GET  /api/health',
      'GET  /debug/routes',
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/send-otp',
      'POST /api/auth/verify-otp',
      'GET  /api/requests',
      'POST /api/requests',
      'GET  /api/rewards',
      'POST /api/rewards/redeem',
      'GET  /api/leaderboard',
      'GET  /api/help/hall-of-fame',
      'GET  /api/stories/inspiring-stories',
      'POST /api/stories/submit',
      'GET  /api/impact-posts',
      'POST /api/impact-posts',
      'GET  /api/campaigns',
      'GET  /api/campaigns/stats',
      'POST /api/campaigns',
      'GET  /api/donations',
      'POST /api/donations/create-order',
      'POST /api/donations/verify-payment'
    ]
  });
});

/* ================================
   🚀 START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 HelpHub Server Running on Port ${PORT}`);
  console.log('='.repeat(60));
  console.log(`📍 Local:    http://localhost:${PORT}`);
  console.log(`🏥 Health:   http://localhost:${PORT}/api/health`);
  console.log(`🔍 Routes:   http://localhost:${PORT}/debug/routes`);
  console.log(`📁 Uploads:  http://localhost:${PORT}/uploads/`);
  console.log('='.repeat(60));
  console.log('✅ All systems ready!');
  console.log('   ✓ Authentication & OTP');
  console.log('   ✓ Help Requests');
  console.log('   ✓ Points & Rewards');
  console.log('   ✓ Campaigns & Donations');
  console.log('   ✓ Stories & Impact Posts');
  console.log('   ✓ Image Upload Support');
  console.log('='.repeat(60) + '\n');
});

module.exports = app;
