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
} from '@mui/material';
import { 
  PersonOutline,
  VolunteerActivism,
  EmojiEvents,
  Security,
  Verified,
  Groups,
  Favorite,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
   logout(); // Clear auth state (your existing function)
     window.location.href = '/home'; // Force redirect
    
    navigate('/home', { replace: true }); // Redirect to home
};


  const handleNavigation = (path) => {
    navigate(path);
  };

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
            {/* Logo Section - Blue Theme */}
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: '0 0 auto', // Don't grow/shrink
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  '& .logo-text': { color: '#1976d2' }
                }
              }}
              onClick={() => handleNavigation('/')}
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

            {/* Spacer to push navigation to the right */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Buttons - Moved to Right Side */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 1, 
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '8px 12px',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
              border: '1px solid rgba(25, 118, 210, 0.06)',
              mr: 2, // Add margin to separate from right section
            }}>
              <Button 
                color="inherit" 
                onClick={() => handleNavigation('/')}
                startIcon={<Groups sx={{ fontSize: '20px', color: '#1976d2' }} />}
                sx={{ 
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
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
                onClick={() => handleNavigation('/hall-of-fame')}
                startIcon={<EmojiEvents sx={{ color: '#2196f3', fontSize: '20px' }} />}
                sx={{ 
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
                    color: '#0d47a1',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Hall of Fame
              </Button>
            </Box>

            {/* Right Section */}
            {isAuthenticated ? (
              <Box display="flex" alignItems="center" gap={2}>
                {/* CTA Button - Blue Theme */}
                <Button
                  variant="contained"
                  startIcon={<VolunteerActivism />}
                  onClick={() => handleNavigation('/create-request')}
                  sx={{
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #1976d2 100%)',
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

                {/* User Avatar - Blue Theme */}
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ 
                    p: 0,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Badge
                    badgeContent={user?.helpCount || 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
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
                
                {/* Enhanced Menu - Blue Theme */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: '20px',
                      minWidth: 280,
                      mt: 1,
                      background: '#ffffff',
                      boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
                      border: '1px solid rgba(25, 118, 210, 0.06)',
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 3, py: 3, borderBottom: '1px solid #e3ebf6' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonOutline sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b', fontSize: '1rem' }}>
                          {user?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={<EmojiEvents sx={{ color: 'white !important', fontSize: '0.9rem' }} />}
                      label={`${user?.helpCount || 0} helps completed`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)',
                        border: 'none',
                        borderRadius: '20px',
                      }}
                    />
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
