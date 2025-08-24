import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Favorite } from '@mui/icons-material';

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
                background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Favorite sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              CommunityHelp
            </Typography>
          </Box>

          {/* Copyright */}
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2024 CommunityHelp. Building communities, changing lives.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
