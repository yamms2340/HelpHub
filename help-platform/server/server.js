const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/help', require('./routes/help'));
app.use('/api/leaderboard', require('./routes/LeaderBoard')); // ✅ Add this line
app.use('/api', require('./routes/stories'));
app.use('/api/impact-posts', require('./routes/impactPostsRouter'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Help Platform API is running!',
    endpoints: {
      auth: '/api/auth',
      requests: '/api/requests', 
      help: '/api/help',
      leaderboard: '/api/leaderboard', // ✅ Add this
      stories: '/api/stories',
      inspiringStories: '/api/inspiring-stories'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
