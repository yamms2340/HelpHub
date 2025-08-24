import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Add this import

const CTASection = () => {
  const navigate = useNavigate(); // Add this hook

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
            borderRadius: 6,
            p: 8,
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Typography 
            variant="h3" 
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Ready to Make a Difference?
          </Typography>

          <Typography 
            variant="h6" 
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              lineHeight: 1.6
            }}
          >
            Join thousands of community members who are already creating positive
            change. Your help can transform lives.
          </Typography>

          {/* Start Helping Today Button - ADD NAVIGATION */}
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')} // Add this onClick handler
            sx={{
              background: 'white',
              color: '#f06595',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '30px',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                background: '#f8fafc',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }
            }}
            startIcon={<Favorite />}
          >
            Start Helping Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
