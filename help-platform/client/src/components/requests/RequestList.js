import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Link,
  IconButton,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LocationOnOutlined,
  PersonOutlined,
  AccessTimeOutlined,
  CategoryOutlined,
  HandshakeOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  ComputerOutlined,
  SchoolOutlined,
  DirectionsCarOutlined,
  RestaurantOutlined,
  LocalHospitalOutlined,
  HomeOutlined,
  HelpOutlineOutlined,
  FilterListOutlined,
  ArrowForwardOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Favorite,
  Send,
  Help,
  Security,
  Group,
  EmojiEvents,
  VolunteerActivism,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';

// Sample requests data
const SAMPLE_REQUESTS = [
  {
    "_id": "1",
    "title": "Need volunteers for community clean-up",
    "description": "Seeking help to organize a local cleaning event in the park. We need people to help coordinate and participate in the cleanup activities.",
    "category": "Household",
    "urgency": "Medium",
    "status": "Open",
    "location": "City Park, Downtown",
    "requester": {"name": "Alice Johnson"},
    "createdAt": "2025-08-20T08:30:00Z",
    "acceptedBy": null
  },
  {
    "_id": "2",
    "title": "Grocery delivery for elderly neighbor",
    "description": "Looking for someone to help deliver groceries to a senior citizen who cannot leave their home due to mobility issues.",
    "category": "Food",
    "urgency": "Low",
    "status": "Open",
    "location": "Downtown Area",
    "requester": {"name": "Bob Wilson"},
    "createdAt": "2025-08-21T12:15:00Z",
    "acceptedBy": null
  },
  {
    "_id": "3",
    "title": "Math tutoring needed for students",
    "description": "Seeking a volunteer to tutor middle school students in mathematics. Basic algebra and geometry help required.",
    "category": "Education",
    "urgency": "High",
    "status": "Open",
    "location": "Community Center",
    "requester": {"name": "Carol Davis"},
    "createdAt": "2025-08-22T09:45:00Z",
    "acceptedBy": null
  },
  {
    "_id": "4",
    "title": "Computer setup assistance required",
    "description": "Help needed to set up a computer for an elderly individual. Includes basic software installation and internet setup.",
    "category": "Technology",
    "urgency": "Low",
    "status": "Completed",
    "location": "Westside Neighborhood",
    "requester": {"name": "Dave Miller"},
    "createdAt": "2025-08-18T15:00:00Z",
    "acceptedBy": {"name": "Eve Thompson"}
  },
  {
    "_id": "5",
    "title": "Medical supplies donation drive",
    "description": "Collecting donations for local clinic medical supplies. Need volunteers to help organize and distribute supplies.",
    "category": "Health",
    "urgency": "Critical",
    "status": "In Progress",
    "location": "Health Clinic, Main St",
    "requester": {"name": "Frank Garcia"},
    "createdAt": "2025-08-19T10:20:00Z",
    "acceptedBy": {"name": "Grace Lee"}
  },
  {
    "_id": "6",
    "title": "Transportation help needed",
    "description": "Seeking someone to provide rides to medical appointments for elderly residents in the community.",
    "category": "Transportation",
    "urgency": "Medium",
    "status": "Open",
    "location": "Various Locations",
    "requester": {"name": "Helen Rodriguez"},
    "createdAt": "2025-08-23T14:30:00Z",
    "acceptedBy": null
  },
  {
    "_id": "7",
    "title": "English conversation practice",
    "description": "Native English speakers needed to help immigrants practice conversational English in a supportive environment.",
    "category": "Education",
    "urgency": "Low",
    "status": "Open",
    "location": "Library Conference Room",
    "requester": {"name": "Ivan Petrov"},
    "createdAt": "2025-08-24T11:00:00Z",
    "acceptedBy": null
  },
  {
    "_id": "8",
    "title": "Home repair assistance",
    "description": "Need help with basic home repairs including fixing a leaky faucet and painting a room for a single mother.",
    "category": "Household",
    "urgency": "Medium",
    "status": "Open",
    "location": "Riverside District",
    "requester": {"name": "Julia Martinez"},
    "createdAt": "2025-08-23T16:45:00Z",
    "acceptedBy": null
  },
  {
    "_id": "9",
    "title": "Website development help",
    "description": "Small nonprofit needs help creating a simple website to showcase their community programs and accept donations.",
    "category": "Technology",
    "urgency": "Low",
    "status": "Open",
    "location": "Community Center",
    "requester": {"name": "Kevin Chang"},
    "createdAt": "2025-08-22T13:20:00Z",
    "acceptedBy": null
  },
  {
    "_id": "10",
    "title": "Food bank volunteering",
    "description": "Local food bank needs volunteers to help sort and pack food donations for distribution to families in need.",
    "category": "Food",
    "urgency": "High",
    "status": "Open",
    "location": "Food Bank Warehouse",
    "requester": {"name": "Linda Brown"},
    "createdAt": "2025-08-21T08:15:00Z",
    "acceptedBy": null
  }
];

