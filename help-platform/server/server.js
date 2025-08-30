const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    message: 'HelpHub API is running!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ✅ MOUNT ALL ROUTES WITH ERROR HANDLING
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded at /api/auth');
} catch (error) {
  console.log('⚠️ Auth routes not found:', error.message);
}

try {
  const campaignRoutes = require('./routes/campaign');
  app.use('/api/campaigns', campaignRoutes);
  console.log('✅ Campaign routes loaded at /api/campaigns');
} catch (error) {
  console.error('❌ Failed to load campaign routes:', error.message);
}

try {
  const donationRoutes = require('./routes/donations');
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes loaded at /api/donations');
} catch (error) {
  console.error('❌ Failed to load donation routes:', error.message);
}

try {
  const requestRoutes = require('./routes/requests');
  app.use('/api/requests', requestRoutes);
  console.log('✅ Request routes loaded at /api/requests');
} catch (error) {
  console.log('⚠️ Request routes not found:', error.message);
}

try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories', storiesRoutes);
  app.use('/api/hall-of-fame', storiesRoutes); // Alias
  console.log('✅ Stories routes loaded at /api/stories');
} catch (error) {
  console.log('⚠️ Stories routes not found:', error.message);
}

try {
  const helpRoutes = require('./routes/help');
  app.use('/api/help', helpRoutes);
  console.log('✅ Help routes loaded at /api/help');
} catch (error) {
  console.log('⚠️ Help routes not found:', error.message);
}

// ✅ IMPACT POSTS ROUTES (Fixed)
try {
  const impactPostsRoutes = require('./routes/impactPosts');
  app.use('/api/impact-posts', impactPostsRoutes);
  console.log('✅ Impact posts routes loaded at /api/impact-posts');
} catch (error) {
  console.log('⚠️ Impact posts routes not found - creating fallback');
  // Fallback route
  app.get('/api/impact-posts', (req, res) => {
    res.json({
      success: true,
      data: { posts: [] },
      message: 'Impact posts service temporarily unavailable'
    });
  });
}

try {
  const leaderboardRoutes = require('./routes/LeaderBoard');
  app.use('/api/leaderboard', leaderboardRoutes);
  console.log('✅ Leaderboard routes loaded at /api/leaderboard');
} catch (error) {
  console.log('⚠️ Leaderboard routes not found:', error.message);
}

// ✅ CAMPAIGN STATISTICS ENDPOINT
app.get('/api/campaign-stats', async (req, res) => {
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
          totalDonors: { $sum: { $size: '$donors' } }
        }
      }
    ]);

    const campaignStats = stats[0] || {
      totalCampaigns: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalDonors: 0
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

// ✅ EXPRESS V5 COMPATIBLE 404 HANDLER (FIXED)
app.use('/(.*)', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/campaigns',
      'POST /api/campaigns',
      'POST /api/donations/create-order',
      'POST /api/donations/verify-payment',
      'GET /api/donations/test-razorpay'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware (MUST be last)
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/donations/create-order`);
  console.log(`   POST http://localhost:${PORT}/api/donations/verify-payment`);
  console.log(`   GET  http://localhost:${PORT}/api/campaigns`);
  console.log(`   GET  http://localhost:${PORT}/api/campaign-stats`);
});

module.exports = app;
