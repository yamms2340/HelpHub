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
  Link as MuiLink,
  Fade,
  Grow,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  PersonAdd,
  VolunteerActivism,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (formData.name.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
          `,
        }
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: 'float 6s ease-in-out infinite',
          opacity: 0.3,
        }}
      >
        <VolunteerActivism sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.2)' }} />
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: 'float 8s ease-in-out infinite reverse',
          opacity: 0.2,
        }}
      >
        <PersonAdd sx={{ fontSize: 100, color: 'rgba(255, 255, 255, 0.15)' }} />
      </Box>

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Hero Section */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    animation: 'glow 2s ease-in-out infinite alternate',
                  }}
                >
                  <PersonAdd sx={{ fontSize: 40, color: '#1a1a1a', fontWeight: 'bold' }} />
                </Box>
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 900, 
                  color: 'white',
                  mb: 2,
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Join the Heroes
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontWeight: 400,
                  mb: 1,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                }}
              >
                Become part of the <span style={{ color: '#FFD700', fontWeight: 600 }}>Help Hub</span> community
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1.1rem',
                }}
              >
                Create your account and start making a difference
              </Typography>
            </Box>

            <Grow in timeout={800}>
              <Paper 
                elevation={0}
                sx={{ 
                  padding: 6, 
                  width: '100%',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    borderRadius: '6px 6px 0 0',
                  }
                }}
              >
                <Box textAlign="center" mb={4}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: '#1e293b', 
                      mb: 1,
                    }}
                  >
                    🚀 Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Fill in your details to get started
                  </Typography>
                </Box>
                
                {error && (
                  <Grow in timeout={300}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        '& .MuiAlert-icon': {
                          color: '#ef4444'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Grow>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(248, 250, 252, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(248, 250, 252, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                        fontWeight: 600,
                      }
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(248, 250, 252, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(248, 250, 252, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                        fontWeight: 600,
                      }
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Password must be at least 6 characters long"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: '#94a3b8' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(248, 250, 252, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(248, 250, 252, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                        fontWeight: 600,
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                            sx={{ color: '#94a3b8' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(248, 250, 252, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(248, 250, 252, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                        fontWeight: 600,
                      }
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                    sx={{
                      mt: 2,
                      mb: 4,
                      py: 2,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6cf0 0%, #6b4f9d 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.5)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                        transform: 'none',
                        boxShadow: '0 4px 15px rgba(148, 163, 184, 0.2)',
                      }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Hero Account'}
                  </Button>
                  
                  <Box textAlign="center">
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                      }}
                    >
                      <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
                        Already part of our hero community?
                      </Typography>
                      <MuiLink 
                        component={Link} 
                        to="/login"
                        sx={{
                          color: '#667eea',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: '#5a6cf0',
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Sign in here →
                      </MuiLink>
                    </Paper>
                  </Box>
                </Box>
              </Paper>
            </Grow>
          </Box>
        </Fade>
      </Container>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes glow {
          0% { 
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
          }
          100% { 
            box-shadow: 0 15px 40px rgba(255, 215, 0, 0.6);
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
          }
        }
      `}</style>
    </Box>
  );
}

export default Register;
