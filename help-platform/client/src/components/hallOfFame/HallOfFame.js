import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  Favorite,
  TrendingUp,
  VolunteerActivism,
  Celebration,
  Groups,
  LocalFireDepartment,
  AutoAwesome,
  Close,
  Share,
  PersonAdd,
  Create,
  Email,
  Phone,
  LocationOn,
  Security,
  ExpandMore,
  ExpandLess,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Send,
  Help,
  Description,
  Group,
} from '@mui/icons-material';
import { helpAPI, storiesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function HallOfFame() {
  const [topHelpers, setTopHelpers] = useState([]);
  const [stats, setStats] = useState({});
  const [inspiringStories, setInspiringStories] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [openStoryDialog, setOpenStoryDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showPostStoryModal, setShowPostStoryModal] = useState(false);
  const [storyData, setStoryData] = useState({
    title: '',
    description: '',
    category: '',
    impact: '',
    helpType: []
  });
  
  // Stories visibility state for View More/Less
  const [visibleStoriesCount, setVisibleStoriesCount] = useState(4);
  
  // Footer newsletter state
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();

  const categories = [
    'Tech Support',
    'Senior Care', 
    'Mental Health',
    'Community Building',
    'Emergency Response',
    'Education',
    'Home Repairs',
    'Transportation'
  ];

  const helpTypes = [
    'One-time Help',
    'Ongoing Support',
    'Emergency Response',
    'Skill Sharing',
    'Community Project'
  ];

  useEffect(() => {
    fetchHallOfFameData();
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  const fetchHallOfFameData = async () => {
    try {
      setLoading(true);
      
      const [helpersResponse, statsResponse, storiesResponse] = await Promise.all([
        helpAPI.getHallOfFame(),
        helpAPI.getStats(),
        storiesAPI.getInspiringStories(10)
      ]);
      
      console.log('API Responses:', { helpersResponse, statsResponse, storiesResponse });
      
      const helpersData = helpersResponse?.data || helpersResponse;
      setTopHelpers(Array.isArray(helpersData) ? helpersData : []);
      
      const statsData = statsResponse?.data || statsResponse;
      setStats(statsData || {});
      
      let storiesArray = [];
      if (Array.isArray(storiesResponse?.data)) {
        storiesArray = storiesResponse.data;
      } else if (storiesResponse?.data?.data && Array.isArray(storiesResponse.data.data)) {
        storiesArray = storiesResponse.data.data;
      } else if (Array.isArray(storiesResponse)) {
        storiesArray = storiesResponse;
      }
      
      setInspiringStories(storiesArray);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch Hall of Fame data');
      
      // Fallback data with 8+ stories to test View More/Less
      setTopHelpers([
        {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',
          helpCount: 25,
          rating: 4.8
        },
        {
          _id: '2', 
          name: 'Maria Rodriguez',
          email: 'maria@example.com',
          helpCount: 18,
          rating: 4.6
        },
        {
          _id: '3',
          name: 'John Smith',
          email: 'john@example.com',
          helpCount: 12,
          rating: 4.4
        }
      ]);
      
      setInspiringStories([
        {
          id: 1,
          title: 'The Teacher Who Changed Everything',
          helper: 'Anonymous Hero',
          story: 'Started teaching children under a tree with just a blackboard. Today, the initiative has grown into a full school serving 200+ students.',
          impact: '200+ students educated',
          category: 'Education',
          rating: 4.9,
          location: 'Rural India'
        },
        {
          id: 2,
          title: 'Coding Mentor Saves Lives',
          helper: 'Tech Guru',
          story: 'Late-night coding sessions turned into mentoring dozens of aspiring developers, changing their career paths forever.',
          impact: '50+ developers trained',
          category: 'Tech Support',
          rating: 4.7,
          location: 'Silicon Valley'
        },
        {
          id: 3,
          title: 'Community Garden Initiative',
          helper: 'Green Thumb',
          story: 'Started a small community garden that now feeds 100 families and brings the neighborhood together.',
          impact: '100+ families fed',
          category: 'Community Building',
          rating: 4.8,
          location: 'Local Community'
        },
        {
          id: 4,
          title: 'Emergency Medical Response Team',
          helper: 'Dr. Emergency',
          story: 'Built a volunteer medical response team that has saved countless lives during emergencies and natural disasters.',
          impact: '500+ lives saved',
          category: 'Emergency Response',
          rating: 4.9,
          location: 'Nationwide'
        },
        {
          id: 5,
          title: 'Senior Care Network',
          helper: 'Caring Angel',
          story: 'Created a network of volunteers providing daily care and companionship to elderly residents in our community.',
          impact: '150+ seniors supported',
          category: 'Senior Care',
          rating: 4.8,
          location: 'Local Community'
        },
        {
          id: 6,
          title: 'Mental Health First Aid',
          helper: 'Wellness Warrior',
          story: 'Trained volunteers to provide mental health first aid and crisis support in schools and workplaces.',
          impact: '300+ people helped',
          category: 'Mental Health',
          rating: 4.7,
          location: 'Regional'
        },
        {
          id: 7,
          title: 'Home Repair Heroes',
          helper: 'Handy Helper',
          story: 'Organized volunteers to help elderly and disabled residents with home repairs and maintenance.',
          impact: '80+ homes repaired',
          category: 'Home Repairs',
          rating: 4.6,
          location: 'City Wide'
        },
        {
          id: 8,
          title: 'Transportation Angels',
          helper: 'Ride Share Hero',
          story: 'Created a volunteer network providing free transportation to medical appointments for those in need.',
          impact: '1000+ rides provided',
          category: 'Transportation',
          rating: 4.8,
          location: 'Metro Area'
        }
      ]);

      setStats({
        totalHelpers: 42,
        totalHelp: 156,
        averageRating: 4.6
      });
    } finally {
      setLoading(false);
    }
  };

  // Button handlers
  const handleJoinHeroes = () => {
    navigate('/become-helper');
  };

  const handleStartHelping = () => {
    navigate('/help-requests');
  };

  const handleStartJourney = () => {
    navigate('/onboarding');
  };
  
  const handleShareStory = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Help Hub Hall of Fame',
        text: 'Check out these inspiring stories of helpers making a difference!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const openStory = (story) => {
    setSelectedStory(story);
    setOpenStoryDialog(true);
  };

  const handleSubmitStory = async () => {
    try {
      if (!storyData.title || !storyData.description || !storyData.category) {
        alert('Please fill in all required fields');
        return;
      }

      await storiesAPI.submitStory(storyData);
      
      alert('Story submitted successfully!');
      setShowPostStoryModal(false);
      setStoryData({ title: '', description: '', category: '', impact: '', helpType: [] });
      
      fetchHallOfFameData();
      
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Error submitting story');
    }
  };

  // Toggle visible stories function
  const toggleVisibleStories = () => {
    if (visibleStoriesCount >= safeInspiringStories.length) {
      setVisibleStoriesCount(4); // Show less - back to 4
    } else {
      setVisibleStoriesCount(safeInspiringStories.length); // Show all
    }
  };

  // Footer handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <EmojiEvents sx={{ color: '#FFD700', fontSize: 40, filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' }} />
            <AutoAwesome sx={{ 
              position: 'absolute', 
              top: -5, 
              right: -5, 
              color: '#FFD700', 
              fontSize: 20,
              animation: 'sparkle 3s infinite'
            }} />
          </Box>
        );
      case 1:
        return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 36, filter: 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))' }} />;
      case 2:
        return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 32, filter: 'drop-shadow(0 0 6px rgba(205, 127, 50, 0.6))' }} />;
      default:
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)'
            }}
          >
            {index + 1}
          </Box>
        );
    }
  };

  const getRankGradient = (index) => {
    switch (index) {
      case 0:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
      case 1:
        return 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)';
      case 2:
        return 'linear-gradient(135deg, #D2691E 0%, #CD7F32 50%, #B8860B 100%)';
      default:
        return 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)';
    }
  };

  const generateAvatar = (name) => {
    if (!name) return '#1976d2';
    const gradients = [
      'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
      'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
      'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
      'linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)',
      'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
      'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
      'linear-gradient(135deg, #0277bd 0%, #0288d1 100%)',
      'linear-gradient(135deg, #039be5 0%, #03a9f4 100%)',
    ];
    const gradientIndex = name.length % gradients.length;
    return gradients[gradientIndex];
  };

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

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 6,
          m: 2,
        }}
      >
        <CircularProgress 
          size={80} 
          thickness={4}
          sx={{ 
            color: '#1976d2',
            '& .MuiCircularProgress-circle': {
              filter: 'drop-shadow(0 0 10px rgba(25, 118, 210, 0.4))'
            }
          }} 
        />
        <Typography variant="h5" sx={{ mt: 3, color: '#1976d2', fontWeight: 600 }}>
          Loading Hall of Fame...
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
          Preparing amazing helpers showcase ✨
        </Typography>
      </Box>
    );
  }

  const safeTopHelpers = Array.isArray(topHelpers) ? topHelpers : [];
  const safeInspiringStories = Array.isArray(inspiringStories) ? inspiringStories : [];

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Fade in timeout={1000}>
            <Box textAlign="center" mb={6}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Celebration 
                  sx={{ 
                    fontSize: 60, 
                    color: '#1976d2',
                    filter: 'drop-shadow(0 0 20px rgba(25, 118, 210, 0.3))',
                    animation: showConfetti ? 'gentleBounce 3s ease-in-out infinite' : 'none'
                  }} 
                />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                🏆 Hall of Fame
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Celebrating our amazing <span style={{ color: '#1976d2', fontWeight: 600 }}>Help Hub</span> heroes
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={handleJoinHeroes}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  Join Heroes
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Create />}
                  onClick={() => setShowPostStoryModal(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(13, 71, 161, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0a3d91 0%, #0d47a1 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(13, 71, 161, 0.4)',
                    }
                  }}
                >
                  Post Your Story
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Share />}
                  onClick={handleShareStory}
                  sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    background: 'rgba(25, 118, 210, 0.02)',
                    '&:hover': {
                      borderColor: '#1565c0',
                      background: 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Share Stories
                </Button>
              </Box>
            </Box>
          </Fade>

          {error && (
            <Grow in timeout={500}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 6, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)',
                }}
              >
                {error}
              </Alert>
            </Grow>
          )}

          {/* ✅ INSPIRING STORIES SECTION - 2 COLUMN MATRIX */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.08)',
            }}
          >
            <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
              🌟 Inspiring Stories
            </Typography>
            
            {safeInspiringStories.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary">
                  No inspiring stories yet. Be the first to share yours!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowPostStoryModal(true)}
                  sx={{ mt: 2 }}
                >
                  Share Your Story
                </Button>
              </Box>
            ) : (
              <>
                {/* ✅ 2 COLUMN GRID LAYOUT */}
                <Grid container spacing={3}>
                  {safeInspiringStories.slice(0, visibleStoriesCount).map((story, index) => (
                    <Grid item xs={12} sm={6} key={story.id || index}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: '16px',
                          border: '1px solid rgba(25, 118, 210, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
                          },
                        }}
                        onClick={() => openStory(story)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            {story.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {story.story?.substring(0, 150)}...
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip
                              label={story.category}
                              size="small"
                              sx={{
                                background: '#1976d2',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            <Box display="flex" alignItems="center">
                              <Star sx={{ color: '#ffd700', mr: 0.5, fontSize: 16 }} />
                              <Typography variant="body2">
                                {story.rating || '4.5'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* View More/View Less Button */}
                {safeInspiringStories.length > 4 && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={toggleVisibleStories}
                      startIcon={visibleStoriesCount >= safeInspiringStories.length ? <ExpandLess /> : <ExpandMore />}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                        }
                      }}
                    >
                      {visibleStoriesCount >= safeInspiringStories.length ? 'View Less' : 'View More'}
                    </Button>
                    
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                      Showing {Math.min(visibleStoriesCount, safeInspiringStories.length)} of {safeInspiringStories.length} stories
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>

          {/* Top Helpers Section */}
          {safeTopHelpers.length === 0 ? (
            <Grow in timeout={1200}>
              <Paper 
                elevation={0} 
                sx={{ 
                  py: 10, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  background: '#ffffff',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
                }}
              >
                <Box sx={{ fontSize: 100, mb: 3 }}>🌟</Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                  Be the First Hero!
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto' }}>
                  The Hall of Fame is waiting for its first legendary helper. Start helping others today!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LocalFireDepartment />}
                  onClick={handleStartHelping}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                  }}
                >
                  Start Helping Now
                </Button>
              </Paper>
            </Grow>
          ) : (
            <>
              <Box textAlign="center" mb={5}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#1e293b',
                    mb: 2,
                  }}
                >
                  🌟 Our Legendary Heroes
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748b' }}>
                  These amazing people make Help Hub a magical place
                </Typography>
              </Box>
              
              {/* Top 3 Heroes */}
              <Grid container spacing={4} sx={{ mb: 6 }} justifyContent="center">
                {safeTopHelpers.slice(0, 3).map((helper, index) => (
                  <Grid item xs={12} md={4} key={helper._id || index}>
                    <Grow in timeout={1000 + index * 200}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          background: getRankGradient(index),
                          color: 'white',
                          textAlign: 'center',
                          borderRadius: 4,
                          transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.3s ease-out',
                          '&:hover': { 
                            transform: index === 0 ? 'scale(1.08)' : 'scale(1.03)',
                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        {index === 0 && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: -20, 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              fontSize: '2rem',
                            }}
                          >
                            👑
                          </Box>
                        )}
                        
                        <Box sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                          {getRankIcon(index)}
                        </Box>
                        
                        <CardContent sx={{ pt: 6, pb: 4 }}>
                          <Avatar
                            sx={{
                              width: index === 0 ? 100 : 80,
                              height: index === 0 ? 100 : 80,
                              mx: 'auto',
                              mb: 2,
                              background: generateAvatar(helper.name),
                              fontSize: index === 0 ? '2.5rem' : '2rem',
                              fontWeight: 800,
                            }}
                          >
                            {helper.name?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                          
                          <Typography 
                            variant={index === 0 ? "h5" : "h6"} 
                            sx={{ fontWeight: 800, mb: 1 }}
                          >
                            {helper.name}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            {helper.email}
                          </Typography>
                          
                          <Box display="flex" justifyContent="center" gap={1.5} flexWrap="wrap">
                            <Chip
                              icon={<VolunteerActivism />}
                              label={`${helper.helpCount || 0}`}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.25)', 
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              icon={<Star />}
                              label={`${helper.rating?.toFixed(1) || '5.0'}`}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.25)', 
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          
                          {index === 0 && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 2,
                                fontWeight: 700,
                                color: '#FFD700',
                                fontSize: '1rem',
                              }}
                            >
                              🏆 CHAMPION 🏆
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>

              {/* Rest of Heroes */}
              {safeTopHelpers.length > 3 && (
                <>
                  <Divider sx={{ mb: 4 }} />
                  <Box textAlign="center" mb={3}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      🌟 Rising Stars
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {safeTopHelpers.slice(3).map((helper, index) => (
                      <Grid item xs={12} sm={6} md={4} key={helper._id || index}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            borderRadius: 4,
                            background: '#ffffff',
                            border: '1px solid rgba(25, 118, 210, 0.1)',
                            transition: 'all 0.3s ease-out',
                            '&:hover': { 
                              boxShadow: '0 12px 25px rgba(25, 118, 210, 0.15)', 
                              transform: 'translateY(-3px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Box sx={{ minWidth: 50, textAlign: 'center', mr: 2 }}>
                                {getRankIcon(index + 3)}
                              </Box>
                              <Avatar
                                sx={{
                                  width: 60,
                                  height: 60,
                                  background: generateAvatar(helper.name),
                                  mr: 2,
                                  fontWeight: 700,
                                  fontSize: '1.5rem',
                                }}
                              >
                                {helper.name?.charAt(0)?.toUpperCase() || '?'}
                              </Avatar>
                              <Box flexGrow={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {helper.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {helper.email}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Chip
                                icon={<VolunteerActivism />}
                                label={`${helper.helpCount || 0} helps`}
                                sx={{
                                  background: '#1976d2',
                                  color: 'white',
                                  fontWeight: 500,
                                }}
                                size="small"
                              />
                              <Box display="flex" alignItems="center">
                                <Star sx={{ color: '#ffd700', mr: 0.5, fontSize: 18 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {helper.rating?.toFixed(1) || '5.0'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}

          {/* Call to Action */}
          <Box textAlign="center" mt={8}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 4,
                background: '#ffffff',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                Ready to Join Our Heroes? 🚀
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 600, mx: 'auto' }}>
                Every great helper started with a single act of kindness. Begin your journey today!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<VolunteerActivism />}
                onClick={handleStartJourney}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                Start Your Hero Journey
              </Button>
            </Paper>
          </Box>
        </Container>

        {/* Post Story Modal */}
        <Modal 
          open={showPostStoryModal} 
          onClose={() => setShowPostStoryModal(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box sx={{
            width: { xs: '90%', md: 600 },
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Share Your Hero Story ✨
              </Typography>
              <IconButton onClick={() => setShowPostStoryModal(false)}>
                <Close />
              </IconButton>
            </Box>

            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Inspire others by sharing how you made a difference in someone's life
            </Typography>

            <TextField
              fullWidth
              label="Story Title"
              placeholder="e.g., 'The Late-Night Coding Mentor'"
              value={storyData.title}
              onChange={(e) => setStoryData({...storyData, title: e.target.value})}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Story"
              placeholder="Tell us about the help you provided and its impact..."
              value={storyData.description}
              onChange={(e) => setStoryData({...storyData, description: e.target.value})}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    label="Category"
                    value={storyData.category}
                    onChange={(e) => setStoryData({...storyData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Impact Achieved"
                  placeholder="e.g., '50+ students helped'"
                  value={storyData.impact}
                  onChange={(e) => setStoryData({...storyData, impact: e.target.value})}
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Type of Help
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {helpTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    clickable
                    color={storyData.helpType.includes(type) ? 'primary' : 'default'}
                    onClick={() => {
                      const newTypes = storyData.helpType.includes(type)
                        ? storyData.helpType.filter(t => t !== type)
                        : [...storyData.helpType, type];
                      setStoryData({...storyData, helpType: newTypes});
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowPostStoryModal(false)}
                sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmitStory}
                disabled={!storyData.title || !storyData.description}
                sx={{ 
                  borderRadius: 3, 
                  textTransform: 'none', 
                  px: 3,
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                }}
              >
                Submit Story
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Story Dialog */}
        <Dialog
          open={openStoryDialog}
          onClose={() => setOpenStoryDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          {selectedStory && (
            <>
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedStory.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 600 }}>
                    {selectedStory.helper} • {selectedStory.location}
                  </Typography>
                </Box>
                <IconButton onClick={() => setOpenStoryDialog(false)}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {selectedStory.story || selectedStory.fullStory}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={3} width="100%">
                  <Box display="flex" alignItems="center">
                    <Star sx={{ color: '#ffd700', mr: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedStory.rating || '4.5'} Rating
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Impact: <strong>{selectedStory.impact}</strong>
                  </Typography>
                  <Button 
                    onClick={() => setOpenStoryDialog(false)}
                    sx={{ ml: 'auto', textTransform: 'none' }}
                  >
                    Close
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Custom animations */}
        <style jsx>{`
          @keyframes sparkle {
            0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
            50% { transform: rotate(180deg) scale(1.1); opacity: 0.9; }
          }
          
          @keyframes gentleBounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </Box>

      {/* ✅ INTEGRATED FOOTER COMPONENT */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
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

export default HallOfFame;
