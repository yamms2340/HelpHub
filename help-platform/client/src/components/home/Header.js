import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomeHeader = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        p: 2, 
        background: 'rgba(248, 250, 252, 0.9)', 
        backdropFilter: 'blur(10px)' 
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ color: '#1e293b', fontSize: '1.5rem' }}
          >
            Help<span style={{ color: '#1976d2' }}>Hub</span>
          </Typography>
        </Box>

        {/* Buttons Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Sign In Button */}
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              py: 1.2,
              fontSize: '1rem',
              borderColor: '#2196F3',
              color: '#2196F3',
              '&:hover': {
                borderColor: '#1976D2',
                color: '#1976D2',
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                transform: 'translateY(-1px)',
                transition: 'all 0.3s ease'
              },
            }}
          >
            Sign In
          </Button>

          {/* Get Started Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              py: 1.2,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.6)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
