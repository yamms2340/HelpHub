const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
app.use(express.urlencoded({ extended: true }));

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

/* ================================
   HEALTH
================================ */
app.get('/api/health', (req, res) => {
  res.json({ success: true });
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
