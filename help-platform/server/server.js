const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables FIRST
dotenv.config();

const app = express();

// ✅ RENDER PORT + HOST (Critical!)
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Create uploads directory
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

// ✅ FIXED CORS (Local + Render)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://helphub-services-xhmh.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static file serving enabled for /uploads');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API is running!',
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    features: ['Auth', 'Stories', 'Help', 'Rewards', 'Image Upload']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API 🚀',
    version: '1.0.0',
    baseUrl: `${HOST}:${PORT}/api`,
    docs: '/debug/routes',
    timestamp: new Date().toISOString()
  });
});

// 🔍 DEBUG: List all routes
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

// ✅ ALL ROUTES (Your existing code - perfect!)
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded at /api/auth');
} catch (error) {
  console.log('⚠️ Auth routes not found:', error.message);
}

try {
  app.use('/api/requests', require('./routes/requests'));
  console.log('✅ Request routes loaded at /api/requests');
} catch (error) {
  console.log('⚠️ Request routes not found:', error.message);
}

try {
  app.use('/api/stories', require('./routes/stories'));
  console.log('✅ Stories routes loaded at /api/stories (with image upload)');
  console.log('   GET  /api/stories/inspiring-stories');
  console.log('   POST /api/stories/submit');
} catch (error) {
  console.log('⚠️ Stories routes not found:', error.message);
}

try {
  app.use('/api/impact-posts', require('./routes/impactPostsRouter'));
  console.log('✅ Impact Posts routes loaded at /api/impact-posts');
} catch (error) {
  console.log('⚠️ Impact Posts routes not found:', error.message);
}

try {
  app.use('/api/rewards', require('./routes/rewards'));
  console.log('✅ Rewards routes loaded at /api/rewards');
} catch (error) {
  console.log('⚠️ Rewards routes not found:', error.message);
}

try {
  app.use('/api/campaigns', require('./routes/campaign'));
  console.log('✅ Campaign routes loaded at /api/campaigns');
} catch (error) {
  console.log('⚠️ Campaign routes not found:', error.message);
}

try {
  app.use('/api/donations', require('./routes/donations'));
  console.log('✅ Donation routes loaded at /api/donations');
} catch (error) {
  console.log('⚠️ Donation routes not found:', error.message);
}

try {
  app.use('/api/help', require('./routes/help'));
  console.log('✅ Help routes loaded at /api/help');
} catch (error) {
  console.log('⚠️ Help routes not found:', error.message);
}

try {
  app.use('/api/leaderboard', require('./routes/LeaderBoard'));
  console.log('✅ Leaderboard routes loaded at /api/leaderboard');
} catch (error) {
  console.log('⚠️ Leaderboard routes not found:', error.message);
}

// Campaign stats
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
          totalDonors: { $sum: { $size: '$donors' } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || { totalCampaigns: 0, totalTargetAmount: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Stats error' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (5MB max)' });
  }
  console.error('💥 Server error:', error);
  res.status(500).json({ success: false, message: 'Server error' });
});

// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    use: '/api/auth/register, /api/health'
  });
});

// ✅ RENDER + LOCALHOST SERVER START
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 HelpHub API running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Render:  http://${HOST}:${PORT}`);
  console.log(`✅ Health:  http://${HOST}:${PORT}/api/health`);
  console.log(`✅ Auth:    http://${HOST}:${PORT}/api/auth/register`);
  console.log(`🎁 All systems READY!`);
});

module.exports = app;
