import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Add this import

const HomeHeader = () => {
  const navigate = useNavigate(); // Add this hook

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
              background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Favorite sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ color: '#1e293b', fontSize: '1.5rem' }}
          >
            CommunityHelp
          </Typography>
        </Box>

        {/* Get Started Button - ADD NAVIGATION */}
        <Button
          variant="contained"
          onClick={() => navigate('/login')} // Add this onClick handler
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '24px',
            px: 3,
            py: 1.2,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            },
          }}
        >
          Get Started
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
