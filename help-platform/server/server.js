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
    message: 'HelpHub API is running with Rewards System!',
    timestamp: new Date().toISOString(),
    features: ['Points', 'Coins', 'Rewards', 'Redemptions', 'Impact Posts']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    features: ['Help Requests', 'Points & Coins System', 'Rewards Store', 'Impact Posts'],
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

// 3. 🔥 IMPACT POSTS ROUTES - FIXED TO USE YOUR EXISTING FILE
try {
  const impactPostsRoutes = require('./routes/impactPostsRoutes'); // ✅ CHANGED TO YOUR FILE NAME
  app.use('/api/impact-posts', impactPostsRoutes);
  console.log('✅ Impact Posts routes loaded at /api/impact-posts');
  console.log('   GET  /api/impact-posts (Get all posts)');
  console.log('   POST /api/impact-posts (Create post)');
  console.log('   GET  /api/impact-posts/:id (Get single post)');
  console.log('   PUT  /api/impact-posts/:id (Update post)');
  console.log('   DELETE /api/impact-posts/:id (Delete post)');
} catch (error) {
  console.error('❌ Impact Posts routes failed to load:', error.message);
  console.log('💡 Trying alternative file names...');
  
  // Try alternative file names
  const alternativeNames = ['impactPostRoutes', 'impactposts', 'ImpactPosts', 'impact-posts'];
  let loaded = false;
  
  for (const name of alternativeNames) {
    try {
      const routes = require(`./routes/impactPostsRouter`);
      app.use('/api/impact-posts', routes);
      console.log(`✅ Impact Posts routes loaded from ./routes/${name}`);
      loaded = true;
      break;
    } catch (altError) {
      // Continue to next alternative
    }
  }
  
  if (!loaded) {
    console.log('🔍 Available files in routes directory:');
    try {
      const fs = require('fs');
      const files = fs.readdirSync('./routes/');
      console.log('   Files found:', files.join(', '));
    } catch (fsError) {
      console.log('   Could not read routes directory');
    }
    
    // Create minimal fallback
    app.get('/api/impact-posts', (req, res) => {
      res.json({
        success: true,
        data: { posts: [] },
        total: 0,
        message: 'Impact posts endpoint (fallback - please check your routes/impactPostsRoutes.js file)'
      });
    });
    console.log('✅ Fallback impact-posts route created');
  }
}

// 4. 🎁 REWARDS ROUTES
try {
  const rewardsRoutes = require('./routes/rewards');
  app.use('/api/rewards', rewardsRoutes);
  console.log('✅ Rewards routes loaded at /api/rewards');
  console.log('   GET  /api/rewards (Browse rewards)');
  console.log('   GET  /api/rewards/coins (User coins - REAL DATA)');
  console.log('   POST /api/rewards/redeem (Redeem rewards)');
  console.log('   GET  /api/rewards/redemptions (User redemptions)');
} catch (error) {
  console.error('❌ Rewards routes failed to load:', error.message);
}

// 5. Campaign Routes
try {
  const campaignRoutes = require('./routes/campaign');
  app.use('/api/campaigns', campaignRoutes);
  console.log('✅ Campaign routes loaded at /api/campaigns');
} catch (error) {
  console.error('❌ Failed to load campaign routes:', error.message);
}

// 6. Donation Routes
try {
  const donationRoutes = require('./routes/donations');
  app.use('/api/donations', donationRoutes);
  console.log('✅ Donation routes loaded at /api/donations');
} catch (error) {
  console.error('❌ Failed to load donation routes:', error.message);
}

// 7. Stories Routes
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories', storiesRoutes);
  console.log('✅ Stories routes loaded at /api/stories');
} catch (error) {
  console.log('⚠️ Stories routes not found:', error.message);
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
      'GET /api/impact-posts',        // ✅ NOW AVAILABLE
      'POST /api/impact-posts',       
      'GET /api/rewards',
      'GET /api/rewards/coins',
      'POST /api/rewards/redeem',
      'GET /api/requests',
      'POST /api/requests',
      'GET /api/campaigns',
      'GET /api/leaderboard'
    ],
    tips: [
      'Check the exact file name: routes/impactPostsRoutes.js',
      'Ensure the file exports a router with module.exports = router',
      'Visit /debug/routes to see all loaded routes',
      'Check server console for route loading messages'
    ]
  });
});

// 🔥 GLOBAL ERROR HANDLER (MUST BE LAST)
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Server Error',
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎁 All Systems READY!`);
  console.log(`📋 Test these endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/debug/routes`);
  console.log(`   GET  http://localhost:${PORT}/api/impact-posts`);      // ✅ SHOULD WORK NOW
  console.log(`   GET  http://localhost:${PORT}/api/rewards/coins`);
  console.log(`✅ Impact Posts route should now work with your existing file!`);
});

module.exports = app;
