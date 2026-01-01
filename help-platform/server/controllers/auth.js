const authService = require('../services/auth');

const authController = {
  async registerUser(req, res) {
    try {
      const { name, email, password } = req.body;
      
      console.log('📝 Registration request:', { name, email });
      
      const result = await authService.registerUser({ name, email, password });
      
      return res.status(201).json({
        success: true,
        message: 'OTP sent to your email.',
        user: result.user
      });
      
    } catch (error) {
      console.error('❌ Register error:', error);
      
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ 
        success: false,
        message: error.message || 'Server error' 
      });
    }
  },

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      
      console.log('🔐 VERIFY OTP REQUEST');
      console.log('📩 Email:', email);
      console.log('🔢 OTP:', otp);
      
      const result = await authService.verifyOtp({ email, otp });
      
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        token: result.token,
        user: result.user
      });
      
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ 
        success: false,
        message: error.message || 'Server error' 
      });
    }
  },

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('🔑 Login request:', { email });
      
      const result = await authService.loginUser({ email, password });
      
      return res.json({
        success: true,
        token: result.token,
        user: result.user
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ 
        success: false,
        message: error.message || 'Server error' 
      });
    }
  },

  async getCurrentUser(req, res) {
    try {
      // req.user should be populated by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          helpCount: req.user.helpCount,
          rating: req.user.rating,
        }
      });
      
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  }
};

module.exports = authController;
