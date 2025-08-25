import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
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
} from '@mui/material';
import {
  LocationOnOutlined,
  PersonOutlined,
  AccessTimeOutlined,
  CategoryOutlined,
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
  Help,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from './RequestContext';
import { requestsAPI } from '../../services/api';

// Blue and white color palette
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
  Low: '#4f86ff',
  Medium: '#f59e0b', 
  High: '#ef4444',
  Critical: '#dc2626'
};

// ✅ Simplified status colors (3 states only)
const statusColors = {
  Open: '#4f86ff',
  'In Progress': '#f59e0b',
  Completed: '#10b981'
};

const categoryConfig = {
  Technology: { icon: ComputerOutlined, color: '#4f86ff' },
  Education: { icon: SchoolOutlined, color: '#1565c0' }, 
  Transportation: { icon: DirectionsCarOutlined, color: '#2196f3' },
  Food: { icon: RestaurantOutlined, color: '#1e88e5' },
  Health: { icon: LocalHospitalOutlined, color: '#42a5f5' },
  Household: { icon: HomeOutlined, color: '#0d47a1' },
  Other: { icon: HelpOutlineOutlined, color: '#4f86ff' }
};

function RequestList() {
  const { requests: allRequests, getFilteredRequests, fetchRequests } = useRequests();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    urgency: 'All', 
    status: 'All'
  });
  const [displayCount, setDisplayCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLess, setLoadingLess] = useState(false);
  
  const INITIAL_DISPLAY_COUNT = 6;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    applyFilters();
  }, [filters, allRequests]);

  const applyFilters = () => {
    const filteredRequests = getFilteredRequests(filters);
    const requestsExcludingMine = filteredRequests.filter(request => {
      const requesterId = request.requester?._id || request.requester?.id || request.requester;
      const currentUserId = user?._id || user?.id;
      return requesterId !== currentUserId;
    });
    setRequests(requestsExcludingMine);
  };

  // ✅ Simplified: Offer Help (automatically accepts)
  const handleOfferHelp = async (requestId) => {
    if (!isAuthenticated) {
      setError('Please log in to help others');
      return;
    }

    try {
      await requestsAPI.offerHelp(requestId);
      setSuccess('✅ Help accepted! You can now start working on this request.');
      if (fetchRequests) {
        await fetchRequests();
      }
    } catch (error) {
      setError('Failed to offer help');
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
            boxShadow: '0 10px 25px rgba(79, 134, 255, 0.1)',
            border: '1px solid rgba(79, 134, 255, 0.1)',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2, color: '#4f86ff' }} />
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
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
                fontWeight: 800,
                color: '#1e293b',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Community Help <span style={{ color: '#4f86ff' }}>Requests</span>
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
                maxWidth: '500px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Connect with your community and make a meaningful difference
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Chip
                icon={<Help />}
                label="Your own requests are hidden - check 'My Requests' to manage them"
                sx={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: '#0d47a1',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/my-requests')}
              />
            </Box>
          </Box>

          {/* Success/Error Alerts */}
          {success && (
            <Alert 
              severity="success"
              sx={{ 
                mb: 3, 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                whiteSpace: 'pre-line'
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error"
              sx={{ 
                mb: 3, 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 8px 25px rgba(211, 47, 47, 0.15)',
                whiteSpace: 'pre-line'
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* FILTER PANEL */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              mb: 6
            }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6,
                maxWidth: 900,
                width: '100%',
                background: '#ffffff', 
                borderRadius: '24px',
                border: '2px solid rgba(79, 134, 255, 0.15)',
                boxShadow: '0 12px 40px rgba(79, 134, 255, 0.15)',
                position: 'relative',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                  borderRadius: '24px 24px 0 0',
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={5}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                    mr: 3
                  }}
                >
                  <FilterListOutlined sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography 
                  variant="h4"
                  sx={{ 
                    color: '#1e293b',
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
                  Filter Help Requests
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontWeight: 600, 
                    color: '#4f86ff',
                    fontSize: '1.1rem'
                  }}>
                    Category
                  </InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All" sx={{ fontSize: '1.1rem', py: 2.5 }}>All Categories</MenuItem>
                    {Object.entries(categoryConfig).map(([cat, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <MenuItem key={cat} value={cat} sx={{ 
                          fontWeight: 500, 
                          fontSize: '1.1rem',
                          py: 2.5
                        }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <IconComponent sx={{ fontSize: 24, color: config.color }} />
                            {cat}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontWeight: 600, 
                    color: '#4f86ff',
                    fontSize: '1.1rem'
                  }}>
                    Urgency Level
                  </InputLabel>
                  <Select
                    value={filters.urgency}
                    label="Urgency Level"
                    onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All" sx={{ fontSize: '1.1rem', py: 2.5 }}>All Urgency Levels</MenuItem>
                    {Object.keys(urgencyColors).map((level) => (
                      <MenuItem key={level} value={level} sx={{ 
                        fontWeight: 500, 
                        fontSize: '1.1rem',
                        py: 2.5
                      }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
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

                {/* ✅ Simplified status filter (3 options only) */}
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontWeight: 600, 
                    color: '#4f86ff',
                    fontSize: '1.1rem'
                  }}>
                    Request Status
                  </InputLabel>
                  <Select
                    value={filters.status}
                    label="Request Status"
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4f86ff',
                          borderWidth: '2px',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All" sx={{ fontSize: '1.1rem', py: 2.5 }}>All Status</MenuItem>
                    <MenuItem value="Open" sx={{ fontSize: '1.1rem', py: 2.5 }}>Open</MenuItem>
                    <MenuItem value="In Progress" sx={{ fontSize: '1.1rem', py: 2.5 }}>In Progress</MenuItem>
                    <MenuItem value="Completed" sx={{ fontSize: '1.1rem', py: 2.5 }}>Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box 
                sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(79, 134, 255, 0.2)',
                  mt: 5,
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#0d47a1', 
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.2rem'
                  }}
                >
                  📊 Showing {displayedRequests.length} of {requests.length} requests
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4f86ff', 
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  Use the filters above to find the most relevant help requests for your skills and availability.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* REQUEST LIST SECTION */}
          <Container maxWidth="xl">
            <Box mb={3} textAlign="center" id="requests-section">
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '1.6rem'
                }}
              >
                Available Requests ({requests.length}) 
                <Typography component="span" sx={{ color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>
                  (Your requests are hidden)
                </Typography>
              </Typography>
            </Box>

            {requests.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    background: '#ffffff', 
                    borderRadius: '20px',
                    border: '1px solid rgba(79, 134, 255, 0.1)',
                    boxShadow: '0 6px 20px rgba(79, 134, 255, 0.08)',
                    maxWidth: 500,
                    mx: 'auto'
                  }}
                >
                  <HelpOutlineOutlined sx={{ fontSize: 56, color: '#4f86ff', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontWeight: 600 }}>
                    No Requests Found
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                    Try adjusting your filters or check back later.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/my-requests')}
                    sx={{ mt: 2 }}
                  >
                    View My Requests Instead
                  </Button>
                </Paper>
              </Box>
            ) : (
              <>
                {/* Request Cards */}
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
                        const isMyRequest = (request.acceptedBy?._id === (user?._id || user?.id)) || 
                                           (request.acceptedBy?.id === (user?._id || user?.id));
                        
                        return (
                          <Card 
                            key={request._id || request.id}
                            elevation={0}
                            sx={{ 
                              background: '#ffffff',
                              borderRadius: '20px',
                              border: '1px solid rgba(79, 134, 255, 0.1)',
                              boxShadow: '0 6px 20px rgba(79, 134, 255, 0.08)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              height: '500px',
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
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    height: '26px',
                                    borderWidth: '1px',
                                  }}
                                />
                              </Box>

                              {/* Points display */}
                              {request.pointsAwarded && (
                                <Box mb={2}>
                                  <Chip
                                    icon={<Star />}
                                    label={`${request.pointsAwarded} points earned`}
                                    size="small"
                                    sx={{
                                      background: '#10b981',
                                      color: 'white',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              )}

                              {/* Description */}
                              <Typography 
                                variant="body2" 
                                sx={{ 
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
                                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
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
                                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
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
                                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
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
                                  <Typography variant="body2" sx={{ color: '#0d47a1', fontWeight: 600, fontSize: '0.75rem' }}>
                                    🤝 Being helped by: {request.acceptedBy.name}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>

                            {/* ✅ Simplified Action Buttons (3 states only) */}
                            <CardActions sx={{ p: 3, pt: 0 }}>
                              <Box sx={{ width: '100%' }}>
                                {/* Open - can offer help */}
                                {request.status === 'Open' && (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleOfferHelp(request._id || request.id)}
                                    disabled={!isAuthenticated}
                                    endIcon={<ArrowForwardOutlined />}
                                    sx={{
                                      background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      py: 2,
                                      borderRadius: '12px',
                                      fontSize: '0.9rem',
                                      letterSpacing: '0.5px',
                                      boxShadow: '0 4px 12px rgba(79, 134, 255, 0.3)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        boxShadow: '0 6px 20px rgba(79, 134, 255, 0.4)',
                                        transform: 'translateY(-1px)',
                                      }
                                    }}
                                  >
                                    {!isAuthenticated ? 'Sign In to Help' : 'Offer Help'}
                                  </Button>
                                )}

                                {/* In Progress */}
                                {request.status === 'In Progress' && (
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled
                                    startIcon={<HourglassEmptyOutlined />}
                                    sx={{ 
                                      borderColor: '#f59e0b',
                                      color: '#f59e0b',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      py: 2,
                                      borderRadius: '12px',
                                      fontSize: '0.9rem',
                                      background: 'rgba(245, 158, 11, 0.05)',
                                      '&:disabled': {
                                        borderColor: '#f59e0b',
                                        color: '#f59e0b',
                                        opacity: 0.8
                                      }
                                    }}
                                  >
                                    {isMyRequest ? 'You are helping with this' : `Being helped by ${request.acceptedBy?.name}`}
                                  </Button>
                                )}

                                {/* Completed */}
                                {request.status === 'Completed' && (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    disabled
                                    startIcon={<CheckCircleOutlined />}
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      py: 2,
                                      borderRadius: '12px',
                                      fontSize: '0.9rem',
                                      '&:disabled': {
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                    {canViewLess && (
                      <Button
                        variant="outlined"
                        onClick={handleViewLess}
                        disabled={loadingLess}
                        startIcon={loadingLess ? <CircularProgress size={20} color="inherit" /> : <ExpandLessOutlined />}
                        sx={{
                          borderColor: '#4f86ff',
                          color: '#4f86ff',
                          fontWeight: 600,
                          textTransform: 'none',
                          py: 2,
                          px: 6,
                          borderRadius: '16px',
                          fontSize: '1rem',
                          letterSpacing: '0.5px',
                          background: 'rgba(79, 134, 255, 0.05)',
                          border: '2px solid #4f86ff',
                          position: 'relative',
                          overflow: 'hidden',
                          minWidth: '180px',
                          '&:hover': {
                            background: 'rgba(79, 134, 255, 0.1)',
                            borderColor: '#3b82f6',
                            color: '#3b82f6',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(79, 134, 255, 0.2)',
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

                    {hasMoreRequests && (
                      <Button
                        variant="contained"
                        onClick={handleViewMore}
                        disabled={loadingMore}
                        startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : <ExpandMoreOutlined />}
                        sx={{
                          background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                          fontWeight: 600,
                          textTransform: 'none',
                          py: 2,
                          px: 6,
                          borderRadius: '16px',
                          fontSize: '1rem',
                          letterSpacing: '0.5px',
                          boxShadow: '0 6px 20px rgba(79, 134, 255, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          minWidth: '220px',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 8px 25px rgba(79, 134, 255, 0.4)',
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
          </Container>
        </Container>
      </Box>
    </>
  );
}

export default RequestList;
