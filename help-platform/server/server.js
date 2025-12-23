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
   CREATE UPLOAD DIRECTORIES
================================ */

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

const storiesUploadsDir = path.join(uploadsDir, 'stories');
if (!fs.existsSync(storiesUploadsDir)) {
  fs.mkdirSync(storiesUploadsDir, { recursive: true });
  console.log('✅ Created stories uploads directory');
}

/* ================================
   MIDDLEWARE
================================ */

const allowedOrigins = [
  'http://localhost:3000',
  'https://helphub-otp-backend.onrender.com'
];

/* ================================
   MIDDLEWARE
================================ */

const cors = require('cors');

app.use(cors({
  origin: 'https://helphub-backend.onrender.com',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ================================
   STATIC FILES
================================ */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static file serving enabled for /uploads');

/* ================================
   DATABASE CONNECTION
================================ */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/* ================================
   BASIC ROUTES
================================ */

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HelpHub API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'HelpHub Platform API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

/* ================================
   DEBUG ROUTES
================================ */

app.get('/debug/routes', (req, res) => {
  const routes = [];

  function extractRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods)
          .join(', ')
          .toUpperCase();
        routes.push({
          path: prefix + middleware.route.path,
          methods
        });
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        extractRoutes(middleware.handle.stack, prefix);
      }
    });
  }

  if (app._router?.stack) {
    extractRoutes(app._router.stack);
  }

  res.json({
    success: true,
    totalRoutes: routes.length,
    routes,
    timestamp: new Date().toISOString()
  });
});

/* ================================
   API ROUTES
================================ */

const safeLoad = (path, route) => {
  try {
    app.use(route, require(path));
    console.log(`✅ Loaded ${route}`);
  } catch (e) {
    console.warn(`⚠️ Failed to load ${route}:`, e.message);
  }
};

safeLoad('./routes/auth', '/api/auth');
safeLoad('./routes/requests', '/api/requests');
safeLoad('./routes/stories', '/api/stories');
safeLoad('./routes/impactPostsRoutes', '/api/impact-posts');
safeLoad('./routes/rewards', '/api/rewards');
safeLoad('./routes/campaign', '/api/campaigns');
safeLoad('./routes/donations', '/api/donations');
safeLoad('./routes/help', '/api/help');
safeLoad('./routes/LeaderBoard', '/api/leaderboard');

/* ================================
   CAMPAIGN STATS
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
          totalDonatedAllTime: { $sum: '$currentAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Stats error' });
  }
});

/* ================================
   ERROR HANDLING
================================ */

app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (5MB max)' });
  }
  console.error('💥 Server error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

/* ================================
   404 HANDLER
================================ */

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/* ================================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🎁 All systems READY');
});
