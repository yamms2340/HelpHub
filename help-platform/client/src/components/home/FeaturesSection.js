import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { People, Adjust, AutoAwesome } from '@mui/icons-material';

const FeaturesSection = () => {
  const features = [
  {
    icon: <People sx={{ fontSize: 40 }} />,
    title: 'Connect & Help',
    description: 'Join a network of caring individuals ready to make a difference. Connect with those who need help and those who can provide it.',
    color: '#4f86ff'
  },
  {
    icon: <Adjust sx={{ fontSize: 40 }} />, // Changed from Target to Adjust
    title: 'Achieve Goals',
    description: 'Set community goals and work together to achieve them. Track progress and celebrate collective achievements.',
    color: '#10b981'
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 40 }} />,
    title: 'Create Impact',
    description: 'Make a lasting positive impact in your community. Every act of kindness contributes to a better world.',
    color: '#8b5cf6'
  }
];

  return (
    <Box sx={{ py: 10, background: '#f8fafc' }}>
      <Container maxWidth="lg">
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

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 4,
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  background: 'white',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    color: feature.color
                  }}
                >
                  {feature.icon}
                </Box>

                {/* Title */}
                <Typography 
                  variant="h5" 
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#1e293b'
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography 
                  variant="body1" 
                  sx={{
                    color: '#64748b',
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
