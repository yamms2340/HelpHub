import React, { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import { 
  EmojiEvents, 
  TrendingUp, 
  Star, 
  WorkspacePremium,
  CardGiftcard,
  Group,
  Timeline
} from '@mui/icons-material';
import { useRequests } from '../requests/RequestContext';
import { useAuth } from '../../contexts/AuthContext';

function Leaderboard() {
  const { getLeaderboard, getUserStats } = useRequests();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  
  const allTimeLeaders = getLeaderboard('all', 10);
  const monthlyLeaders = getLeaderboard('month', 10);
  const weeklyLeaders = getLeaderboard('week', 10);

  const currentUserStats = getUserStats(user?.id || 'current-user-id');

  const getRankIcon = (position) => {
    if (position === 0) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 28 }} />; // Gold
    if (position === 1) return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 28 }} />; // Silver  
    if (position === 2) return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 28 }} />; // Bronze
    return <WorkspacePremium sx={{ color: '#1976d2', fontSize: 24 }} />;
  };

  const getProgressToNextLevel = (points) => {
    if (points < 100) return { current: points, next: 100, level: 'Beginner', progress: points };
    if (points < 500) return { current: points - 100, next: 400, level: 'Helper', progress: ((points - 100) / 400) * 100 };
    if (points < 1500) return { current: points - 500, next: 1000, level: 'Expert', progress: ((points - 500) / 1000) * 100 };
    return { current: points - 1500, next: 0, level: 'Master', progress: 100 };
  };

  const currentLeaders = activeTab === 0 ? allTimeLeaders : activeTab === 1 ? monthlyLeaders : weeklyLeaders;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                  {(user?.name || 'U').substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  Your Progress
                </Typography>
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h4" fontWeight="bold">
                    {currentUserStats.totalPoints}
                  </Typography>
                  <Chip 
                    label={getProgressToNextLevel(currentUserStats.totalPoints).level}
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

              {getProgressToNextLevel(currentUserStats.totalPoints).next > 0 && (
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Progress to Next Level
                    </Typography>
                    <Typography variant="body2">
                      {getProgressToNextLevel(currentUserStats.totalPoints).current}/
                      {getProgressToNextLevel(currentUserStats.totalPoints).next}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressToNextLevel(currentUserStats.totalPoints).progress}
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
                      {currentUserStats.requestsCompleted}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {currentUserStats.badges?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Badges
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {currentUserStats.achievements && currentUserStats.achievements.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" mb={1} sx={{ opacity: 0.9 }}>
                    Recent Achievement:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      {currentUserStats.achievements[currentUserStats.achievements.length - 1]?.icon}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {currentUserStats.achievements[currentUserStats.achievements.length - 1]?.name}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={8}>
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
                        {helper.userId.substring(0, 2).toUpperCase()}
                      </Avatar>
                      
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                          Helper #{helper.userId.substring(0, 8)}
                          {helper.userId === (user?.id || 'current-user-id') && (
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
                            {helper.requestsCompleted} requests completed
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
                          label={`${helper.totalPoints} pts`}
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
                50-120 points per request based on category
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
                +25% for 5-star ratings, +15% for early completion
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Leaderboard;
