import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import {
  Star,
  Favorite,
  AccessTime,
  AdminPanelSettings,
} from '@mui/icons-material';

function RecognitionCard({ recognition }) {
  const {
    type,
    title,
    helperName,
    helperEmail,
    badge,
    content,
    helpCount,
    rating,
    postedDate,
    admin,
    bgGradient
  } = recognition;

  const getTypeIcon = () => {
    switch (type) {
      case 'spotlight':
        return '🌟';
      case 'milestone':
        return '🏆';
      case 'story':
        return '❤️';
      default:
        return '🎖️';
    }
  };

  const generateAvatar = (name) => {
    const colors = ['#4f86ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const colorIndex = name.length % colors.length;
    return colors[colorIndex];
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: 'white',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: bgGradient,
          padding: 3,
          position: 'relative',
          color: 'white',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.9, fontWeight: 600 }}>
              {getTypeIcon()} SPECIAL RECOGNITION
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Chip
            label={badge}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Helper Info */}
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: generateAvatar(helperName),
              fontSize: '1.5rem',
              fontWeight: 700,
              border: '3px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {helperName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {helperName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {helperEmail}
            </Typography>
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {/* Admin Message */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem', 
            lineHeight: 1.6, 
            color: '#1e293b',
            mb: 3,
            fontStyle: 'italic'
          }}
        >
          "{content}"
        </Typography>

        {/* Helper Stats */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(79, 134, 255, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(79, 134, 255, 0.2)',
            mb: 3,
          }}
        >
          <Box display="flex" justifyContent="space-around" alignItems="center">
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <Favorite sx={{ color: '#ef4444', mr: 1, fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {helpCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
                Total Helps
              </Typography>
            </Box>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <Star sx={{ color: '#f59e0b', mr: 1, fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {rating.toFixed(1)}
                </Typography>
              </Box>
              <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
                Average Rating
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box display="flex" justifyContent="between" alignItems="center" sx={{ opacity: 0.7 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings sx={{ fontSize: 18, color: '#64748b' }} />
            <Typography variant="body2" color="#64748b">
              Posted by {admin}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} ml="auto">
            <AccessTime sx={{ fontSize: 18, color: '#64748b' }} />
            <Typography variant="body2" color="#64748b">
              {new Date(postedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default RecognitionCard;
