import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Badge,
  Container,
  LinearProgress,
  Divider,
} from '@mui/material';
import { 
  PersonOutline,
  VolunteerActivism,
  EmojiEvents,
  Security,
  Verified,
  Groups,
  Favorite,
  Star,
  TrendingUp,
  WorkspacePremium,
  Leaderboard as LeaderboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from '../requests/RequestContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getUserStats, getLeaderboard } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Get current user's stats
  const currentUserStats = getUserStats(user?.id || 'current-user-id');
  const leaderboard = getLeaderboard('all', 10);
  const userPosition = leaderboard.findIndex(leader => leader.userId === (user?.id || 'current-user-id')) + 1;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/home';
    navigate('/home', { replace: true });
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Calculate level and progress
  const getProgressToNextLevel = (points) => {
    if (points < 100) return { current: points, next: 100, level: 'Beginner', progress: points, color: '#64748b' };
    if (points < 500) return { current: points - 100, next: 400, level: 'Helper', progress: ((points - 100) / 400) * 100, color: '#1976d2' };
    if (points < 1500) return { current: points - 500, next: 1000, level: 'Expert', progress: ((points - 500) / 1000) * 100, color: '#2196f3' };
    return { current: points - 1500, next: 0, level: 'Master', progress: 100, color: '#10b981' };
  };

  const levelInfo = getProgressToNextLevel(currentUserStats.totalPoints);

  // Check if current page is active
  const isActivePage = (path) => location.pathname === path;

  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '1px solid rgba(25, 118, 210, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 2px 20px rgba(25, 118, 210, 0.04)',
      }}
    >
      <Container maxWidth="xl">
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ py: 2, px: 0, justifyContent: 'space-between' }}>
            {/* Logo Section */}
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: '0 0 auto',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  '& .logo-text': { color: '#1976d2' }
                }
              }}
              onClick={() => handleNavigation('/home')}
            >
              <Typography 
                className="logo-text"
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 800,
                  color: '#1e293b',
                  fontSize: '1.8rem',
                  lineHeight: 1.2,
                  letterSpacing: '-0.025em',
                  transition: 'color 0.3s ease',
                  fontFamily: '"Inter", "Roboto", sans-serif',
                }}
              >
                Help<span style={{ color: '#1976d2' }}>Hub</span>
              </Typography>
            </Box>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Buttons - Only show if authenticated */}
            {isAuthenticated && (
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: 1, 
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '8px 12px',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
                border: '1px solid rgba(25, 118, 210, 0.06)',
                mr: 2,
              }}>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/dashboard')}
                  startIcon={<Groups sx={{ fontSize: '20px', color: '#1976d2' }} />}
                  sx={{ 
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    color: isActivePage('/dashboard') ? '#1565c0' : '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    background: isActivePage('/dashboard') ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'transparent',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      color: '#1565c0',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Help Requests
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/leaderboard')}
                  startIcon={<LeaderboardIcon sx={{ color: '#2196f3', fontSize: '20px' }} />}
                  sx={{ 
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    color: isActivePage('/leaderboard') ? '#0d47a1' : '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    background: isActivePage('/leaderboard') ? 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)' : 'transparent',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
                      color: '#0d47a1',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Leaderboard
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/hall-of-fame')}
                  startIcon={<EmojiEvents sx={{ color: '#f59e0b', fontSize: '20px' }} />}
                  sx={{ 
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    color: isActivePage('/hall-of-fame') ? '#d97706' : '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    background: isActivePage('/hall-of-fame') ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'transparent',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      color: '#d97706',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Hall of Fame
                </Button>
              </Box>
            )}

            {/* Right Section */}
            {isAuthenticated ? (
              <Box display="flex" alignItems="center" gap={2}>
                {/* Points Display */}
                <Box sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                  borderRadius: '20px',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <Star sx={{ color: 'white', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {currentUserStats.totalPoints}
                  </Typography>
                  <Chip 
                    label={levelInfo.level}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      height: '20px',
                    }}
                  />
                </Box>

                {/* CTA Button */}
                <Button
                  variant="contained"
                  startIcon={<VolunteerActivism />}
                  onClick={() => handleNavigation('/create-request')}
                  sx={{
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    background: isActivePage('/create-request') 
                      ? 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1565c0 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #1976d2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1565c0 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                      pointerEvents: 'none',
                    }
                  }}
                >
                  Request Help →
                </Button>

                {/* User Avatar with Stats */}
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ 
                    p: 0,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Badge
                    badgeContent={currentUserStats.requestsCompleted || 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        border: '2px solid white',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e3ebf0',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#1976d2',
                          boxShadow: '0 6px 16px rgba(25, 118, 210, 0.2)',
                        }
                      }}
                    >
                      <PersonOutline sx={{ color: '#475569', fontSize: 22 }} />
                    </Box>
                  </Badge>
                </IconButton>
                
                {/* Enhanced Menu with Points */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: '20px',
                      minWidth: 320,
                      mt: 1,
                      background: '#ffffff',
                      boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
                      border: '1px solid rgba(25, 118, 210, 0.06)',
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* User Info Section */}
                  <Box sx={{ px: 3, py: 3, borderBottom: '1px solid #e3ebf6' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '25px',
                          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonOutline sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b', fontSize: '1rem' }}>
                          {user?.name || 'Helper'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Points & Level Display */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                          <Typography variant="h6" fontWeight="bold" color="#1e293b">
                            {currentUserStats.totalPoints}
                          </Typography>
                          <Typography variant="body2" color="#64748b">
                            points
                          </Typography>
                        </Box>
                        <Chip
                          label={levelInfo.level}
                          size="small"
                          sx={{
                            background: levelInfo.color,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>

                      {/* Progress Bar */}
                      {levelInfo.next > 0 && (
                        <Box>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="#64748b">
                              Progress to {levelInfo.level === 'Beginner' ? 'Helper' : 
                                          levelInfo.level === 'Helper' ? 'Expert' : 'Master'}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              {levelInfo.current}/{levelInfo.next}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={levelInfo.progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(25, 118, 210, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                                borderRadius: 3,
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Stats Grid */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2} mb={2}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                          {currentUserStats.requestsCompleted}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          Completed
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                          {currentUserStats.badges?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          Badges
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                          {userPosition > 0 ? `#${userPosition}` : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          Rank
                        </Typography>
                      </Box>
                    </Box>

                    {/* Recent Achievement */}
                    {currentUserStats.achievements && currentUserStats.achievements.length > 0 && (
                      <Box sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(25, 118, 210, 0.2)'
                      }}>
                        <Typography variant="caption" color="#0d47a1" fontWeight="bold" display="block" mb={0.5}>
                          LATEST ACHIEVEMENT
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {currentUserStats.achievements[currentUserStats.achievements.length - 1]?.icon}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="#1565c0">
                            {currentUserStats.achievements[currentUserStats.achievements.length - 1]?.name}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                      py: 2.5,
                      px: 3,
                      color: '#dc2626',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: '0 0 20px 20px',
                      '&:hover': { 
                        bgcolor: 'rgba(220, 38, 38, 0.08)',
                        color: '#b91c1c'
                      }
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box display="flex" gap={2}>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/login')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: '#ffffff',
                    border: '2px solid #e3ebf0',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      background: 'rgba(25, 118, 210, 0.05)',
                      color: '#1976d2',
                      borderColor: '#1976d2',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => handleNavigation('/register')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #1976d2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1565c0 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                      pointerEvents: 'none',
                    }
                  }}
                >
                  Join the Community →
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Container>
    </Box>
  );
}

export default Header;
