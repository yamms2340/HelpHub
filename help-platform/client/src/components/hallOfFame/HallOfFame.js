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
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  Favorite,
  TrendingUp,
} from '@mui/icons-material';
import { helpAPI } from '../../services/api';

function HallOfFame() {
  const [topHelpers, setTopHelpers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHallOfFameData();
  }, []);

  const fetchHallOfFameData = async () => {
    try {
      setLoading(true);
      
      // Fetch both hall of fame and stats
      const [helpersResponse, statsResponse] = await Promise.all([
        helpAPI.getHallOfFame(),
        helpAPI.getStats()
      ]);
      
      setTopHelpers(helpersResponse.data);
      setStats(statsResponse.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch Hall of Fame data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <EmojiEvents sx={{ color: '#FFD700', fontSize: 30 }} />; // Gold
      case 1:
        return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 28 }} />; // Silver
      case 2:
        return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 26 }} />; // Bronze
      default:
        return <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4f86ff' }}>
          #{index + 1}
        </Typography>;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'; // Gold
      case 1:
        return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'; // Silver
      case 2:
        return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'; // Bronze
      default:
        return 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)'; // Your app's blue
    }
  };

  const generateAvatar = (name) => {
    const colors = ['#4f86ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    const colorIndex = name.length % colors.length;
    return colors[colorIndex];
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{
          background: 'linear-gradient(135deg, rgba(79, 134, 255, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          borderRadius: 4,
          m: 4,
        }}
      >
        <CircularProgress size={60} sx={{ color: '#4f86ff' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#64748b' }}>
          Loading Hall of Fame...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 800, 
            color: '#1e293b',
            mb: 2,
            background: 'linear-gradient(135deg, #4f86ff 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Hall of Fame
        </Typography>
        <Typography variant="h5" color="#64748b" sx={{ fontWeight: 400 }}>
          Celebrating our most helpful community members
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Platform Statistics */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 5, 
          mb: 6, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 8px 32px rgba(79, 134, 255, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h5" 
          align="center"
          sx={{ fontWeight: 700, color: '#1e293b', mb: 4 }}
        >
          Platform Statistics
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Favorite sx={{ fontSize: 40, color: '#ef4444' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                {stats.totalHelp || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b', fontSize: '1.1rem' }}>
                Total Help Provided
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <TrendingUp sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                {stats.totalHelpers || 0}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b', fontSize: '1.1rem' }}>
                Active Helpers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Star sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                {(stats.averageRating || 0).toFixed(1)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b', fontSize: '1.1rem' }}>
                Average Rating
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Top Helpers */}
      {topHelpers.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            py: 10, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(79, 134, 255, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <Box sx={{ fontSize: 64, mb: 3 }}>🏆</Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#64748b' }}>
            No helpers found yet
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
            Be the first to help others and earn your place in the Hall of Fame!
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
            🌟 Top Helpers
          </Typography>
          
          {/* Top 3 Special Display */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {topHelpers.slice(0, 3).map((helper, index) => (
              <Grid item xs={12} md={4} key={helper._id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: getRankColor(index),
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)' }}>
                    {getRankIcon(index)}
                  </Box>
                  <CardContent sx={{ pt: 5, pb: 4 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {helper.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {helper.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                      {helper.email}
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={2}>
                      <Chip
                        label={`${helper.helpCount} Helps`}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                      <Chip
                        label={`${helper.rating.toFixed(1)} ⭐`}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Rest of the helpers */}
          {topHelpers.length > 3 && (
            <>
              <Divider sx={{ mb: 4, opacity: 0.3 }} />
              <Grid container spacing={3}>
                {topHelpers.slice(3).map((helper, index) => (
                  <Grid item xs={12} sm={6} md={4} key={helper._id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 4,
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        '&:hover': { 
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', 
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
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
                              bgcolor: generateAvatar(helper.name),
                              mr: 2,
                              fontWeight: 600,
                              fontSize: '1.5rem'
                            }}
                          >
                            {helper.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {helper.name}
                            </Typography>
                            <Typography variant="body2" color="#64748b">
                              {helper.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={`${helper.helpCount} helps`}
                            sx={{
                              background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                              color: 'white',
                              fontWeight: 500,
                              borderRadius: 2,
                            }}
                            size="small"
                          />
                          <Box display="flex" alignItems="center">
                            <Star sx={{ color: '#f59e0b', mr: 0.5, fontSize: 20 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {helper.rating.toFixed(1)}
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
    </Container>
  );
}

export default HallOfFame;
