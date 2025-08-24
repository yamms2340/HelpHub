import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Home } from '@mui/icons-material'; // Changed from Favorite to Home

const Footer = () => {
  return (
    <Box sx={{ py: 6, background: '#1e293b', color: 'white' }}>
      <Container maxWidth="lg">
        <Box textAlign="center">
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', // Blue gradient instead of pink
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home sx={{ color: 'white', fontSize: 20 }} /> {/* Changed icon */}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              HelpHub {/* Changed from CommunityHelp to HelpHub */}
            </Typography>
          </Box>

          {/* Copyright */}
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2024 HelpHub. Building communities, changing lives.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
