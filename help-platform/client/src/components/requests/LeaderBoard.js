import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Avatar, 
  Box,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  EmojiEvents, 
  TrendingUp, 
  Star, 
  WorkspacePremium,
  Group,
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
  VolunteerActivism,
} from '@mui/icons-material';
import { leaderboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState({
    allTime: [],
    monthly: [],
    weekly: []
  });
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
    if (user?.id || user?._id) {
      fetchUserStats();
    }
  }, [user]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [allTimeRes, monthlyRes, weeklyRes] = await Promise.all([
        leaderboardAPI.getLeaderboard('all', 10),
        leaderboardAPI.getLeaderboard('month', 10),
        leaderboardAPI.getLeaderboard('week', 10)
      ]);

      setLeaderboardData({
        allTime: allTimeRes.data.data || [],
        monthly: monthlyRes.data.data || [],
        weekly: weeklyRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const userId = user?.id || user?._id;
      if (userId) {
        const response = await leaderboardAPI.getUserStats(userId);
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getRankIcon = (position) => {
    if (position === 0) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 28 }} />;
    if (position === 1) return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 28 }} />;
    if (position === 2) return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 28 }} />;
    return <WorkspacePremium sx={{ color: '#1976d2', fontSize: 24 }} />;
  };

  const getProgressToNextLevel = (points) => {
    if (points < 100) return { current: points, next: 100, level: 'Beginner', progress: points };
    if (points < 500) return { current: points - 100, next: 400, level: 'Helper', progress: ((points - 100) / 400) * 100 };
    if (points < 1500) return { current: points - 500, next: 1000, level: 'Expert', progress: ((points - 500) / 1000) * 100 };
    return { current: points - 1500, next: 0, level: 'Master', progress: 100 };
  };

  const getCurrentLeaders = () => {
    switch (activeTab) {
      case 1: return leaderboardData.monthly;
      case 2: return leaderboardData.weekly;
      default: return leaderboardData.allTime;
    }
  };

  const getTimeframeName = () => {
    switch (activeTab) {
      case 1: return 'Monthly';
      case 2: return 'Weekly';
      default: return 'All Time';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  const currentLeaders = getCurrentLeaders();

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              color: '#1e293b',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            🏆 Community <span style={{ color: '#1976d2' }}>Leaderboard</span>
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#64748b',
              fontWeight: 500,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Celebrating our amazing helpers and their contributions to the community
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* User Stats Card */}
          {userStats && (
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                color: 'white',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }
              }}>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Box textAlign="center" mb={3}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}>
                      {(userStats.name || user?.name || 'U').substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      Your Progress
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Rank #{userStats.rank || 'Unranked'}
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h4" fontWeight="bold">
                        {userStats.totalPoints || 0}
                      </Typography>
                      <Chip 
                        label={getProgressToNextLevel(userStats.totalPoints || 0).level}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Points Earned
                    </Typography>
                  </Box>

                  {getProgressToNextLevel(userStats.totalPoints || 0).next > 0 && (
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          Progress to Next Level
                        </Typography>
                        <Typography variant="body2">
                          {getProgressToNextLevel(userStats.totalPoints || 0).current}/
                          {getProgressToNextLevel(userStats.totalPoints || 0).next}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressToNextLevel(userStats.totalPoints || 0).progress}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white'
                          }
                        }}
                      />
                    </Box>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold">
                          {userStats.requestsCompleted || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold">
                          {userStats.badges?.length || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Badges
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {userStats.achievements && userStats.achievements.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" mb={1} sx={{ opacity: 0.9 }}>
                        Recent Achievement:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {userStats.achievements[userStats.achievements.length - 1]?.icon}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats.achievements[userStats.achievements.length - 1]?.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Leaderboard */}
          <Grid item xs={12} md={userStats ? 8 : 12}>
            <Paper elevation={0} sx={{ 
              p: 4, 
              borderRadius: '20px',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, v) => setActiveTab(v)}
                sx={{ mb: 3 }}
                variant="fullWidth"
              >
                <Tab 
                  label="All Time Champions" 
                  icon={<EmojiEvents />}
                  iconPosition="start"
                />
                <Tab 
                  label="This Month's Heroes" 
                  icon={<TrendingUp />}
                  iconPosition="start"
                />
                <Tab 
                  label="This Week's Stars" 
                  icon={<Star />}
                  iconPosition="start"
                />
              </Tabs>
              
              {currentLeaders.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Group sx={{ fontSize: 64, color: '#1976d2', opacity: 0.6, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No activity yet in this timeframe
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Be the first to help someone and claim your spot!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {currentLeaders.map((helper, index) => (
                    <ListItem 
                      key={helper.userId}
                      sx={{ 
                        mb: 2,
                        p: 3,
                        background: index < 3 
                          ? 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)' 
                          : 'rgba(248, 250, 252, 0.5)',
                        borderRadius: '16px',
                        border: index < 3 
                          ? '2px solid rgba(25, 118, 210, 0.2)' 
                          : '1px solid rgba(25, 118, 210, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%">
                        <Box sx={{ mr: 3, fontSize: '1.5rem', minWidth: 40 }}>
                          {getRankIcon(index)}
                        </Box>
                        
                        <Avatar sx={{ 
                          mr: 3, 
                          bgcolor: index < 3 ? '#1976d2' : '#64748b',
                          width: 56,
                          height: 56,
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {(helper.name || 'U').substring(0, 2).toUpperCase()}
                        </Avatar>
                        
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" color="#1e293b">
                            {helper.name || `Helper #${helper.userId.substring(0, 8)}`}
                            {helper.userId === (user?.id || user?._id) && (
                              <Chip 
                                label="You" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1, fontWeight: 'bold' }}
                              />
                            )}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              {helper.requestsCompleted || 0} requests completed
                            </Typography>
                            {helper.badges && helper.badges.length > 0 && (
                              <Chip 
                                label={`${helper.badges.length} badges`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#10b981', 
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        
                        <Box textAlign="right">
                          <Chip 
                            label={`${helper.totalPoints || 0} pts`}
                            color="primary"
                            sx={{ 
                              fontWeight: 'bold', 
                              fontSize: index < 3 ? '1.1rem' : '1rem',
                              height: index < 3 ? 36 : 32,
                              background: index < 3 
                                ? 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'
                                : undefined
                            }}
                          />
                          {index < 3 && (
                            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                              #{index + 1} Place
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Points System Info */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: '20px',
          border: '1px solid rgba(25, 118, 210, 0.1)',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        }}>
          <Typography variant="h6" fontWeight="bold" color="#0d47a1" mb={2} textAlign="center">
            🎯 How Points Are Earned
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="#1976d2" fontWeight="bold">
                  Base Points
                </Typography>
                <Typography variant="body2" color="#0d47a1">
                  50-100 points per request based on category
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="#1976d2" fontWeight="bold">
                  Urgency Bonus
                </Typography>
                <Typography variant="body2" color="#0d47a1">
                  Up to 2x multiplier for urgent requests
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="#1976d2" fontWeight="bold">
                  Quality Bonus
                </Typography>
                <Typography variant="body2" color="#0d47a1">
                  +25 points for 5-star ratings, +15 for early completion
                </Typography>
              </Box>
            </Grid>
          </Grid>
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

export default Leaderboard;
