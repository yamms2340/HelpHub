import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Groups, AssignmentTurnedIn, AutoAwesome } from '@mui/icons-material';

const FEATURES = [
  {
    icon: <Groups sx={{ fontSize: 48 }} />,
    title: 'Browse Help Requests',
    description: 'Discover community members who need assistance. Connect with your neighbors and make a meaningful difference in their lives.'
  },
  {
    icon: <AssignmentTurnedIn sx={{ fontSize: 48 }} />,
    title: 'Track Progress',
    description: 'Monitor your community contributions and see the positive impact you\'re making. Keep track of help requests you\'ve fulfilled.'
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 48 }} />,
    title: 'Create Impact',
    description: 'Make a lasting positive impact in your community. Every act of kindness contributes to a better world.'
  }
];

const PRIMARY_BLUE = '#2196F3';

const FeaturesSection = () => (
  <Box id="features-section" sx={{ py: 10, background: '#f8fafc' }}> {/* Added ID here */}
    <Container maxWidth="md">
      <Typography
        variant="h3"
        component="h2"
        align="center"
        sx={{
          fontWeight: 800,
          mb: 8,
          color: '#1e293b',
          fontSize: { xs: '2rem', md: '2.5rem' }
        }}
      >
        How We Make a Difference
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {FEATURES.map((feature, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper
              elevation={2}
              sx={{
                p: 5,
                height: '100%',
                textAlign: 'center',
                borderRadius: 4,
                boxShadow: `0 4px 24px 0 rgba(33,150,243,0.10)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                  boxShadow: `0 8px 32px 0 rgba(33,150,243,0.14)`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                sx={{
                  mb: 3,
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: `${PRIMARY_BLUE}20`,
                  color: PRIMARY_BLUE,
                }}
              >
                {feature.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b', fontSize: '1.3rem' }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5, fontSize: '1rem', px: 1 }}>
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default FeaturesSection;
