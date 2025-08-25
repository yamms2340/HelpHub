import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Favorite, Groups, Star, Timeline } from '@mui/icons-material';

const PlatformStats = ({ stats, onViewProgress }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 5, 
        mb: 6, 
        borderRadius: 4,
        background: '#ffffff',
        border: '1px solid rgba(25, 118, 210, 0.1)',
        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 50%, #1976d2 100%)',
        }
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: '#1e293b', 
            mb: 2,
          }}
        >
          📊 Platform Impact
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 400, mb: 2 }}>
          Real numbers, real impact in our community
        </Typography>
        <Button
          size="small"
          startIcon={<Timeline />}
          onClick={onViewProgress}
          sx={{
            background: '#ffffff',
            color: '#1976d2',
            fontWeight: 500,
            fontSize: '0.8rem',
            px: 2,
            py: 1,
            borderRadius: 3,
            textTransform: 'none',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            '&:hover': {
              background: '#f8fafc',
            }
          }}
        >
          View My Impact
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {[
          {
            icon: <Favorite sx={{ fontSize: 40, color: '#1976d2' }} />,
            value: stats.totalHelp || 0,
            label: 'Lives Touched',
            color: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            accent: '#1976d2'
          },
          {
            icon: <Groups sx={{ fontSize: 40, color: '#1565c0' }} />,
            value: stats.totalHelpers || 0,
            label: 'Active Heroes',
            color: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
            accent: '#1565c0'
          },
          {
            icon: <Star sx={{ fontSize: 40, color: '#2196f3' }} />,
            value: (stats.averageRating || 0).toFixed(1),
            label: 'Community Love',
            color: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
            accent: '#2196f3'
          }
        ].map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Box 
              textAlign="center"
              sx={{
                p: 4,
                borderRadius: 4,
                background: stat.color,
                border: `2px solid ${stat.accent}20`,
                transition: 'all 0.3s ease-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 15px 30px ${stat.accent}20`,
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: `0 8px 20px ${stat.accent}15`,
                }}
              >
                {stat.icon}
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900, 
                  color: '#1e293b', 
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: stat.accent,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PlatformStats;
