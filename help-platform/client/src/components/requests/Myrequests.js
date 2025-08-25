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
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
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
  Security,
  Group,
  EmojiEvents,
  VolunteerActivism,
  Star,
  Create,
  Edit,
  Delete,
  Visibility,
  AddCircle,
  Help,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from './RequestContext';

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

function MyRequests() {
  const { requests: allRequests, updateRequest, deleteRequest } = useRequests();
  const [requests, setRequests] = useState([]);
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
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    request: null,
    title: '',
    description: '',
    category: '',
    urgency: '',
    location: ''
  });

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    requestId: null,
    title: ''
  });
  
  const INITIAL_DISPLAY_COUNT = 6;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    applyFilters();
  }, [filters, allRequests, isAuthenticated, navigate]);

  const applyFilters = () => {
    // Get only user's requests
    const myRequests = allRequests.filter(request => 
      request.requester._id === (user?.id || 'current-user-id')
    );
    
    // Apply filters
    let filteredRequests = myRequests;
    
    if (filters.category !== 'All') {
      filteredRequests = filteredRequests.filter(request => request.category === filters.category);
    }
    
    if (filters.urgency !== 'All') {
      filteredRequests = filteredRequests.filter(request => request.urgency === filters.urgency);
    }
    
    if (filters.status !== 'All') {
      filteredRequests = filteredRequests.filter(request => request.status === filters.status);
    }
    
    setRequests(filteredRequests);
  };

  const handleEditRequest = (request) => {
    setEditDialog({
      open: true,
      request: request,
      title: request.title,
      description: request.description,
      category: request.category,
      urgency: request.urgency,
      location: request.location
    });
  };

  const handleSaveEdit = () => {
    try {
      updateRequest(editDialog.request._id, {
        title: editDialog.title,
        description: editDialog.description,
        category: editDialog.category,
        urgency: editDialog.urgency,
        location: editDialog.location,
        updatedAt: new Date().toISOString()
      });
      
      setError('✅ Request updated successfully!');
      setEditDialog({
        open: false,
        request: null,
        title: '',
        description: '',
        category: '',
        urgency: '',
        location: ''
      });
    } catch (error) {
      setError('Failed to update request');
    }
  };

  const handleDeleteRequest = (requestId, title) => {
    setDeleteDialog({
      open: true,
      requestId: requestId,
      title: title
    });
  };

  const confirmDelete = () => {
    try {
      deleteRequest(deleteDialog.requestId);
      setError('🗑️ Request deleted successfully!');
      setDeleteDialog({
        open: false,
        requestId: null,
        title: ''
      });
    } catch (error) {
      setError('Failed to delete request');
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
      
      const requestsSection = document.getElementById('my-requests-section');
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

  // Footer data
  const quickLinks = [
    { label: 'Help Requests', path: '/', icon: Group },
    { label: 'My Requests', path: '/my-requests', icon: Create },
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
            Loading Your Requests...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
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
              My Help <span style={{ color: '#1976d2' }}>Requests</span>
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#64748b',
                fontWeight: 500,
                maxWidth: '600px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Manage and track all the help requests you've created
            </Typography>
            
            {/* Quick Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => navigate('/create-request')}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Create New Request
              </Button>
              <Button
                variant="outlined"
                startIcon={<Group />}
                onClick={() => navigate('/')}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Browse All Requests
              </Button>
            </Box>
          </Box>

          {/* Error/Success Alert */}
          {error && (
            <Alert 
              severity={error.includes('successfully') || error.includes('✅') || error.includes('🗑️') ? 'success' : 'error'}
              sx={{ 
                mb: 3, 
                borderRadius: '16px',
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                boxShadow: error.includes('successfully') || error.includes('✅') || error.includes('🗑️')
                  ? '0 8px 25px rgba(76, 175, 80, 0.15)' 
                  : '0 8px 25px rgba(211, 47, 47, 0.15)',
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
                border: '2px solid rgba(25, 118, 210, 0.15)',
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                position: 'relative',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  borderRadius: '24px 24px 0 0',
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={5}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    mr: 3
                  }}
                >
                  <FilterListOutlined sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontFamily: 'Inter, sans-serif',
                    color: '#1e293b',
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
                  Filter My Requests
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: 600, 
                    color: '#1976d2',
                    fontSize: '1.1rem'
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
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
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
                          fontFamily: 'Inter, sans-serif', 
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
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: 600, 
                    color: '#1976d2',
                    fontSize: '1.1rem'
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
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All" sx={{ fontSize: '1.1rem', py: 2.5 }}>All Urgency Levels</MenuItem>
                    {Object.keys(urgencyColors).map((level) => (
                      <MenuItem key={level} value={level} sx={{ 
                        fontFamily: 'Inter, sans-serif', 
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

                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: 600, 
                    color: '#1976d2',
                    fontSize: '1.1rem'
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
                      borderRadius: '16px',
                      minHeight: '64px',
                      fontSize: '1.1rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
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

              {/* Enhanced Filter Info */}
              <Box 
                sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(25, 118, 210, 0.2)',
                  mt: 5,
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#0d47a1', 
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.2rem'
                  }}
                >
                  📊 Showing {displayedRequests.length} of {requests.length} your requests
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#1976d2', 
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  Manage your requests - edit details, track progress, and see who's helping you.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* MY REQUESTS SECTION */}
          <Container maxWidth="xl">
            <Box mb={3} textAlign="center" id="my-requests-section">
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: 'Inter, sans-serif',
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '1.6rem'
                }}
              >
                Your Requests ({requests.length})
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
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
                    maxWidth: 500,
                    mx: 'auto'
                  }}
                >
                  <Create sx={{ fontSize: 56, color: '#1976d2', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', mb: 1, fontWeight: 600 }}>
                    No Requests Found
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif', color: '#64748b', mb: 3 }}>
                    {allRequests.filter(r => r.requester._id === (user?.id || 'current-user-id')).length === 0 
                      ? "You haven't created any help requests yet." 
                      : "Try adjusting your filters to see your requests."}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    onClick={() => navigate('/create-request')}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                      borderRadius: '12px'
                    }}
                  >
                    Create Your First Request
                  </Button>
                </Paper>
              </Box>
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
                              height: '550px',
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
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              )}

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
                                    <AccessTimeOutlined sx={{ color: cardColor.primary, fontSize: 14 }} />
                                  </Box>
                                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                                    Created: {formatDate(request.createdAt)}
                                  </Typography>
                                </Box>

                                {request.updatedAt && request.updatedAt !== request.createdAt && (
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
                                      <Edit sx={{ color: cardColor.primary, fontSize: 14 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                                      Updated: {formatDate(request.updatedAt)}
                                    </Typography>
                                  </Box>
                                )}
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

                            {/* Action Buttons */}
                            <CardActions sx={{ p: 3, pt: 0 }}>
                              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Primary Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {request.status === 'Open' && (
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      startIcon={<Edit />}
                                      onClick={() => handleEditRequest(request)}
                                      sx={{
                                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  
                                  {request.status === 'Open' && (
                                    <Button
                                      fullWidth
                                      variant="outlined"
                                      color="error"
                                      startIcon={<Delete />}
                                      onClick={() => handleDeleteRequest(request._id, request.title)}
                                      sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </Box>

                                {/* Status Display */}
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
                                      py: 1.5,
                                      borderRadius: '12px',
                                      fontSize: '0.9rem',
                                      background: 'rgba(25, 118, 210, 0.05)',
                                    }}
                                  >
                                    In Progress - Being Helped
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
                                      py: 1.5,
                                      borderRadius: '12px',
                                      fontSize: '0.9rem',
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
                          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          textTransform: 'none',
                          py: 2,
                          px: 6,
                          borderRadius: '16px',
                          fontSize: '1rem',
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

      {/* Edit Request Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({...editDialog, open: false})} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 700, 
          fontSize: '1.5rem',
          color: '#1e293b',
          pb: 2
        }}>
          ✏️ Edit Your Request
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Request Title"
              value={editDialog.title}
              onChange={(e) => setEditDialog({...editDialog, title: e.target.value})}
              sx={{ borderRadius: '12px' }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={editDialog.description}
              onChange={(e) => setEditDialog({...editDialog, description: e.target.value})}
              sx={{ borderRadius: '12px' }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editDialog.category}
                  label="Category"
                  onChange={(e) => setEditDialog({...editDialog, category: e.target.value})}
                >
                  {Object.entries(categoryConfig).map(([cat, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <MenuItem key={cat} value={cat}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconComponent sx={{ fontSize: 20, color: config.color }} />
                          {cat}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={editDialog.urgency}
                  label="Urgency"
                  onChange={(e) => setEditDialog({...editDialog, urgency: e.target.value})}
                >
                  {Object.keys(urgencyColors).map((level) => (
                    <MenuItem key={level} value={level}>
                      <Box display="flex" alignItems="center" gap={1}>
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
            </Box>

            <TextField
              fullWidth
              label="Location"
              value={editDialog.location}
              onChange={(e) => setEditDialog({...editDialog, location: e.target.value})}
              sx={{ borderRadius: '12px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialog({...editDialog, open: false})}
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              borderRadius: '12px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              borderRadius: '12px',
              px: 4
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({...deleteDialog, open: false})}
        PaperProps={{
          sx: { borderRadius: '20px' }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 700, 
          color: '#dc2626'
        }}>
          🗑️ Delete Request
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Inter, sans-serif' }}>
            Are you sure you want to delete "<strong>{deleteDialog.title}</strong>"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog({...deleteDialog, open: false})}
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              borderRadius: '12px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              borderRadius: '12px'
            }}
          >
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer Component */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
          color: 'white',
          mt: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
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

export default MyRequests;
