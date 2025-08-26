import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
  LinearProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { Close, Save, Add } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { donationUpdateAPI } from '../../services/api';

const categories = ['Healthcare', 'Education', 'Emergency', 'Community', 'Environment', 'Other'];
const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

const urgencyColors = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
  Critical: '#d32f2f'
};

function DonationUpdateForm({ updateId, onClose, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Community',
    urgencyLevel: 'Medium',
    targetAmount: '',
    beneficiaryCount: 1,
    location: '',
    deadline: '',
    contactInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: ''
    }
  });

  const isEditing = Boolean(updateId);

  useEffect(() => {
    if (isEditing && updateId) {
      fetchDonationUpdate();
    }
  }, [updateId, isEditing]);

  const fetchDonationUpdate = async () => {
    try {
      setLoading(true);
      const response = await donationUpdateAPI.getById(updateId);
      if (response.success) {
        const data = response.data;
        setFormData({
          ...data,
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      setError('Failed to load donation update');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.description || !formData.targetAmount || !formData.deadline) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = isEditing 
        ? await donationUpdateAPI.update(updateId, formData)
        : await donationUpdateAPI.create(formData);

      if (response.success) {
        setSuccess(isEditing ? 'Donation campaign updated!' : 'Donation campaign created!');
        if (onSave) onSave(response.data);
        
        if (!isEditing) {
          setFormData({
            title: '',
            description: '',
            category: 'Community',
            urgencyLevel: 'Medium',
            targetAmount: '',
            beneficiaryCount: 1,
            location: '',
            deadline: '',
            contactInfo: { name: user?.name || '', email: user?.email || '', phone: '' }
          });
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save donation campaign');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !formData.title) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography textAlign="center" mt={2}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {isEditing ? 'Edit Campaign' : 'Create Donation Campaign'}
          </Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          )}
        </Box>

        {/* Progress info for editing */}
        {isEditing && formData.targetAmount > 0 && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  ₹{(formData.currentAmount || 0).toLocaleString('en-IN')} of ₹{formData.targetAmount.toLocaleString('en-IN')}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, ((formData.currentAmount || 0) / formData.targetAmount) * 100)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {Math.round(((formData.currentAmount || 0) / formData.targetAmount) * 100)}% completed
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} textAlign="right">
                <Chip 
                  label={formData.status?.toUpperCase() || 'ACTIVE'}
                  color={formData.status === 'active' ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Give your campaign a clear, compelling title"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description *"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose, need, and impact of this campaign"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category *"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Urgency Level *"
                value={formData.urgencyLevel}
                onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
                required
              >
                {urgencyLevels.map(level => (
                  <MenuItem key={level} value={level}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        width={12} 
                        height={12} 
                        borderRadius="50%" 
                        bgcolor={urgencyColors[level]}
                      />
                      {level}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Financial Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Target Amount (₹) *"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Number of Beneficiaries *"
                value={formData.beneficiaryCount}
                onChange={(e) => handleInputChange('beneficiaryCount', e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            {/* Location & Timeline */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Location & Timeline
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location *"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State, Country"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Deadline *"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Name *"
                value={formData.contactInfo.name}
                onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="email"
                label="Contact Email *"
                value={formData.contactInfo.email}
                onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="tel"
                label="Contact Phone *"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                required
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                {onClose && (
                  <Button variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? null : (isEditing ? <Save /> : <Add />)}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default DonationUpdateForm;
