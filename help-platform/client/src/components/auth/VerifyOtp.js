import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Updated import

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, getCurrentUser } = useAuth(); // ✅ Use verifyOtp from context!

  const emailFromRegister = location.state?.email || '';
  const [email, setEmail] = useState(emailFromRegister);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP for:', email);
      
      // ✅ Use context verifyOtp (auto-saves token + user)
      const result = await verifyOtp(email, otp);
      
      if (result.success) {
        console.log('🎉 OTP verified → Auto-login success!');
        navigate('/dashboard', { 
          state: { message: 'Welcome! Email verified successfully.' } 
        });
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      console.error('❌ OTP verification error:', err);
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Resending OTP to:', email);
      const result = await useAuth().register('', email, ''); // Email only
      if (result.success) {
        setError(''); // Clear previous errors
        alert('New OTP sent! Check your email.');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1, 
              fontWeight: 700, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Verify Email
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '1.1rem'
            }}
          >
            Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, fontWeight: 500 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!emailFromRegister}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="6-Digit OTP"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Numbers only
              inputProps={{ 
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.2em' }
              }}
              sx={{ mb: 3 }}
            />

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !otp}
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleResendOtp}
                disabled={loading || !email}
                sx={{ 
                  py: 1.5,
                  fontWeight: 500,
                  borderRadius: 2,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  }
                }}
              >
                Resend OTP
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 3, 
              textAlign: 'center', 
              color: '#9ca3af',
              fontSize: '0.9rem'
            }}
          >
            Didn't receive code? Check spam folder or{' '}
            <Button 
              size="small" 
              onClick={() => navigate('/register')} 
              sx={{ 
                p: 0, 
                minWidth: 'auto',
                color: '#667eea',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { background: 'none' }
              }}
            >
              register again
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default VerifyOtp;
