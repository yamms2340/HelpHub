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
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    timestamp: new Date().toISOString()
  });
});

// ✅ FIXED: Add Hall of Fame routes
try {
  const hallOfFameRoutes = require('./routes/hallOfFame');
  app.use('/api/hall-of-fame', hallOfFameRoutes);
  console.log('✅ Hall of Fame routes loaded at /api/hall-of-fame');
} catch (error) {
  console.error('❌ Failed to load hall of fame routes:', error.message);
}

// Other API Routes
try {
  const donationsRoutes = require('./routes/donations');
  app.use('/api/donations', donationsRoutes);
  console.log('✅ Donations routes loaded at /api/donations');
} catch (error) {
  console.error('❌ Failed to load donations routes:', error.message);
}

try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('❌ Auth routes not found');
}

try {
  app.use('/api/requests', require('./routes/requests'));
  console.log('✅ Requests routes loaded');
} catch (error) {
  console.log('❌ Requests routes not found');
}

try {
  app.use('/api', require('./routes/DonationUpdates'));
  console.log('✅ DonationUpdates routes loaded');
} catch (error) {
  console.log('❌ DonationUpdates routes not found');
}

try {
  app.use('/api/impact-posts', require('./routes/impactPostsRouter'));
  console.log('✅ Impact posts routes loaded');
} catch (error) {
  console.log('❌ Impact posts routes not found');
}

try {
  app.use('/api/leaderboard', require('./routes/LeaderBoard'));
  console.log('✅ Leaderboard routes loaded');
} catch (error) {
  console.log('❌ Leaderboard routes not found');
}

// 404 handler (MUST be last)
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Available routes:');
  console.log('   GET  /api/hall-of-fame');
  console.log('   GET  /api/hall-of-fame/stats');
  console.log('   GET  /api/hall-of-fame/inspiring-stories');
  console.log('   POST /api/hall-of-fame/submit-story');
  console.log('   POST /api/donations/create-order');
  console.log('   POST /api/donations/verify-payment');
});

module.exports = app;
