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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fade,
  Grow,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Title,
  Category,
  LocationOn,
  Description,
  PriorityHigh,
  VolunteerActivism,
  AddCircle,
  Help,
  Groups,
  Home,
  EmojiEvents,
  Create,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  Security,
  Favorite,
  Computer,
  School,
  DriveEta,
  Restaurant,
  LocalHospital,
  Business,
  HelpOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';

const categories = [
  { value: 'Technology', icon: Computer, color: '#1976d2' },
  { value: 'Education', icon: School, color: '#2196f3' },
  { value: 'Transportation', icon: DriveEta, color: '#1565c0' },
  { value: 'Food', icon: Restaurant, color: '#0d47a1' },
  { value: 'Health', icon: LocalHospital, color: '#42a5f5' },
  { value: 'Housing', icon: Business, color: '#1e88e5' },
  { value: 'Other', icon: HelpOutline, color: '#64b5f6' }
];

const urgencyLevels = [
  { value: 'Low', color: '#2196f3', icon: '🟢' },
  { value: 'Medium', color: '#1976d2', icon: '🟡' },
  { value: 'High', color: '#1565c0', icon: '🟠' },
  { value: 'Critical', color: '#0d47a1', icon: '🔴' }
];

function CreateRequest() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Footer data
  const quickLinks = [
    { label: 'Help Requests', path: '/', icon: Groups },
    { label: 'Hall of Fame', path: '/hall-of-fame', icon: EmojiEvents },
    { label: 'Create Request', path: '/create-request', icon: VolunteerActivism },
    { label: 'About Us', path: '/about', icon: Help },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Support', path: '/support' },
    { label: 'Community Guidelines', path: '/guidelines' },
    { label: 'Safety Tips', path: '/safety' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Accessibility', path: '/accessibility' },
  ];

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/helphub', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com/helphub', label: 'Twitter' },
    { icon: LinkedIn, url: 'https://linkedin.com/company/helphub', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com/helphub', label: 'Instagram' },
    { icon: GitHub, url: 'https://github.com/helphub', label: 'GitHub' },
  ];

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    if (!formData.urgency) return 'Urgency level is required';
    if (!formData.location.trim()) return 'Location is required';
    
    if (formData.title.length < 5) return 'Title must be at least 5 characters';
    if (formData.description.length < 20) return 'Description must be at least 20 characters';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);

    try {
      await requestsAPI.createRequest(formData);
      setSuccess('Help request created successfully! Redirecting to home...');
      
      setFormData({
        title: '',
        description: '',
        category: '',
        urgency: '',
        location: ''
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const selectedUrgency = urgencyLevels.find(level => level.value === formData.urgency);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(25, 118, 210, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(33, 150, 243, 0.2) 0%, transparent 50%)
            `,
          }
        }}
      >
        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            animation: 'float 6s ease-in-out infinite',
            opacity: 0.3,
          }}
        >
          <Help sx={{ fontSize: 90, color: 'rgba(255, 255, 255, 0.2)' }} />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '8%',
            animation: 'float 8s ease-in-out infinite reverse',
            opacity: 0.2,
          }}
        >
          <Groups sx={{ fontSize: 120, color: 'rgba(255, 255, 255, 0.15)' }} />
        </Box>

        <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      animation: 'glow 2s ease-in-out infinite alternate',
                    }}
                  >
                    <AddCircle sx={{ fontSize: 45, color: '#1976d2', fontWeight: 'bold' }} />
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
                  Request Help
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
                  Let the <span style={{ color: '#ffffff', fontWeight: 600 }}>Help Hub</span> community support you
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '1.1rem',
                  }}
                >
                  Share your needs and connect with amazing helpers
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
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    boxShadow: '0 20px 60px rgba(25, 118, 210, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 50%, #1976d2 100%)',
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
                       Create Your Request
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                      Fill out the details below to connect with potential helpers
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
                        }}
                      >
                        {error}
                      </Alert>
                    </Grow>
                  )}
                  
                  {success && (
                    <Grow in timeout={300}>
                      <Alert 
                        severity="success" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 3,
                          background: 'rgba(25, 118, 210, 0.1)',
                          border: '1px solid rgba(25, 118, 210, 0.2)',
                        }}
                      >
                        {success}
                      </Alert>
                    </Grow>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="title"
                          label="Request Title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          disabled={loading}
                          helperText="Brief, clear title describing what you need help with"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Title sx={{ color: '#1976d2' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(248, 250, 252, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                              },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                                '& fieldset': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#1976d2',
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl required fullWidth disabled={loading}>
                          <InputLabel 
                            id="category-label"
                            sx={{
                              '&.Mui-focused': {
                                color: '#1976d2',
                                fontWeight: 600,
                              }
                            }}
                          >
                            Category
                          </InputLabel>
                          <Select
                            labelId="category-label"
                            id="category"
                            name="category"
                            value={formData.category}
                            label="Category"
                            onChange={handleChange}
                            startAdornment={
                              <InputAdornment position="start">
                                <Category sx={{ color: '#1976d2', ml: 1 }} />
                              </InputAdornment>
                            }
                            sx={{
                              borderRadius: 3,
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(248, 250, 252, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                              },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                                '& fieldset': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                }
                              }
                            }}
                          >
                            {categories.map((category) => {
                              const IconComponent = category.icon;
                              return (
                                <MenuItem key={category.value} value={category.value}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IconComponent sx={{ fontSize: 20, color: category.color }} />
                                    <Typography>{category.value}</Typography>
                                  </Box>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                        {selectedCategory && (
                          <Chip
                            label={selectedCategory.value}
                            icon={<selectedCategory.icon sx={{ fontSize: '1rem', color: 'white !important' }} />}
                            size="small"
                            sx={{
                              mt: 1,
                              background: selectedCategory.color,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl required fullWidth disabled={loading}>
                          <InputLabel 
                            id="urgency-label"
                            sx={{
                              '&.Mui-focused': {
                                color: '#1976d2',
                                fontWeight: 600,
                              }
                            }}
                          >
                            Urgency
                          </InputLabel>
                          <Select
                            labelId="urgency-label"
                            id="urgency"
                            name="urgency"
                            value={formData.urgency}
                            label="Urgency"
                            onChange={handleChange}
                            startAdornment={
                              <InputAdornment position="start">
                                <PriorityHigh sx={{ color: '#1976d2', ml: 1 }} />
                              </InputAdornment>
                            }
                            sx={{
                              borderRadius: 3,
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(248, 250, 252, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                              },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                                '& fieldset': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                }
                              }
                            }}
                          >
                            {urgencyLevels.map((level) => (
                              <MenuItem key={level.value} value={level.value}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography sx={{ fontSize: '1rem' }}>
                                    {level.icon}
                                  </Typography>
                                  <Typography>{level.value}</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {selectedUrgency && (
                          <Chip
                            label={selectedUrgency.value}
                            icon={<Typography sx={{ fontSize: '0.9rem' }}>{selectedUrgency.icon}</Typography>}
                            size="small"
                            sx={{
                              mt: 1,
                              background: selectedUrgency.color,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="location"
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          disabled={loading}
                          helperText="Where do you need help? (e.g., New York City, Remote, etc.)"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn sx={{ color: '#1976d2' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(248, 250, 252, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                              },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                                '& fieldset': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#1976d2',
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          id="description"
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                          helperText="Provide detailed information about what you need help with"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                <Description sx={{ color: '#1976d2' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(248, 250, 252, 0.8)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(248, 250, 252, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                              },
                              '&.Mui-focused': {
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                                '& fieldset': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#1976d2',
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VolunteerActivism />}
                      sx={{
                        mt: 4,
                        mb: 2,
                        py: 2,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(25, 118, 210, 0.5)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                          transform: 'none',
                          boxShadow: '0 4px 15px rgba(148, 163, 184, 0.2)',
                        }
                      }}
                    >
                      {loading ? 'Creating Request...' : 'Create Help Request'}
                    </Button>
                  </Box>
                </Paper>
              </Grow>

              {/* Encouragement Section */}
              <Fade in timeout={1200}>
                <Box textAlign="center" mt={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                       Remember
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Every request you share is an opportunity for someone to make a difference. 
                      Our community is here to support you!
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
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
              box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
              filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
            }
            100% { 
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
              filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.5));
            }
          }
        `}</style>
      </Box>

      {/* Footer Component */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          color: 'white',
          mt: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Main Footer Content */}
        <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <Favorite sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 800,
                      color: 'white',
                    }}
                  >
                    Help<span style={{ color: '#bbdefb' }}>Hub</span>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  Connecting communities through compassion. HelpHub makes it easy to find help when you need it and offer help when you can.
                </Typography>
                
                {/* Social Media Icons */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      color: 'white',
                      mb: 2,
                    }}
                  >
                    Follow Us
                  </Typography>
                  <Box display="flex" gap={1}>
                    {socialLinks.map((social, index) => {
                      const IconComponent = social.icon;
                      return (
                        <IconButton
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            width: 40,
                            height: 40,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              transform: 'translateY(-2px)',
                            }
                          }}
                        >
                          <IconComponent fontSize="small" />
                        </IconButton>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Quick Links
              </Typography>
              <List sx={{ p: 0 }}>
                {quickLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateX(4px)',
                        }
                      }}
                      onClick={() => navigate(link.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <IconComponent sx={{ color: '#bbdefb', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        primaryTypographyProps={{
                          fontFamily: 'Inter, sans-serif',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Grid>

            {/* Support */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Support
              </Typography>
              <List sx={{ p: 0 }}>
                {supportLinks.map((link, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(4px)',
                      }
                    }}
                    onClick={() => navigate(link.path)}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Contact & Legal */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Contact & Legal
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Email sx={{ color: '#bbdefb', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    support@helphub.com
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Phone sx={{ color: '#bbdefb', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    1-800-HELP-HUB
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={3}>
                  <LocationOn sx={{ color: '#bbdefb', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>

              {/* Legal Links */}
              <List sx={{ p: 0 }}>
                {legalLinks.map((link, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(4px)',
                      }
                    }}
                    onClick={() => navigate(link.path)}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Container>

        {/* Bottom Bar */}
        <Box
          sx={{
            background: 'rgba(0, 0, 0, 0.2)',
            py: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Container maxWidth="lg">
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  © 2025 HelpHub. All rights reserved. Built with ❤️ for communities worldwide.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent={{ xs: 'center', md: 'flex-end' }}
                  mt={{ xs: 2, md: 0 }}
                >
                  <Security sx={{ color: '#bbdefb', fontSize: 16, mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Trusted • Secure • Community-Driven
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default CreateRequest;
