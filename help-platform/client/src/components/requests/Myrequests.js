import React, { useState } from 'react';
import {
  Add,
  LocationOn,
  AccessTime,
  Category,
  Edit,
  CheckCircle,
  Star,
} from '@mui/icons-material';

import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Grid,
  Alert,
  CardActions,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from '@mui/material';

import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from './RequestContext';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';

// ✅ Simplified status colors (3 states only)
const statusColors = {
  Open: '#4f86ff',
  'In Progress': '#f59e0b',
  Completed: '#10b981'
};

const urgencyColors = {
  Low: '#6b7280',
  Medium: '#f59e0b', 
  High: '#ef4444',
  Critical: '#dc2626'
};

function MyRequests() {
  const { user } = useAuth();
  const { requests, fetchRequests } = useRequests();
  const navigate = useNavigate();
  
  const [ratingModal, setRatingModal] = useState({
    open: false,
    requestId: null,
    rating: 5,
    feedback: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Filter requests to show only current user's requests
  const myRequests = requests.filter(request => 
    request.requester?._id === user?._id || 
    request.requester?.id === user?._id ||
    request.requester === user?._id ||
    request.requester?._id === user?.id ||
    request.requester?.id === user?.id ||
    request.requester === user?.id
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Simplified: Requester confirms completion (marks as "Completed" + awards points)
  const handleConfirmCompletion = async (requestId) => {
    try {
      const confirmationData = {
        rating: 5,
        feedback: '',
        completedEarly: false
      };

      const response = await requestsAPI.confirmCompletion(requestId, confirmationData);
      
      if (response.data) {
        setSuccess(`✅ Request completed! Helper earned ${response.data.points} points!`);
        
        // Refresh requests to show "Completed" status everywhere
        if (fetchRequests) {
          await fetchRequests();
        } else {
          // Fallback: refresh page to show updated status
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } catch (error) {
      console.error('❌ Confirmation error:', error);
      setError('Failed to confirm completion');
    }
  };

  // Handle optional rating
  const handleAddRating = (requestId) => {
    setRatingModal({
      open: true,
      requestId,
      rating: 5,
      feedback: '',
    });
  };

  // Submit optional rating
  const submitRating = async () => {
    try {
      const ratingData = {
        rating: ratingModal.rating,
        feedback: ratingModal.feedback
      };

      const response = await fetch(`/api/requests/${ratingModal.requestId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        setSuccess('✅ Rating submitted! Thank you for your feedback.');
        setRatingModal({ open: false, requestId: null, rating: 5, feedback: '' });
        
        if (fetchRequests) {
          await fetchRequests();
        }
      } else {
        const errorData = await response.json();
        setError(`Failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Rating error:', error);
      setError('Failed to submit rating');
    }
  };

  if (myRequests.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(79, 134, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(79, 134, 255, 0.1)',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: '#1e293b',
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              My Requests
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Track and manage all your help requests in one place
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 6, 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: 3,
            border: '1px solid rgba(79, 134, 255, 0.2)',
            maxWidth: 500,
            mx: 'auto'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              🚀 Ready to Get Started?
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
              You haven't created any help requests yet. Create your first request and connect with amazing helpers in your community!
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/create-request')}
              sx={{
                background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
                fontWeight: 600,
                py: 2,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 8px 25px rgba(79, 134, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(79, 134, 255, 0.4)',
                }
              }}
            >
              Create Your First Request
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success/Error Alerts */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            color: '#1e293b',
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          My Requests
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#64748b',
            fontWeight: 400,
            mb: 3
          }}
        >
          You have <strong>{myRequests.length}</strong> request{myRequests.length !== 1 ? 's' : ''}
        </Typography>
        
        {/* ✅ Simplified Summary Cards (3 states only) */}
        <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ color: statusColors.Open, fontWeight: 700 }}>
                {myRequests.filter(r => r.status === 'Open').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Open</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ color: statusColors['In Progress'], fontWeight: 700 }}>
                {myRequests.filter(r => r.status === 'In Progress').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>In Progress</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ color: statusColors.Completed, fontWeight: 700 }}>
                {myRequests.filter(r => r.status === 'Completed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Completed</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Requests Grid */}
      <Grid container spacing={3}>
        {myRequests.map(request => (
          <Grid item xs={12} md={6} key={request._id || request.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(79, 134, 255, 0.15)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header with Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 2 }}>
                    {request.title}
                  </Typography>
                  <Chip 
                    label={request.status} 
                    sx={{
                      backgroundColor: statusColors[request.status],
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  />
                </Box>
                
                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  paragraph
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    mb: 3
                  }}
                >
                  {request.description}
                </Typography>
                
                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Category />}
                    label={request.category} 
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      '&:hover': { borderColor: '#4f86ff' }
                    }}
                  />
                  <Chip 
                    label={request.urgency}
                    size="small"
                    sx={{
                      backgroundColor: urgencyColors[request.urgency],
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                </Box>
                
                {/* Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="body2" color="textSecondary">
                      {request.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="body2" color="textSecondary">
                      Created {formatDate(request.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Helper Info */}
                {request.status === 'In Progress' && request.acceptedBy && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#f0f9ff',
                    borderRadius: 2,
                    border: '1px solid #bae6fd'
                  }}>
                    <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 600 }}>
                      🤝 Being helped by: {request.acceptedBy.name || request.acceptedBy}
                    </Typography>
                  </Box>
                )}

                {/* Show Points if Completed */}
                {request.status === 'Completed' && request.pointsAwarded && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#f0fdf4',
                    borderRadius: 2,
                    border: '1px solid #bbf7d0'
                  }}>
                    <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
                      🎯 Helper earned {request.pointsAwarded} points!
                    </Typography>
                  </Box>
                )}

                {/* Show Rating if Completed and Already Rated */}
                {request.status === 'Completed' && request.rating && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#f0fdf4',
                    borderRadius: 2,
                    border: '1px solid #bbf7d0'
                  }}>
                    <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600, mb: 1 }}>
                      ⭐ Your Rating:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={request.rating} size="small" readOnly />
                      <Typography variant="body2" color="textSecondary">
                        ({request.rating}/5)
                      </Typography>
                    </Box>
                    {request.feedback && (
                      <Typography variant="body2" sx={{ color: '#166534', mt: 1, fontStyle: 'italic' }}>
                        "{request.feedback}"
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 2 }}>
                {/* Status Info Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/')}
                    sx={{ color: '#64748b' }}
                  >
                    View All Requests
                  </Button>
                  
                  {request.status === 'Open' && (
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                      ✓ Available for help
                    </Typography>
                  )}
                  
                  {request.status === 'In Progress' && (
                    <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                      🔄 Helper is working
                    </Typography>
                  )}
                  
                  {request.status === 'Completed' && (
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                      ✅ Completed
                    </Typography>
                  )}
                </Box>

                {/* ✅ Simplified Action Buttons (3 states only) */}
                
                {/* Open - Can edit request */}
                {request.status === 'Open' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/edit-request/${request._id}`)}
                    sx={{
                      color: '#4f86ff',
                      borderColor: '#4f86ff',
                      '&:hover': {
                        background: 'rgba(79, 134, 255, 0.1)',
                        borderColor: '#3b82f6',
                      }
                    }}
                  >
                    Edit Request
                  </Button>
                )}

                {/* In Progress - Confirm completion button */}
                {request.status === 'In Progress' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleConfirmCompletion(request._id)}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      }
                    }}
                  >
                    Confirm Completion & Award Points
                  </Button>
                )}

                {/* Completed - Optional Rating */}
                {request.status === 'Completed' && !request.rating && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Star />}
                    onClick={() => handleAddRating(request._id || request.id)}
                    sx={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Rate Helper (Optional)
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Create Another Request Button */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Add />}
          onClick={() => navigate('/create-request')}
          sx={{
            background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
            fontWeight: 600,
            py: 2,
            px: 4,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            boxShadow: '0 8px 25px rgba(79, 134, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 35px rgba(79, 134, 255, 0.4)',
            }
          }}
        >
          Create Another Request
        </Button>
      </Box>

      {/* Rating Modal (Optional) */}
      <Dialog 
        open={ratingModal.open} 
        onClose={() => setRatingModal({ open: false, requestId: null, rating: 5, feedback: '' })} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Star sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" fontWeight={700}>
              Rate Your Helper
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              How was your experience with the helper? Your feedback helps build a better community.
            </Typography>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Rating:
              </Typography>
              <Rating
                value={ratingModal.rating}
                onChange={(event, newValue) => 
                  setRatingModal({...ratingModal, rating: newValue || 5})
                }
                size="large"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                Rate the helper's performance (1-5 stars)
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Feedback (optional)"
              value={ratingModal.feedback}
              onChange={(e) => setRatingModal({...ratingModal, feedback: e.target.value})}
              placeholder="Share your experience with the helper..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setRatingModal({ open: false, requestId: null, rating: 5, feedback: '' })}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitRating} 
            variant="contained"
            startIcon={<Star />}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              }
            }}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyRequests;
