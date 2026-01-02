import React, { useState } from 'react';
import {
  Add,
  LocationOn,
  AccessTime,
  Category,
  Edit,
  CheckCircle,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn as Location,
  Favorite,
  Send,
  Help,
  Security,
  EmojiEvents,
  VolunteerActivism,
  Group,
} from '@mui/icons-material';

import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Grid,
  Alert,
  CardActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
} from '@mui/material';

import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from './RequestContext';
import { useNavigate } from 'react-router-dom';

// Status and urgency colors
const statusColors = {
  Open: '#4f86ff',
  'In Progress': '#f59e0b',
  Completed: '#10b981'
};

const urgencyColors = {
  Low: '#6b7280',
  Medium: '#f59e0b', 
  High: '#ef4444',
  Critical: '#dc2626'
};

function MyRequests() {
  const { user } = useAuth();
  const { requests, fetchRequests, completeRequest } = useRequests();
  const navigate = useNavigate();
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Filter requests to show only current user's requests
  const myRequests = requests.filter(request => 
    request.requester?._id === user?._id || 
    request.requester?.id === user?._id ||
    request.requester === user?._id ||
    request.requester?._id === user?.id ||
    request.requester?.id === user?.id ||
    request.requester === user?.id
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ FIXED: Use completeRequest from context
  const handleConfirmCompletion = async (requestId) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🎯 Confirming completion for request:', requestId);
      
      const confirmationData = {
        completedEarly: false
      };

      // Use completeRequest from context
      const result = await completeRequest(requestId, confirmationData);
      
      console.log('✅ Completion result:', result);
      
      if (result) {
        const points = result.points || 0;
        
        // Force refresh after completion
        setTimeout(() => {
          if (fetchRequests) {
            fetchRequests();
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Completion error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to confirm completion. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Footer handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Newsletter subscription:', email);
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

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

  if (myRequests.length === 0) {
    return (
      <>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(79, 134, 255, 0.1)',
              boxShadow: '0 10px 40px rgba(79, 134, 255, 0.1)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  color: '#1e293b',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                My Requests
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Track and manage all your help requests in one place
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 6, 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: 3,
              border: '1px solid rgba(79, 134, 255, 0.2)',
              maxWidth: 500,
              mx: 'auto'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                🚀 Ready to Get Started?
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
                You haven't created any help requests yet. Create your first request and connect with amazing helpers in your community!
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<Add />}
                onClick={() => navigate('/create-request')}
                sx={{
                  background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                  fontWeight: 600,
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 25px rgba(79, 134, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(79, 134, 255, 0.4)',
                  }
                }}
              >
                Create Your First Request
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* ✅ INTEGRATED FOOTER */}
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
          {/* Newsletter Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
              py: 4,
              position: 'relative',
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      mb: 1,
                      color: 'white',
                    }}
                  >
                    Stay Connected with HelpHub
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                    }}
                  >
                    Get updates on new help requests and community stories
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    component="form"
                    onSubmit={handleNewsletterSubmit}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      p: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontFamily: 'Inter, sans-serif',
                          px: 2,
                          py: 1,
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<Send />}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0c2461 100%)',
                        }
                      }}
                    >
                      Subscribe
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>

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
                        onClick={() => handleNavigation(link.path)}
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
                      onClick={() => handleNavigation(link.path)}
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
                    <Location sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
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
                      onClick={() => handleNavigation(link.path)}
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

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Success/Error Alerts */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            My Requests
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              fontWeight: 400,
              mb: 3
            }}
          >
            You have <strong>{myRequests.length}</strong> request{myRequests.length !== 1 ? 's' : ''}
          </Typography>
          
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ color: statusColors.Open, fontWeight: 700 }}>
                  {myRequests.filter(r => r.status === 'Open').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Open</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ color: statusColors['In Progress'], fontWeight: 700 }}>
                  {myRequests.filter(r => r.status === 'In Progress').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>In Progress</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ color: statusColors.Completed, fontWeight: 700 }}>
                  {myRequests.filter(r => r.status === 'Completed').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Completed</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Requests Grid */}
        <Grid container spacing={3}>
          {myRequests.map(request => (
            <Grid item xs={12} md={6} key={request._id || request.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(79, 134, 255, 0.15)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header with Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 2 }}>
                      {request.title}
                    </Typography>
                    <Chip 
                      label={request.status} 
                      sx={{
                        backgroundColor: statusColors[request.status],
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    paragraph
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                      mb: 3
                    }}
                  >
                    {request.description}
                  </Typography>
                  
                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<Category />}
                      label={request.category} 
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        borderColor: '#e2e8f0',
                        '&:hover': { borderColor: '#4f86ff' }
                      }}
                    />
                    <Chip 
                      label={request.urgency}
                      size="small"
                      sx={{
                        backgroundColor: urgencyColors[request.urgency],
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  
                  {/* Details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="body2" color="textSecondary">
                        {request.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="body2" color="textSecondary">
                        Created {formatDate(request.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Helper Info */}
                  {request.status === 'In Progress' && request.acceptedBy && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#f0f9ff',
                      borderRadius: 2,
                      border: '1px solid #bae6fd'
                    }}>
                      <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 600 }}>
                        🤝 Being helped by: {request.acceptedBy.name || request.acceptedBy}
                      </Typography>
                    </Box>
                  )}

                  {/* Show Points if Completed */}
                  {request.status === 'Completed' && request.pointsAwarded && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#f0fdf4',
                      borderRadius: 2,
                      border: '1px solid #bbf7d0'
                    }}>
                      <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
                        🎯 Helper earned {request.pointsAwarded} points!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 2 }}>
                  {/* Status Info Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/dashboard')}
                      sx={{ color: '#64748b' }}
                    >
                      View All Requests
                    </Button>
                    
                    {request.status === 'Open' && (
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                        ✓ Available for help
                      </Typography>
                    )}
                    
                    {request.status === 'In Progress' && (
                      <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                        🔄 Helper is working
                      </Typography>
                    )}
                    
                    {request.status === 'Completed' && (
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                        ✅ Completed
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  
                  {/* Open - Can edit request */}
                  {request.status === 'Open' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/edit-request/${request._id}`)}
                      sx={{
                        color: '#4f86ff',
                        borderColor: '#4f86ff',
                        '&:hover': {
                          background: 'rgba(79, 134, 255, 0.1)',
                          borderColor: '#3b82f6',
                        }
                      }}
                    >
                      Edit Request
                    </Button>
                  )}

                  {/* In Progress - Confirm completion button */}
                  {request.status === 'In Progress' && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => handleConfirmCompletion(request._id || request.id)}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                        '&:disabled': {
                          opacity: 0.7
                        }
                      }}
                    >
                      {loading ? 'Confirming...' : 'Confirm Completion & Award Points'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Create Another Request Button */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/create-request')}
            sx={{
              background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
              fontWeight: 600,
              py: 2,
              px: 4,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 8px 25px rgba(79, 134, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(79, 134, 255, 0.4)',
              }
            }}
          >
            Create Another Request
          </Button>
        </Box>
      </Container>

      {/* ✅ INTEGRATED FOOTER */}
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
        {/* Newsletter Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            py: 4,
            position: 'relative',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    mb: 1,
                    color: 'white',
                  }}
                >
                  Stay Connected with HelpHub
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1rem',
                  }}
                >
                  Get updates on new help requests and community stories
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  component="form"
                  onSubmit={handleNewsletterSubmit}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    p: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontFamily: 'Inter, sans-serif',
                        px: 2,
                        py: 1,
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<Send />}
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                      borderRadius: '8px',
                      px: 3,
                      py: 1.5,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0c2461 100%)',
                      }
                    }}
                  >
                    Subscribe
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

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
                      onClick={() => handleNavigation(link.path)}
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
                    onClick={() => handleNavigation(link.path)}
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
                  <Location sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
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
                    onClick={() => handleNavigation(link.path)}
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

export default MyRequests;
