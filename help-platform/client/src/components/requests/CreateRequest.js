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
import { useRequests } from './RequestContext';

const categories = [
  { value: 'Technology', icon: Computer, color: '#1976d2' },
  { value: 'Education', icon: School, color: '#2196f3' },
  { value: 'Transportation', icon: DriveEta, color: '#1565c0' },
  { value: 'Food', icon: Restaurant, color: '#0d47a1' },
  { value: 'Health', icon: LocalHospital, color: '#42a5f5' },
  { value: 'Household', icon: Business, color: '#1e88e5' },
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
  
  const { isAuthenticated, user } = useAuth();
  const { addRequest, fetchRequests } = useRequests();
  const navigate = useNavigate();

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
      console.log('➕ Creating request with data:', formData);
      
      // Create request via context (which calls API)
      const newRequest = await addRequest(formData);
      
      console.log('✅ Request created:', newRequest);
      
      setSuccess('🎉 Help request created successfully! Redirecting to view all requests...');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        urgency: '',
        location: ''
      });
      
      // Force refresh the requests in the context
      if (fetchRequests) {
        await fetchRequests();
      }
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate('/dashboard'); // Navigate to dashboard to see all requests
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating request:', error);
      setError(error.response?.data?.message || 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyRequests = () => {
    navigate('/my-requests');
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
                      ✨ Create Your Request
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
                        onClose={() => setError('')}
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
                        action={
                          <Button color="inherit" size="small" onClick={handleViewMyRequests}>
                            View My Requests
                          </Button>
                        }
                        onClose={() => setSuccess('')}
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
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
}

export default CreateRequest;
