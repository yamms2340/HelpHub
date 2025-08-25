const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/help', require('./routes/help'));
app.use('/api', require('./routes/stories')); // Add this line

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Help Platform API is running!',
    endpoints: {
      auth: '/api/auth',
      requests: '/api/requests', 
      help: '/api/help',
      stories: '/api/stories', // Add this line
      inspiringStories: '/api/inspiring-stories' // Add this line
    }
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({ 
      message: 'Database test', 
      status: states[dbState],
      database: mongoose.connection.name 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- Auth: http://localhost:${PORT}/api/auth`);
  console.log(`- Requests: http://localhost:${PORT}/api/requests`);
  console.log(`- Help: http://localhost:${PORT}/api/help`);
});
