import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { requestsAPI } from '../../services/api';

function CompleteRequestModal({ open, onClose, request, onComplete }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      await requestsAPI.completeRequest(request._id, { rating, feedback });
      
      onComplete();
      onClose();
      
      // Reset form
      setRating(5);
      setFeedback('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to complete request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Help Request</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {request?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Helper: {request?.acceptedBy?.name}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Rate the help you received:
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Feedback (Optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          helperText="Share your experience to help others"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !rating}
        >
          Complete Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompleteRequestModal;
