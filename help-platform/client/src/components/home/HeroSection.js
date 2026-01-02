import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  // Function to scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

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
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', // Blue gradient
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
          Connect with your community and make a meaningful difference. Browse help requests, 
          offer assistance, and create positive impact through our platform.
        </Typography>

        {/* Call-to-Action Buttons - RECTANGULAR */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Primary Button - Blue rectangular */}
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', // Blue gradient
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px', // RECTANGULAR - not rounded
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.6)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            Join the Community →
          </Button>

          {/* Secondary Button - Rectangular outline - NOW SCROLLS TO FEATURES */}
          <Button 
            variant="outlined" 
            size="large"
            onClick={scrollToFeatures} // Changed from navigate to scroll function
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px', // RECTANGULAR - not rounded
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              '&:hover': {
                border: '2px solid #2196F3', // Blue border on hover
                color: '#2196F3', // Blue text on hover
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
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
