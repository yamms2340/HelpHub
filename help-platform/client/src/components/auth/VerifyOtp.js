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
  InputAdornment,
  Fade,
} from '@mui/material';
import { VerifiedUser, Email as EmailIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();

  const emailFromRegister = location.state?.email || '';
  const [email, setEmail] = useState(emailFromRegister);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp) {
      setError('Please enter email and OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP...');
      const res = await authAPI.verifyOtp({ email, otp });

      const { token } = res.data;
      
      // Save token and load user into context
      localStorage.setItem('token', token);
      await getCurrentUser();

      console.log('✅ OTP verified successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ OTP verification failed:', err);
      setError(err.response?.data?.message || 'Verification failed. Please check your OTP.');
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
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 5,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  mb: 3,
                }}
              >
                <VerifiedUser sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>
                Verify Your Email
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Enter the 6-digit code sent to your email address
              </Typography>
              {emailFromRegister && (
                <Typography variant="body2" sx={{ mt: 1, color: '#2196F3', fontWeight: 600 }}>
                  {emailFromRegister}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!emailFromRegister || loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#2196F3' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: emailFromRegister ? 'rgba(248, 250, 252, 0.5)' : 'rgba(248, 250, 252, 0.7)',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Enter 6-Digit OTP"
                margin="normal"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                required
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(248, 250, 252, 0.7)',
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || otp.length !== 6}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VerifiedUser />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(33, 150, 243, 0.5)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                    transform: 'none',
                  }
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>

            {/* Help Text */}
            <Box mt={4} textAlign="center">
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Didn't receive the code?{' '}
                <Button
                  variant="text"
                  sx={{
                    color: '#2196F3',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => {
                    // TODO: Implement resend OTP
                    console.log('Resend OTP');
                  }}
                >
                  Resend OTP
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default VerifyOtp;
