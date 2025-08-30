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
    timestamp: new Date().toISOString(),
    routes: {
      'POST /api/impact-posts': 'Create impact post',
      'GET /api/impact-posts': 'Get all impact posts',
      'GET /api/campaigns': 'Get campaigns',
      'POST /api/donations/create-order': 'Create donation order',
      'POST /api/donations/verify-payment': 'Verify payment'
    }
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

// ✅ MOUNT ALL ROUTES WITH ENHANCED ERROR HANDLING
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

// ✅ IMPACT POSTS ROUTES (ENHANCED WITH FALLBACK)
try {
  const impactPostsRoutes = require('./routes/impactPostsRouter');
  app.use('/api/impact-posts', impactPostsRoutes);
  console.log('✅ Impact posts routes loaded at /api/impact-posts');
  console.log('   GET  /api/impact-posts (Get all posts)');
  console.log('   POST /api/impact-posts (Create post)');
  console.log('   GET  /api/impact-posts/:id (Get single post)');
  console.log('   PUT  /api/impact-posts/:id (Update post)');
  console.log('   DELETE /api/impact-posts/:id (Delete post)');
} catch (error) {
  console.error('❌ Failed to load impact posts routes:', error.message);
  
  // ✅ CREATE FALLBACK ROUTES
  console.log('🔧 Creating fallback impact posts routes...');
  
  // Mock data for fallback
  const mockPosts = [
    {
      _id: '1',
      title: 'Emergency Medical Support',
      category: 'Healthcare',
      beneficiaries: 25,
      amount: 15000,
      details: 'Provided emergency medical assistance to families in need.',
      authorName: 'Dr. Smith',
      status: 'active',
      isVerified: true,
      likes: 45,
      views: 230,
      createdAt: new Date()
    }
  ];
  
  app.get('/api/impact-posts', (req, res) => {
    res.json({
      success: true,
      data: { posts: mockPosts },
      total: mockPosts.length,
      message: 'Impact posts service (fallback mode)'
    });
  });
  
  app.post('/api/impact-posts', (req, res) => {
    console.log('📝 Fallback: Creating impact post with data:', req.body);
    const newPost = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      status: 'active',
      likes: 0,
      views: 0
    };
    mockPosts.unshift(newPost);
    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Impact post created successfully (fallback mode)'
    });
  });
  
  app.get('/api/impact-posts/:id', (req, res) => {
    const post = mockPosts.find(p => p._id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: post });
  });
  
  console.log('✅ Fallback impact posts routes created');
}

try {
  const leaderboardRoutes = require('./routes/LeaderBoard');
  app.use('/api/leaderboard', leaderboardRoutes);
  console.log('✅ Leaderboard routes loaded at /api/leaderboard');
} catch (error) {
  console.log('⚠️ Leaderboard routes not found:', error.message);
}

// ✅ CAMPAIGN STATISTICS ENDPOINT (FIXED URL)
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

// ✅ LEGACY SUPPORT FOR OLD ENDPOINT
app.get('/api/campaign-stats', (req, res) => {
  res.redirect(301, '/api/campaigns/stats');
});

// ✅ EXPRESS V4 COMPATIBLE CATCH-ALL ROUTE
app.use('*', (req, res) => {
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
      'GET /api/campaigns/stats',
      'POST /api/donations/create-order',
      'POST /api/donations/verify-payment',
      'GET /api/impact-posts',
      'POST /api/impact-posts',
      'GET /api/impact-posts/:id',
      'PUT /api/impact-posts/:id',
      'DELETE /api/impact-posts/:id'
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
  console.log(`   GET  http://localhost:${PORT}/api/impact-posts`);
  console.log(`   POST http://localhost:${PORT}/api/impact-posts`);
  console.log(`   GET  http://localhost:${PORT}/api/campaigns`);
  console.log(`   GET  http://localhost:${PORT}/api/campaigns/stats`);
  console.log(`   POST http://localhost:${PORT}/api/donations/create-order`);
  console.log(`   POST http://localhost:${PORT}/api/donations/verify-payment`);
});

module.exports = app;
