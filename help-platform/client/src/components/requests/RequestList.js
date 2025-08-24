import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Person,
  AccessTime,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';

const urgencyColors = {
  Low: { color: '#10b981', bg: '#dcfce7' },
  Medium: { color: '#f59e0b', bg: '#fef3c7' },
  High: { color: '#ef4444', bg: '#fee2e2' },
  Critical: { color: '#dc2626', bg: '#fecaca' }
};

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    urgency: 'All',
    status: 'Open'
  });
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.urgency !== 'All') params.urgency = filters.urgency;
      if (filters.status !== 'All') params.status = filters.status;
      
      const response = await requestsAPI.getAllRequests(params);
      setRequests(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!isAuthenticated) {
      setError('Please log in to help others');
      return;
    }

    try {
      await requestsAPI.acceptRequest(requestId);
      setError('');
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      {/* Filters */}
<Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
  {['category', 'urgency', 'status'].map((filterType) => (
    <FormControl key={filterType} sx={{ minWidth: 150 }}>
      <InputLabel sx={{ textTransform: 'capitalize' }}>
        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
      </InputLabel>
      <Select
        value={filters[filterType]}
        label={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
        onChange={(e) => setFilters({...filters, [filterType]: e.target.value})}
        sx={{ borderRadius: 3 }}
      >
        <MenuItem value="All">All</MenuItem>
        {filterType === 'category' && 
          ['Technology', 'Education', 'Transportation', 'Food', 'Health', 'Household', 'Other'].map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))
        }
        {filterType === 'urgency' && 
          ['Low', 'Medium', 'High', 'Critical'].map((level) => (
            <MenuItem key={level} value={level}>{level}</MenuItem>
          ))
        }
        {filterType === 'status' && 
          ['Open', 'In Progress', 'Completed'].map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  ))}
</Box>


      {/* Request Cards */}
      {requests.length === 0 ? (
        <Paper elevation={0} sx={{ py: 8, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#64748b' }}>
            No requests found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} sm={6} lg={4} key={request._id}>
             <Card 
  elevation={2}
  sx={{ 
    borderRadius: 1,  // ← Changed from 4 to 1 for square corners
    '&:hover': { 
      boxShadow: 4,
      transition: 'box-shadow 0.2s ease-in-out',
    }
  }}
>


                <CardContent sx={{ p: 3 }}>
                  {/* Header with Title and Urgency */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#1e293b',
                        flex: 1,
                        mr: 2
                      }}
                    >
                      {request.title}
                    </Typography>
                    <Chip
                      label={request.urgency}
                      sx={{
                        backgroundColor: urgencyColors[request.urgency]?.bg,
                        color: urgencyColors[request.urgency]?.color,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        px: 1,
                      }}
                    />
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ mb: 3, fontSize: '1rem' }}
                  >
                    {request.description}
                  </Typography>
                  
                  {/* Details */}
                  <Box sx={{ mb: 2 }}>
                    {/* Category */}
                    <Box display="flex" alignItems="center" mb={1.5} sx={{ color: '#64748b' }}>
                      <School sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        {request.category}
                      </Typography>
                    </Box>
                    
                    {/* Location */}
                    <Box display="flex" alignItems="center" mb={1.5} sx={{ color: '#64748b' }}>
                      <LocationOn sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        {request.location}
                      </Typography>
                    </Box>
                    
                    {/* Requester */}
                    <Box display="flex" alignItems="center" mb={1.5} sx={{ color: '#64748b' }}>
                      <Person sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        {request.requester?.name || 'Anonymous'}
                      </Typography>
                    </Box>
                    
                    {/* Time */}
                    <Box display="flex" alignItems="center" sx={{ color: '#64748b' }}>
                      <AccessTime sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        {formatDate(request.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Indicator for In Progress */}
                  {request.status === 'In Progress' && request.acceptedBy && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#dbeafe',
                        borderRadius: 2,
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 500 }}>
                        Being helped by {request.acceptedBy.name}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
                
                {/* Action Button */}
{/* Action Button */}
<CardActions sx={{ p: 3, pt: 0 }}>
  {request.status === 'Open' && (
    <Button
      fullWidth
      variant="contained"
      onClick={() => handleAcceptRequest(request._id)}
      disabled={!isAuthenticated || 
        (user && request.requester._id === user.id)}
     sx={{
  borderRadius: 12,
  py: 2,
  fontWeight: 600,
  fontSize: '1.1rem',
  textTransform: 'none',
  background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)',
  boxShadow: '0 4px 15px rgba(79, 134, 255, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(79, 134, 255, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #4f86ff 0%, #3b82f6 100%)', // Same as Create Request
    color: '#ffffff',
    opacity: 1, // Full opacity like Create Request
    boxShadow: '0 4px 15px rgba(79, 134, 255, 0.3)', // Same shadow
  }
}}

    >
      {!isAuthenticated 
        ? 'Login to Help'
        : (user && request.requester._id === user.id)
        ? 'Your Request'
        : 'Offer Help'
      }
    </Button>
  )}
  {request.status === 'In Progress' && (
    <Button
      fullWidth
      variant="contained"
      disabled
      sx={{ 
        borderRadius: 12,
        py: 2, 
        textTransform: 'none',
        fontSize: '1.1rem',
        backgroundColor: '#4285f4', // Same blue
        color: '#ffffff',
        '&:disabled': {
          backgroundColor: '#4285f4',
          color: '#ffffff',
          opacity: 0.7,
        }
      }}
    >
      Help in Progress
    </Button>
  )}
  {request.status === 'Completed' && (
    <Button
      fullWidth
      variant="contained"
      disabled
      sx={{ 
        borderRadius: 12,
        py: 2, 
        textTransform: 'none',
        fontSize: '1.1rem',
        backgroundColor: '#4285f4', // Same blue for consistency
        color: '#ffffff',
        '&:disabled': {
          backgroundColor: '#4285f4',
          color: '#ffffff',
          opacity: 0.7,
        }
      }}
    >
      Completed
    </Button>
  )}
</CardActions>

              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default RequestList;
