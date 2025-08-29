const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Database connection
try {
  const connectDB = require('./config/db');
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
  }).catch(err => {
    console.log('❌ Database connection failed:', err.message);
  });
} catch (error) {
  console.log('⚠️ Database config not found');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
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

// ✅ STORIES ROUTES (MongoDB-based Hall of Fame)
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/stories', storiesRoutes);
  console.log('✅ Stories routes loaded at /api/stories');
} catch (error) {
  console.error('❌ Failed to load stories routes:', error.message);
}

// ✅ HELP ROUTES (User/Help model-based)
try {
  const helpRoutes = require('./routes/help');
  app.use('/api/help', helpRoutes);
  console.log('✅ Help routes loaded at /api/help');
} catch (error) {
  console.error('❌ Failed to load help routes:', error.message);
}

// ✅ HALL OF FAME ALIAS (Points to stories for compatibility)
try {
  const storiesRoutes = require('./routes/stories');
  app.use('/api/hall-of-fame', storiesRoutes);
  console.log('✅ Hall of Fame routes loaded at /api/hall-of-fame (alias to stories)');
} catch (error) {
  console.error('❌ Failed to load hall of fame routes:', error.message);
}

// ✅ DONATIONS ROUTES
try {
  const donationsRoutes = require('./routes/donations');
  app.use('/api/donations', donationsRoutes);
  console.log('✅ Donations routes loaded at /api/donations');
} catch (error) {
  console.error('❌ Failed to load donations routes:', error.message);
}

// ✅ AUTH ROUTES
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️ Auth routes not found');
}

// ✅ REQUESTS ROUTES
try {
  app.use('/api/requests', require('./routes/requests'));
  console.log('✅ Requests routes loaded');
} catch (error) {
  console.log('⚠️ Requests routes not found');
}

// ✅ DONATION UPDATES ROUTES
try {
  app.use('/api', require('./routes/DonationUpdates'));
  console.log('✅ DonationUpdates routes loaded');
} catch (error) {
  console.log('⚠️ DonationUpdates routes not found');
}

// ✅ IMPACT POSTS ROUTES
try {
  app.use('/api/impact-posts', require('./routes/impactPostsRouter'));
  console.log('✅ Impact posts routes loaded');
} catch (error) {
  console.log('⚠️ Impact posts routes not found');
}

// ✅ LEADERBOARD ROUTES
try {
  app.use('/api/leaderboard', require('./routes/LeaderBoard'));
  console.log('✅ Leaderboard routes loaded');
} catch (error) {
  console.log('⚠️ Leaderboard routes not found');
}

// ✅ LEGACY REDIRECT ROUTES
app.get('/api/inspiring-stories', (req, res) => {
  console.log('🔀 Redirecting /api/inspiring-stories to /api/stories/inspiring-stories');
  const limit = req.query.limit || 10;
  res.redirect(301, `/api/stories/inspiring-stories?limit=${limit}`);
});

// 404 handler (MUST be last before error handler)
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET  /api/stories (MongoDB hall of fame)',
      'GET  /api/stories/inspiring-stories',
      'GET  /api/stories/stats',
      'POST /api/stories/submit',
      'GET  /api/stories/:id',
      'GET  /api/help/hall-of-fame (User model-based)',
      'GET  /api/help/history/:userId',
      'GET  /api/help/stats',
      'GET  /api/help/inspiring-stories',
      'GET  /api/hall-of-fame (alias to stories)',
      'POST /api/donations/create-order',
      'POST /api/donations/verify-payment',
      'GET  /api/donations/test-razorpay'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler (MUST be last)
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Available API endpoints:');
  console.log('   GET  /api/stories (MongoDB-based Hall of Fame)');
  console.log('   GET  /api/stories/inspiring-stories');
  console.log('   GET  /api/stories/stats');
  console.log('   POST /api/stories/submit');
  console.log('   GET  /api/stories/:id');
  console.log('   GET  /api/help/hall-of-fame (User model-based)');
  console.log('   GET  /api/help/history/:userId');
  console.log('   GET  /api/help/stats');
  console.log('   GET  /api/help/inspiring-stories');
  console.log('   GET  /api/hall-of-fame (alias to stories)');
  console.log('   POST /api/donations/create-order');
  console.log('   POST /api/donations/verify-payment');
  console.log('   GET  /api/donations/test-razorpay');
  console.log('🌟 HelpHub Platform is ready!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
