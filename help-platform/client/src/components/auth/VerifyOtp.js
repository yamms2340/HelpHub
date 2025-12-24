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

    setLoading(true);
    try {
      // backend expects { email, otp }
      const res = await authAPI.verifyOtp({ email, otp });

      const { token } = res.data;
      // save token and load user into context
      localStorage.setItem('token', token);
      await getCurrentUser();

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
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
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.98)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
            Verify your email
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#64748b' }}>
            Enter the 6‑digit code sent to your email address
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!emailFromRegister || loading}
            />

            <TextField
              fullWidth
              label="OTP"
              margin="normal"
              type="text"           // keep as string so leading zeros are not lost
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} color="inherit" />}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default VerifyOtp;