// Blue and white color palette - professional theme
const blueShades = [
  {
    primary: '#1976d2',
    secondary: '#2196f3',
    light: '#e3f2fd',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  },
  {
    primary: '#1565c0',
    secondary: '#1976d2',
    light: '#e8eaf6',
    gradient: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  },
  {
    primary: '#0d47a1',
    secondary: '#1565c0',
    light: '#e1f5fe',
    gradient: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
  },
  {
    primary: '#42a5f5',
    secondary: '#64b5f6',
    light: '#e3f2fd',
    gradient: 'linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)',
  },
  {
    primary: '#1e88e5',
    secondary: '#42a5f5',
    light: '#e8eaf6',
    gradient: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
  },
  {
    primary: '#2196f3',
    secondary: '#42a5f5',
    light: '#e1f5fe',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
  },
];

const urgencyColors = {
  Low: '#1976d2',
  Medium: '#1565c0', 
  High: '#0d47a1',
  Critical: '#0c2461'
};

const statusColors = {
  Open: '#1976d2',
  'In Progress': '#1565c0',
  Completed: '#0d47a1'
};

const categoryConfig = {
  Technology: { icon: ComputerOutlined, color: '#1976d2' },
  Education: { icon: SchoolOutlined, color: '#1565c0' }, 
  Transportation: { icon: DirectionsCarOutlined, color: '#2196f3' },
  Food: { icon: RestaurantOutlined, color: '#1e88e5' },
  Health: { icon: LocalHospitalOutlined, color: '#42a5f5' },
  Household: { icon: HomeOutlined, color: '#0d47a1' },
  Other: { icon: HelpOutlineOutlined, color: '#1976d2' }
};

