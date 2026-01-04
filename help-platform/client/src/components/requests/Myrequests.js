import React, { useState, useEffect, useRef } from 'react';
import {
  Add, LocationOn, AccessTime, Category, Edit, CheckCircle
} from '@mui/icons-material';
import {
  Container, Typography, Card, CardContent, Box, Chip, Button,
  Grid, Alert, CardActions, Paper
} from '@mui/material';
import { useRequests } from './RequestContext';
import { useNavigate } from 'react-router-dom';

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
  const {
    myRequests,
    fetchMyRequests,
    completeRequest,
    loading: requestsLoading
  } = useRequests();

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchedOnce = useRef(false);
  const retriedOnce = useRef(false);

  /* ✅ Fetch once on mount */
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchMyRequests();
  }, [fetchMyRequests]);

  /* ✅ Retry ONCE if empty */
  useEffect(() => {
    if (
      fetchedOnce.current &&
      !retriedOnce.current &&
      !requestsLoading &&
      myRequests.length === 0
    ) {
      retriedOnce.current = true;
      fetchMyRequests();
    }
  }, [requestsLoading, myRequests.length, fetchMyRequests]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const handleConfirmCompletion = async (id) => {
    try {
      setActionLoading(true);
      await completeRequest(id, { completedEarly: false });
    } catch {
      setError('Failed to confirm completion');
    } finally {
      setActionLoading(false);
    }
  };

  /* ✅ Loading */
  if (requestsLoading && myRequests.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading your requests…</Typography>
      </Container>
    );
  }

  /* ✅ Empty */
  if (!requestsLoading && myRequests.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4">My Requests</Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            You haven t created any help requests yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-request')}
          >
            Create Your First Request
          </Button>
        </Paper>
      </Container>
    );
  }
  const visibleRequests = myRequests.filter(
  req => req.status !== 'Completed'
);


  /* ✅ Main UI */
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight={800}>
          My Requests
        </Typography>
        <Typography color="textSecondary">
          You have <strong>{visibleRequests.length}</strong> request
          {visibleRequests.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {myRequests
        .filter(req => req.status !== 'Completed')
        .map(req => (
          <Grid item xs={12} md={6} key={req._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={600}>{req.title}</Typography>
                  <Chip
                    label={req.status}
                    sx={{ backgroundColor: statusColors[req.status], color: '#fff' }}
                  />
                </Box>

                <Typography color="textSecondary" mt={2}>
                  {req.description}
                </Typography>

                <Box display="flex" gap={1} mt={2}>
                  <Chip icon={<Category />} label={req.category} size="small" />
                  <Chip
                    label={req.urgency}
                    size="small"
                    sx={{ backgroundColor: urgencyColors[req.urgency], color: '#fff' }}
                  />
                </Box>

                <Typography variant="body2" mt={2}>
                  <LocationOn fontSize="small" /> {req.location}
                </Typography>
                <Typography variant="body2">
                  <AccessTime fontSize="small" /> Created {formatDate(req.createdAt)}
                </Typography>
              </CardContent>

              <CardActions>
                {req.status === 'Open' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/edit-request/${req._id}`)}
                  >
                    Edit Request
                  </Button>
                )}

                {req.status === 'In Progress' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    disabled={actionLoading}
                    onClick={() => handleConfirmCompletion(req._id)}
                  >
                    Confirm Completion
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MyRequests;
