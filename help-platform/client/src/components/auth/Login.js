import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Container,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  Home,
  ArrowForward 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login successful');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Home sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </Box>

          {/* Welcome Text */}
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Welcome to HelpHub
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontWeight: 400,
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            Sign in to continue making a difference in your community
          </Typography>
        </Box>

        {/* Login Card */}
        <Card
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Form Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Enter your credentials to access your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form Fields */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#2196F3' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#2196F3' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
              InputLabelProps={{
                sx: { color: '#64748b' }
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#2196F3' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#2196F3' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
              InputLabelProps={{
                sx: { color: '#64748b' }
              }}
            />

            {/* Sign In Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  boxShadow: '0 12px 32px rgba(33, 150, 243, 0.5)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                  transform: 'none'
                }
              }}
              endIcon={!loading && <ArrowForward />}
            >
              {loading ? 'Signing In...' : 'Sign In to HelpHub'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Link 
              href="#" 
              sx={{ 
                color: '#2196F3', 
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Forgot your password?
            </Link>
            
            <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
              New to our community?{' '}
              <Link 
                href="/register" 
                sx={{ 
                  color: '#2196F3',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Join HelpHub →
              </Link>
            </Typography>
          </Box>
        </Card>

        {/* Bottom CTA */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            🌟 Ready to Make a Difference?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Join thousands of community heroes making an impact every day
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