function RequestList() {
  const [requests, setRequests] = useState(SAMPLE_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    urgency: 'All', 
    status: 'All'
  });
  const [displayCount, setDisplayCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLess, setLoadingLess] = useState(false);
  const [email, setEmail] = useState('');
  
  const INITIAL_DISPLAY_COUNT = 6;
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    let filteredRequests = SAMPLE_REQUESTS;
    
    if (filters.category !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.category === filters.category);
    }
    if (filters.urgency !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.urgency === filters.urgency);
    }
    if (filters.status !== 'All') {
      filteredRequests = filteredRequests.filter(req => req.status === filters.status);
    }
    
    setRequests(filteredRequests);
  };

  const handleAcceptRequest = async (requestId) => {
    if (!isAuthenticated) {
      setError('Please log in to help others');
      return;
    }

    try {
      setError('');
      setError('Request accepted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleViewMore = () => {
    setLoadingMore(true);
    
    setTimeout(() => {
      setDisplayCount(prev => prev + 6);
      setLoadingMore(false);
    }, 800);
  };

  const handleViewLess = () => {
    setLoadingLess(true);
    
    setTimeout(() => {
      setDisplayCount(INITIAL_DISPLAY_COUNT);
      setLoadingLess(false);
      
      const requestsSection = document.getElementById('requests-section');
      if (requestsSection) {
        requestsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createMatrix = (items) => {
    const matrix = [];
    for (let i = 0; i < items.length; i += 2) {
      matrix.push(items.slice(i, i + 2));
    }
    return matrix;
  };

  const displayedRequests = requests.slice(0, displayCount);
  const requestMatrix = createMatrix(displayedRequests);
  const hasMoreRequests = displayCount < requests.length;
  const canViewLess = displayCount > INITIAL_DISPLAY_COUNT;

  // Footer data
  const quickLinks = [
    { label: 'Help Requests', path: '/', icon: Group },
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: '24px',
            textAlign: 'center',
            background: '#ffffff',
            boxShadow: '0 10px 25px rgba(25, 118, 210, 0.1)',
            border: '1px solid rgba(25, 118, 210, 0.1)',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', fontWeight: 600 }}>
            Loading Help Requests...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                color: '#1e293b',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Community Help <span style={{ color: '#1976d2' }}>Requests</span>
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#64748b',
                fontWeight: 500,
                maxWidth: '500px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Connect with your community and make a meaningful difference
            </Typography>
          </Box>

          {/* Error/Success Alert */}
          {error && (
            <Alert 
              severity={error.includes('successfully') ? 'success' : 'error'}
              sx={{ 
                mb: 3, 
                borderRadius: '16px',
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                boxShadow: error.includes('successfully') 
                  ? '0 8px 25px rgba(76, 175, 80, 0.15)' 
                  : '0 8px 25px rgba(211, 47, 47, 0.15)',
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Enlarged Filter Panel */}
            <Grid item xs={12} lg={5}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4,
                  background: '#ffffff', 
                  borderRadius: '20px',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: 100
                }}
              >
                <Box display="flex" alignItems="center" mb={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                      mr: 2
                    }}
                  >
                    <FilterListOutlined sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="h5"
                    sx={{ 
                      fontFamily: 'Inter, sans-serif',
                      color: '#1e293b',
                      fontWeight: 700,
                    }}
                  >
                    Filter Requests
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 600, 
                      color: '#1976d2',
                      fontSize: '1rem'
                    }}>
                      Category
                    </InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        minHeight: '56px',
                        fontSize: '1rem',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          }
                        }
                      }}
                    >
                      <MenuItem value="All" sx={{ fontSize: '1rem', py: 2 }}>All Categories</MenuItem>
                      {Object.entries(categoryConfig).map(([cat, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <MenuItem key={cat} value={cat} sx={{ 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: 500, 
                            fontSize: '1rem',
                            py: 2
                          }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <IconComponent sx={{ fontSize: 20, color: config.color }} />
                              {cat}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 600, 
                      color: '#1976d2',
                      fontSize: '1rem'
                    }}>
                      Urgency Level
                    </InputLabel>
                    <Select
                      value={filters.urgency}
                      label="Urgency Level"
                      onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        minHeight: '56px',
                        fontSize: '1rem',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          }
                        }
                      }}
                    >
                      <MenuItem value="All" sx={{ fontSize: '1rem', py: 2 }}>All Urgency Levels</MenuItem>
                      {Object.keys(urgencyColors).map((level) => (
                        <MenuItem key={level} value={level} sx={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 500, 
                          fontSize: '1rem',
                          py: 2
                        }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: urgencyColors[level] 
                              }} 
                            />
                            {level}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 600, 
                      color: '#1976d2',
                      fontSize: '1rem'
                    }}>
                      Request Status
                    </InputLabel>
                    <Select
                      value={filters.status}
                      label="Request Status"
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        minHeight: '56px',
                        fontSize: '1rem',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          }
                        }
                      }}
                    >
                      <MenuItem value="All" sx={{ fontSize: '1rem', py: 2 }}>All Status</MenuItem>
                      <MenuItem value="Open" sx={{ fontSize: '1rem', py: 2 }}>Open</MenuItem>
                      <MenuItem value="In Progress" sx={{ fontSize: '1rem', py: 2 }}>In Progress</MenuItem>
                      <MenuItem value="Completed" sx={{ fontSize: '1rem', py: 2 }}>Completed</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Filter Info */}
                  <Box 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      borderRadius: '12px',
                      border: '1px solid rgba(25, 118, 210, 0.2)',
                      mt: 2
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Inter, sans-serif', 
                        color: '#0d47a1', 
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      📊 Showing {displayedRequests.length} of {requests.length} requests
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Inter, sans-serif', 
                        color: '#1976d2', 
                        fontSize: '0.85rem',
                        lineHeight: 1.4
                      }}
                    >
                      Use the filters above to find the most relevant help requests for your skills and availability.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Side - 2×m Matrix */}
            <Grid item xs={12} lg={7}>
              <Box mb={3} id="requests-section">
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'Inter, sans-serif',
                    color: '#1e293b',
                    fontWeight: 700,
                    fontSize: '1.4rem'
                  }}
                >
                  Available Requests ({requests.length})
                </Typography>
              </Box>

              {requests.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    background: '#ffffff', 
                    borderRadius: '20px',
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
                  }}
                >
                  <HelpOutlineOutlined sx={{ fontSize: 56, color: '#1976d2', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', mb: 1, fontWeight: 600 }}>
                    No Requests Found
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
                    Try adjusting your filters or check back later.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {/* 2×m Matrix Layout */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                    {requestMatrix.map((row, rowIndex) => (
                      <Box 
                        key={rowIndex}
                        sx={{ 
                          display: 'grid',
                          gridTemplateColumns: row.length === 2 ? '1fr 1fr' : '1fr 1fr',
                          gap: 2.5,
                          '@media (max-width: 768px)': {
                            gridTemplateColumns: '1fr',
                          }
                        }}
                      >
                        {row.map((request, colIndex) => {
                          const index = rowIndex * 2 + colIndex;
                          const CategoryIcon = categoryConfig[request.category]?.icon || HelpOutlineOutlined;
                          const cardColor = blueShades[index % blueShades.length];
                          
                          return (
                            <Card 
                              key={request._id}
                              elevation={0}
                              sx={{ 
                                background: '#ffffff',
                                borderRadius: '20px',
                                border: '1px solid rgba(25, 118, 210, 0.1)',
                                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: '450px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  boxShadow: `0 12px 30px ${cardColor.primary}20`,
                                  transform: 'translateY(-4px)',
                                  borderColor: `${cardColor.primary}40`,
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '3px',
                                  background: cardColor.gradient,
                                }
                              }}
                            >
                              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Header */}
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} sx={{ height: '50px' }}>
                                  <Typography 
                                    variant="h6" 
                                    component="h3" 
                                    sx={{ 
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 700,
                                      color: '#1e293b',
                                      flex: 1,
                                      mr: 2,
                                      fontSize: '1rem',
                                      lineHeight: 1.3,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {request.title}
                                  </Typography>
                                  <Chip
                                    label={request.urgency}
                                    size="small"
                                    sx={{
                                      background: urgencyColors[request.urgency],
                                      color: 'white',
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 600,
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      height: '24px',
                                      boxShadow: `0 2px 8px ${urgencyColors[request.urgency]}30`,
                                    }}
                                  />
                                </Box>

                                {/* Category and Status */}
                                <Box display="flex" alignItems="center" gap={1.5} mb={2} sx={{ height: '28px' }}>
                                  <Chip
                                    icon={<CategoryIcon />}
                                    label={request.category}
                                    size="small"
                                    sx={{
                                      background: cardColor.light,
                                      color: cardColor.primary,
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 600,
                                      border: `1px solid ${cardColor.primary}30`,
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      height: '26px'
                                    }}
                                  />
                                  <Chip
                                    label={request.status}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderColor: statusColors[request.status],
                                      color: statusColors[request.status],
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 600,
                                      borderRadius: '10px',
                                      fontSize: '0.7rem',
                                      height: '26px',
                                      borderWidth: '1px',
                                    }}
                                  />
                                </Box>

                                {/* Description */}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#475569',
                                    mb: 2,
                                    lineHeight: 1.5,
                                    height: '72px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  {request.description}
                                </Typography>

                                {/* Details */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, height: '75px' }}>
                                  <Box display="flex" alignItems="center">
                                    <Box
                                      sx={{
                                        p: 0.4,
                                        borderRadius: '6px',
                                        background: `${cardColor.primary}15`,
                                        mr: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <LocationOnOutlined sx={{ color: cardColor.primary, fontSize: 14 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                                      {request.location}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" alignItems="center">
                                    <Box
                                      sx={{
                                        p: 0.4,
                                        borderRadius: '6px',
                                        background: `${cardColor.primary}15`,
                                        mr: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <PersonOutlined sx={{ color: cardColor.primary, fontSize: 14 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                                      {request.requester?.name || 'Anonymous'}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" alignItems="center">
                                    <Box
                                      sx={{
                                        p: 0.4,
                                        borderRadius: '6px',
                                        background: `${cardColor.primary}15`,
                                        mr: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <AccessTimeOutlined sx={{ color: cardColor.primary, fontSize: 14 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                                      {formatDate(request.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Helper Info */}
                                {request.status === 'In Progress' && request.acceptedBy && (
                                  <Box 
                                    sx={{ 
                                      p: 1.5, 
                                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                      borderRadius: '10px',
                                      border: '1px solid #2196f3',
                                      mb: 1.5
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#0d47a1', fontWeight: 600, fontSize: '0.75rem' }}>
                                      🤝 Being helped by: {request.acceptedBy.name}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>

                              {/* Professional Action Buttons */}
                              <CardActions sx={{ p: 3, pt: 0 }}>
                                <Box sx={{ width: '100%' }}>
                                  {request.status === 'Open' && (
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      onClick={() => handleAcceptRequest(request._id)}
                                      disabled={!isAuthenticated || (user && request.requester._id === user.id)}
                                      endIcon={<ArrowForwardOutlined />}
                                      sx={{
                                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        py: 2,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                                          transform: 'translateY(-1px)',
                                        },
                                        '&:active': {
                                          transform: 'translateY(0px)',
                                        },
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                                          pointerEvents: 'none',
                                        }
                                      }}
                                    >
                                      {!isAuthenticated 
                                        ? 'Sign In to Help'
                                        : (user && request.requester._id === user.id)
                                        ? 'Your Request'
                                        : 'Offer Help'
                                      }
                                    </Button>
                                  )}

                                  {request.status === 'In Progress' && (
                                    <Button
                                      fullWidth
                                      variant="outlined"
                                      disabled
                                      startIcon={<HourglassEmptyOutlined />}
                                      sx={{ 
                                        borderColor: '#1976d2',
                                        color: '#1976d2',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        py: 2,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        background: 'rgba(25, 118, 210, 0.05)',
                                        '&:disabled': {
                                          borderColor: '#1976d2',
                                          color: '#1976d2',
                                          opacity: 0.8
                                        }
                                      }}
                                    >
                                      In Progress
                                    </Button>
                                  )}

                                  {request.status === 'Completed' && (
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      disabled
                                      startIcon={<CheckCircleOutlined />}
                                      sx={{ 
                                        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        py: 2,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        '&:disabled': {
                                          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                                          color: 'white',
                                          opacity: 0.9
                                        }
                                      }}
                                    >
                                      Completed Successfully
                                    </Button>
                                  )}
                                </Box>
                              </CardActions>
                            </Card>
                          );
                        })}
                        
                        {/* Fill empty space if odd number of requests in last row */}
                        {row.length === 1 && (
                          <Box sx={{ visibility: 'hidden' }}>
                            {/* Empty placeholder for grid alignment */}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {/* VIEW MORE / VIEW LESS BUTTONS */}
                  {(hasMoreRequests || canViewLess) && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 3, 
                      mt: 4,
                      flexWrap: 'wrap'
                    }}>
                      {/* VIEW LESS BUTTON */}
                      {canViewLess && (
                        <Button
                          variant="outlined"
                          onClick={handleViewLess}
                          disabled={loadingLess}
                          startIcon={loadingLess ? <CircularProgress size={20} color="inherit" /> : <ExpandLessOutlined />}
                          sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 2,
                            px: 6,
                            borderRadius: '16px',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            background: 'rgba(25, 118, 210, 0.05)',
                            border: '2px solid #1976d2',
                            position: 'relative',
                            overflow: 'hidden',
                            minWidth: '180px',
                            '&:hover': {
                              background: 'rgba(25, 118, 210, 0.1)',
                              borderColor: '#1565c0',
                              color: '#1565c0',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.2)',
                            },
                            '&:disabled': {
                              borderColor: '#90caf9',
                              color: '#90caf9',
                              background: 'rgba(144, 202, 249, 0.05)',
                              opacity: 0.8
                            }
                          }}
                        >
                          {loadingLess ? 'Collapsing...' : 'View Less'}
                        </Button>
                      )}

                      {/* VIEW MORE BUTTON */}
                      {hasMoreRequests && (
                        <Button
                          variant="contained"
                          onClick={handleViewMore}
                          disabled={loadingMore}
                          startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreOutlined />}
                          sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 2,
                            px: 6,
                            borderRadius: '16px',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            minWidth: '220px',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
                              color: 'white',
                              opacity: 0.8
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)',
                              pointerEvents: 'none',
                            }
                          }}
                        >
                          {loadingMore ? 'Loading More...' : `View More (${requests.length - displayCount} remaining)`}
                        </Button>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer Component - Added Directly */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
          color: 'white',
          mt: 8,
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
                    Help<span style={{ color: '#64b5f6' }}>Hub</span>
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
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <IconComponent sx={{ color: '#64b5f6', fontSize: 20 }} />
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
                  <Email sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
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
                  <Phone sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
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
                  <LocationOn sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
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
                  <Security sx={{ color: '#64b5f6', fontSize: 16, mr: 1 }} />
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

export default RequestList;
