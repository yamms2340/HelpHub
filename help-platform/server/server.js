const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();

/* ================================
   CORS
================================ */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://helphub-otp-backend.onrender.com'
  ],
  credentials: true
}));

/* ================================
   BODY PARSERS
================================ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ================================
   STATIC FILES
================================ */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

/* ================================
   DATABASE
================================ */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ================================
   ROUTES
================================ */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/impact-posts', require('./routes/impactPostsRoutes'));
app.use('/api/campaigns', require('./routes/campaign'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/help', require('./routes/help'));
app.use('/api/leaderboard', require('./routes/LeaderBoard'));

/* ================================
   HEALTH
================================ */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

/* ================================
   404
================================ */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/* ================================
   START
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
