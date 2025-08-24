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
} from '@mui/material';
import { 
  Help,
  PersonOutline,
  Add
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
  logout(); // This clears the auth state
  navigate('/login', { replace: true }); // Force redirect to login
  handleMenuClose();
};


  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 2 }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar sx={{ py: 1.5, px: 3 }}>
          {/* Logo Section */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleNavigation('/')}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Help sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '1.3rem',
              }}
            >
              HelpHub
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mr: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => handleNavigation('/')}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1,
                color: '#64748b',
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: '#f1f5f9',
                  color: '#1e293b'
                }
              }}
            >
              Requests
            </Button>
            <Button 
              color="inherit" 
              onClick={() => handleNavigation('/hall-of-fame')}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1,
                color: '#64748b',
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: '#f1f5f9',
                  color: '#1e293b'
                }
              }}
            >
              Hall of Fame
            </Button>
          </Box>

          {/* Right Section */}
          {isAuthenticated ? (
            <Box display="flex" alignItems="center" gap={2}>
              {/* Create Request Button */}
              <Button
                variant="contained"
                onClick={() => handleNavigation('/create-request')}
                sx={{
                  borderRadius: 4,
                  px: 4,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(79, 134, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(79, 134, 255, 0.4)',
                  }
                }}
              >
                Create Request
              </Button>

              {/* User Avatar */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  p: 0,
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #e2e8f0',
                  }}
                >
                  <PersonOutline sx={{ color: '#64748b', fontSize: 20 }} />
                </Box>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 220,
                    mt: 1,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                  }
                }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#1e293b' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {user?.email}
                  </Typography>
                  <Chip
                    label={`${user?.helpCount || 0} helps completed`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.50' }
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box display="flex" gap={1}>
              <Button 
                color="inherit" 
                onClick={() => handleNavigation('/login')}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  color: '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { 
                    bgcolor: '#f1f5f9',
                    color: '#1e293b'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained"
                onClick={() => handleNavigation('/register')}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                  background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(79, 134, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(79, 134, 255, 0.4)',
                  }
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;
