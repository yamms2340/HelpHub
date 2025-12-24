const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables FIRST
dotenv.config();

const app = express();

// ✅ RENDER PORT DEFINITION (use later)
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

// ✅ CORS (Local + Render)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://helphub-services-xhmh.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware (BEFORE ROUTES)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static files: /uploads');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpHub API LIVE!',
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub API 🚀',
    docs: '/debug/routes',
    health: '/api/health'
  });
});

// Debug routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  function extractRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        routes.push({ path: prefix + middleware.route.path, methods });
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        const routerPrefix = middleware.regexp.source
          .replace(/^\^\\?/, '').replace(/\$.*/, '').replace(/\\\//g, '/');
        extractRoutes(middleware.handle.stack, routerPrefix);
      }
    });
  }
  extractRoutes(app._router.stack);
  res.json({
    success: true,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// ✅ ALL ROUTES (Your existing - perfect!)
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes: /api/auth');
} catch (e) { console.log('⚠️ Auth routes missing'); }

try {
  app.use('/api/requests', require('./routes/requests'));
  console.log('✅ Requests: /api/requests');
} catch (e) { console.log('⚠️ Requests missing'); }

try {
  app.use('/api/stories', require('./routes/stories'));
  console.log('✅ Stories: /api/stories');
} catch (e) { console.log('⚠️ Stories missing'); }

try {
  app.use('/api/impact-posts', require('./routes/impactPostsRouter'));
  console.log('✅ Impact posts: /api/impact-posts');
} catch (e) { console.log('⚠️ Impact posts missing'); }

try {
  app.use('/api/rewards', require('./routes/rewards'));
  console.log('✅ Rewards: /api/rewards');
} catch (e) { console.log('⚠️ Rewards missing'); }

try {
  app.use('/api/campaigns', require('./routes/campaign'));
  console.log('✅ Campaigns: /api/campaigns');
} catch (e) { console.log('⚠️ Campaigns missing'); }

try {
  app.use('/api/donations', require('./routes/donations'));
  console.log('✅ Donations: /api/donations');
} catch (e) { console.log('⚠️ Donations missing'); }

try {
  app.use('/api/help', require('./routes/help'));
  console.log('✅ Help: /api/help');
} catch (e) { console.log('⚠️ Help missing'); }

try {
  app.use('/api/leaderboard', require('./routes/LeaderBoard'));
  console.log('✅ Leaderboard: /api/leaderboard');
} catch (e) { console.log('⚠️ Leaderboard missing'); }

// Campaign stats
app.get('/api/campaigns/stats', async (req, res) => {
  try {
    const Campaign = require('./models/Campaign');
    const stats = await Campaign.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalCampaigns: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: stats[0] || { totalCampaigns: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Stats error' });
  }
});

// Error handler
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' });
  }
  console.error('💥 Error:', error);
  res.status(500).json({ success: false, message: 'Server error' });
});

// 404 Handler (LAST!)
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    try: '/api/health, /api/auth/register'
  });
});

// ✅ SERVER START (AFTER ALL MIDDLEWARE + ROUTES!)
const server = app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log(`🚀 HelpHub API v1.0 LIVE`);
  console.log(`📍 ${HOST}:${PORT}`);
  console.log(`🌐 http://${HOST === '0.0.0.0' ? 'your-app.onrender.com' : `localhost:${PORT}`}/api/health`);
  console.log(`🔐 /api/auth/register`);
  console.log(`📧 Brevo: ${process.env.BREVO_API_KEY ? '✅' : '❌ Missing'}`);
  console.log('='.repeat(60));
});

module.exports = app;
