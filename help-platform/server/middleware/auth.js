const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7)  // Remove "Bearer " prefix
      : null;

    if (!token) {
      console.log('🚫 No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify JWT token
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user (exclude password)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      userId: user._id,  // For backward compatibility
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      helpCount: user.helpCount || 0,
      rating: user.rating || 0
    };

    console.log('✅ Auth success:', req.user.email);
    next();
    
  } catch (error) {
    console.error('💥 Auth error:', error.message);
    
    // Specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    
    // Generic token error
    res.status(401).json({ 
      success: false,
      message: 'Invalid token. Please login again.' 
    });
  }
};

module.exports = auth;
