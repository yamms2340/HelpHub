import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Add this import

const HeroSection = () => {
  const navigate = useNavigate(); // Add this hook

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box textAlign="center">
        {/* Main Heading with Gradient Text */}
        <Typography 
          variant="h2" 
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            mb: 2,
            lineHeight: 1.2
          }}
        >
          <Box component="span" sx={{ color: '#1e293b' }}>
            Building Communities,{' '}
          </Box>
          <Box 
            component="span" 
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Changing Lives
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#64748b', 
            mb: 5, 
            fontWeight: 400,
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Connect with compassionate individuals, raise requests for help, and create
          positive impact in your community through our platform.
        </Typography>

        {/* Call-to-Action Buttons - ADD NAVIGATION */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')} // Navigate to register
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '30px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(240, 101, 149, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f06595 0%, #ff6b6b 100%)',
                boxShadow: '0 6px 20px rgba(240, 101, 149, 0.6)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            Join the Community →
          </Button>

          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/login')} // Navigate to login
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '30px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              '&:hover': {
                border: '2px solid #ff6b6b',
                color: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.05)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HeroSection;
