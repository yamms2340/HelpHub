import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Chip, Grow, Paper, Alert, CardMedia } from '@mui/material';
import { Star, ReadMore } from '@mui/icons-material';

const InspiringStories = ({ stories, onStoryClick }) => {
  const safeStories = Array.isArray(stories) ? stories : [];

  const renderStoryImage = (story) => {
    if (story.hasCustomImage && story.imageUrl) {
      return (
        <CardMedia
          component="img"
          sx={{
            width: 120,
            height: 120,
            borderRadius: 3,
            objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          image={story.imageUrl.startsWith('http') ? story.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${story.imageUrl}`}
          alt={story.title}
        />
      );
    } else {
      // Fallback to emoji
      return (
        <Typography 
          variant="h1" 
          sx={{ 
            mb: 2, 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            fontSize: '4rem'
          }}
        >
          {story.image || '📖'}
        </Typography>
      );
    }
  };

  return (
    <Grow in timeout={1000}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 5, 
          mb: 6, 
          borderRadius: 4,
          background: '#ffffff',
          border: '1px solid rgba(25, 118, 210, 0.1)',
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.08)',
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
            ✨ Stories That Inspire
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
            Real stories of extraordinary people doing extraordinary things
          </Typography>
        </Box>
        
        {safeStories.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', borderRadius: 3 }}>
            No inspiring stories yet. Be the first to share your story! 📝
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {safeStories.map((story, index) => (
              <Grow in timeout={1200 + index * 200} key={story.id || index}>
                <Card 
                  elevation={0}
                  onClick={() => onStoryClick(story)}
                  sx={{ 
                    borderRadius: 4,
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-out',
                    '&:hover': { 
                      boxShadow: '0 12px 30px rgba(25, 118, 210, 0.15)', 
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(25, 118, 210, 0.3)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4} alignItems="center">
                      {/* Story Image */}
                      <Grid item xs={12} md={2}>
                        <Box textAlign="center">
                          {renderStoryImage(story)}
                          <Chip
                            label={story.category || 'General'}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                              color: 'white',
                              fontWeight: 500,
                              borderRadius: 2,
                            }}
                          />
                        </Box>
                      </Grid>
                      
                      {/* Story Content */}
                      <Grid item xs={12} md={7}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1e293b',
                            mb: 1,
                          }}
                        >
                          {story.title || 'Untitled Story'}
                        </Typography>
                        
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: '#1976d2', 
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          {story.helper || 'Anonymous'} • {story.location || 'Unknown'}
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#64748b',
                            lineHeight: 1.6,
                            mb: 2,
                          }}
                        >
                          {story.summary || story.description || 'No summary available'}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box display="flex" alignItems="center">
                            <Star sx={{ color: '#fbbf24', mr: 0.5, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {story.rating || '4.5'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {story.impact || 'Positive impact'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Read More Button */}
                      <Grid item xs={12} md={3}>
                        <Box textAlign="center">
                          <Button
                            variant="contained"
                            endIcon={<ReadMore />}
                            sx={{
                              background: '#ffffff',
                              color: '#1976d2',
                              fontWeight: 600,
                              px: 3,
                              py: 1.5,
                              borderRadius: 3,
                              textTransform: 'none',
                              border: '1px solid rgba(25, 118, 210, 0.2)',
                              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                              '&:hover': {
                                background: '#f8fafc',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            Read Full Story
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grow>
            ))}
          </Box>
        )}
      </Paper>
    </Grow>
  );
};

export default InspiringStories;
