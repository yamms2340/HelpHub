import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  VolunteerActivism,
  TrendingUp,
  CheckCircle,
  QrCodeScanner,
  AccountBalanceWallet,
  Close,
  ArrowForward,
  LocalHospital,
  School,
  Restaurant,
  Home as HomeIcon,
  Park,
  Group,
  NavigateNext,
  Add,
  Edit,
  Campaign,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { impactPostsAPI, donationUpdateAPI } from '../../services/api';
import DonationUpdateForm from './DonationUpdate';

function DonationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const target = 500000;
  const [totalCollected, setTotalCollected] = useState(156750);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postSuccessSnackbar, setPostSuccessSnackbar] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [goodDeeds, setGoodDeeds] = useState([]);

  // Donation Update states
  const [donationUpdateDialogOpen, setDonationUpdateDialogOpen] = useState(false);
  const [editingDonationUpdateId, setEditingDonationUpdateId] = useState(null);
  const [donationUpdates, setDonationUpdates] = useState([]);

  // Post dialog states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('User Story');
  const [newPostAmount, setNewPostAmount] = useState('');
  const [newPostBeneficiaries, setNewPostBeneficiaries] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  // Load data on mount
  useEffect(() => {
    fetchImpactPosts();
    fetchDonationUpdates();
  }, []);

  const fetchImpactPosts = async () => {
    try {
      const response = await impactPostsAPI.getAllPosts();
      const postsData = response.data.posts || response.data;
      const formattedPosts = postsData.map(post => ({
        ...post,
        id: post._id || post.id,
        date: post.createdAt || post.date,
        icon: getIconForCategory(post.category)
      }));
      setGoodDeeds(formattedPosts);
    } catch (error) {
      console.error('Failed to fetch impact posts:', error);
      // Fallback data
      setGoodDeeds([
        {
          id: 1,
          title: 'Emergency Medical Support for Families',
          category: 'Healthcare',
          beneficiaries: 45,
          amount: 25000,
          date: '2025-08-20',
          details: 'Covered ambulance services, emergency medicines, and hospital fees for families who could not afford treatment.',
        },
        {
          id: 2,
          title: 'Education Scholarship Program',
          category: 'Education',
          beneficiaries: 30,
          amount: 18500,
          date: '2025-08-15',
          details: 'Funded school fees, textbooks, uniforms, and stationery for an entire academic year.',
        }
      ].map(post => ({ ...post, icon: getIconForCategory(post.category) })));
    }
  };

  const fetchDonationUpdates = async () => {
    try {
      const response = await donationUpdateAPI.getAll({ limit: 6, status: 'active' });
      if (response.success) {
        setDonationUpdates(response.data.updates || []);
      }
    } catch (error) {
      console.error('Failed to fetch donation updates:', error);
      // Mock data for demo
      setDonationUpdates([
        {
          _id: '1',
          title: 'Help Build Community Center',
          description: 'We need funds to construct a new community center that will serve as a hub for local activities and events.',
          targetAmount: 100000,
          currentAmount: 35000,
          category: 'Community',
          beneficiaryCount: 500,
          urgencyLevel: 'Medium',
          status: 'active'
        },
        {
          _id: '2',
          title: 'Medical Equipment for Rural Clinic',
          description: 'Urgent need for medical equipment to upgrade our rural clinic and provide better healthcare services.',
          targetAmount: 75000,
          currentAmount: 45000,
          category: 'Healthcare',
          beneficiaryCount: 200,
          urgencyLevel: 'High',
          status: 'active'
        },
        {
          _id: '3',
          title: 'School Library Development',
          description: 'Help us build a modern library with books and digital resources for underprivileged students.',
          targetAmount: 60000,
          currentAmount: 20000,
          category: 'Education',
          beneficiaryCount: 300,
          urgencyLevel: 'Medium',
          status: 'active'
        }
      ]);
    }
  };

  // Donation Update handlers
  const handleCreateDonationUpdate = () => {
    setEditingDonationUpdateId(null);
    setDonationUpdateDialogOpen(true);
  };

  const handleEditDonationUpdate = (updateId) => {
    setEditingDonationUpdateId(updateId);
    setDonationUpdateDialogOpen(true);
  };

  const handleDonationUpdateSave = (savedUpdate) => {
    if (editingDonationUpdateId) {
      setDonationUpdates(prev => 
        prev.map(update => 
          update._id === editingDonationUpdateId ? savedUpdate : update
        )
      );
    } else {
      setDonationUpdates(prev => [savedUpdate, ...prev]);
    }
    setDonationUpdateDialogOpen(false);
    setEditingDonationUpdateId(null);
  };

  // Utility functions
  const categoryColor = (cat) =>
    ({
      Healthcare: '#dc2626',
      Education: '#4f86ff',
      'Food & Nutrition': '#f59e0b',
      Housing: '#10b981',
      Environment: '#059669',
      Empowerment: '#7c3aed',
      'User Story': '#7c3aed',
      'Community': '#2196f3',
      'Emergency': '#ff5722',
      'Other': '#64748b'
    }[cat] || '#64748b');

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Healthcare':
        return <LocalHospital sx={{ color: '#dc2626' }} />;
      case 'Education':
        return <School sx={{ color: '#4f86ff' }} />;
      case 'Food & Nutrition':
        return <Restaurant sx={{ color: '#f59e0b' }} />;
      case 'Housing':
        return <HomeIcon sx={{ color: '#10b981' }} />;
      case 'Environment':
        return <Park sx={{ color: '#059669' }} />;
      default:
        return <Group sx={{ color: '#7c3aed' }} />;
    }
  };

  const progressPct = (totalCollected / target) * 100;

  const openDialogWith = (amt) => {
    setSelectedAmount(amt);
    setOpenPayment(true);
  };

  const handleCustomDonate = () => {
    if (+customAmount > 0) openDialogWith(+customAmount);
  };

  const onPaymentComplete = (amt) => {
    setTotalCollected((prev) => prev + amt);
    setSnackbarOpen(true);
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  const handlePostClick = () => setPostDialogOpen(true);

  const handlePostDialogClose = async (posted) => {
    if (posted && newPostContent.trim() && newPostTitle.trim()) {
      try {
        const postData = {
          title: newPostTitle.trim(),
          category: newPostCategory,
          beneficiaries: parseInt(newPostBeneficiaries) || 0,
          amount: parseInt(newPostAmount) || 0,
          details: newPostContent.trim(),
          authorId: user?.id || null,
          authorName: newPostAuthor.trim() || user?.name || 'Anonymous',
          status: 'active',
          isVerified: false
        };

        const response = await impactPostsAPI.createPost(postData);
        
        const formattedPost = {
          ...response.data,
          id: response.data._id || response.data.id,
          date: response.data.createdAt || response.data.date,
          icon: getIconForCategory(response.data.category),
        };
        
        setGoodDeeds((prev) => [formattedPost, ...prev]);
        setPostSuccessSnackbar(true);
        
        // Reset all form fields
        setNewPostContent('');
        setNewPostTitle('');
        setNewPostCategory('User Story');
        setNewPostAmount('');
        setNewPostBeneficiaries('');
        setNewPostAuthor('');
        
      } catch (error) {
        console.error('Failed to create post:', error);
        alert('Failed to post your story. Please try again.');
      }
    }
    setPostDialogOpen(false);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb & Post Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link
              component="button"
              variant="body2"
              onClick={() => handleBreadcrumbClick('/dashboard')}
              sx={{
                textDecoration: 'none',
                color: '#64748b',
                '&:hover': { color: '#4f86ff' },
              }}
            >
              Dashboard
            </Link>
            <Typography variant="body2" color="primary" fontWeight={600}>
              Donate
            </Typography>
          </Breadcrumbs>

          {user && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handlePostClick}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                fontWeight: 700,
                fontSize: '16px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                transition: 'all 0.2s ease',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                },
              }}
            >
              Post Story
            </Button>
          )}
        </Box>

        {/* Hero */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
            💝 Make a <span style={{ color: '#4f86ff' }}>Difference</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto' }}>
            Hello {user?.name || 'Helper'}! Join our community in creating positive change. Every donation helps transform lives and builds a better tomorrow.
          </Typography>
        </Box>

        {/* Current Campaign Progress with Create Button */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,134,255,0.1)',
            boxShadow: '0 6px 20px rgba(79,134,255,0.08)',
          }}
        >
          {/* Header with Create Button */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Current Campaign Progress
            </Typography>
            
            {/* Create Campaign Button - Top Right Corner */}
            {user && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateDonationUpdate}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(16,185,129,0.4)',
                  },
                }}
              >
                Create Campaign
              </Button>
            )}
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h4" fontWeight="bold" color="#4f86ff">
                  ₹{totalCollected.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="h6" color="#64748b">
                  of ₹{target.toLocaleString('en-IN')}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  mb: 2,
                  bgcolor: 'rgba(79,134,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg,#4f86ff 0%,#3b82f6 100%)',
                    borderRadius: 6,
                  },
                }}
              />

              <Typography variant="body2" color="#64748b" mb={3}>
                {Math.round(progressPct)} % completed • {Math.round((target - totalCollected) / 1000)} k remaining
              </Typography>

              {/* Update Button for Main Campaign */}
              {user && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => handleEditDonationUpdate('main-campaign')}
                  sx={{
                    borderColor: '#4f86ff',
                    color: '#4f86ff',
                    fontWeight: 600,
                    borderRadius: '10px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      backgroundColor: 'rgba(79, 134, 255, 0.05)',
                    }
                  }}
                >
                  Update Campaign
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="#10b981">
                {goodDeeds.reduce((s, d) => s + (d.beneficiaries || 0), 0)}+
              </Typography>
              <Typography variant="body2" color="#64748b" mb={2}>
                Lives Impacted
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label={`${goodDeeds.length} Projects Completed`}
                sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Active Donation Campaigns with Update buttons */}
        {donationUpdates.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '20px',
              border: '1px solid rgba(16,185,129,0.1)',
              boxShadow: '0 6px 20px rgba(16,185,129,0.08)',
            }}
          >
            <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
              🏃‍♂️ Running Campaigns
            </Typography>
            <Typography variant="body1" color="#64748b" mb={4} textAlign="center">
              Support our ongoing campaigns and help us reach our goals.
            </Typography>

            <Grid container spacing={3}>
              {donationUpdates.map((campaign) => (
                <Grid item xs={12} md={4} key={campaign._id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      border: '1px solid rgba(16,185,129,0.1)',
                      transition: '.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(16,185,129,0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Campaign Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
                          {campaign.title}
                        </Typography>
                        <Chip
                          label={campaign.urgencyLevel}
                          size="small"
                          sx={{
                            bgcolor: campaign.urgencyLevel === 'High' ? '#dc2626' : 
                                    campaign.urgencyLevel === 'Critical' ? '#7f1d1d' :
                                    campaign.urgencyLevel === 'Medium' ? '#f59e0b' : '#4caf50',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="#64748b" mb={2}>
                        {campaign.description.length > 100 
                          ? `${campaign.description.substring(0, 100)}...` 
                          : campaign.description}
                      </Typography>

                      {/* Progress Bar */}
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="body2" color="#64748b">
                            of ₹{campaign.targetAmount.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, ((campaign.currentAmount || 0) / campaign.targetAmount) * 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(16,185,129,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#10b981',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>

                      {/* Campaign Details */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={campaign.category}
                          size="small"
                          sx={{ bgcolor: categoryColor(campaign.category), color: 'white' }}
                        />
                        <Typography variant="body2" color="#64748b">
                          {campaign.beneficiaryCount} beneficiaries
                        </Typography>
                      </Box>

                      {/* Action Buttons - Donate & Update */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<VolunteerActivism />}
                          onClick={() => openDialogWith(1000)}
                          sx={{
                            bgcolor: '#10b981',
                            borderRadius: '10px',
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#059669' }
                          }}
                        >
                          Donate
                        </Button>
                        
                        {/* Update Button for each campaign */}
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEditDonationUpdate(campaign._id)}
                          sx={{
                            borderColor: '#10b981',
                            color: '#10b981',
                            minWidth: '100px',
                            borderRadius: '10px',
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#059669',
                              color: '#059669',
                              bgcolor: 'rgba(16,185,129,0.05)'
                            }
                          }}
                        >
                          Update
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box textAlign="center" mt={3}>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{
                  borderColor: '#10b981',
                  color: '#10b981',
                  fontWeight: 700,
                  borderRadius: '25px',
                  px: 4,
                  '&:hover': { bgcolor: '#10b981', color: 'white' },
                }}
              >
                View All Campaigns
              </Button>
            </Box>
          </Paper>
        )}

        {/* Quick Amounts */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,134,255,0.1)',
            boxShadow: '0 6px 20px rgba(79,134,255,0.08)',
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
            💳 Choose Your Donation Amount
          </Typography>

          <Grid container spacing={2} mb={3}>
            {quickAmounts.map((amt) => (
              <Grid item xs={6} sm={4} md={2} key={amt}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => openDialogWith(amt)}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    border: '2px solid #e3ebf0',
                    fontWeight: 700,
                    transition: 'all .2s',
                    '&:hover': {
                      borderColor: '#4f86ff',
                      background: 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  ₹{amt}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <TextField
              placeholder="Enter custom amount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{ width: { xs: '100%', sm: 220 }, mb: { xs: 2, sm: 0 } }}
            />
            <Button
              variant="contained"
              startIcon={<VolunteerActivism />}
              disabled={+customAmount <= 0}
              onClick={handleCustomDonate}
              sx={{
                borderRadius: '12px',
                px: 4,
                background: 'linear-gradient(135deg,#4f86ff 0%,#3b82f6 100%)',
                fontWeight: 700,
                '&:hover': { background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)' },
              }}
            >
              Donate Now
            </Button>
          </Box>
        </Paper>

        {/* Recent Impact Stories */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '20px',
            border: '1px solid rgba(79,134,255,0.1)',
            boxShadow: '0 6px 20px rgba(79,134,255,0.08)',
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            🌟 Our Recent Impact Stories
          </Typography>
          <Typography variant="body1" color="#64748b" mb={4} textAlign="center">
            See how your donations are changing lives.
          </Typography>

          <Grid container spacing={3}>
            {goodDeeds.map((d) => (
              <Grid item xs={12} md={6} key={d.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid rgba(79,134,255,0.1)',
                    transition: '.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(79,134,255,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" gap={2} mb={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: `${categoryColor(d.category)}15`,
                        }}
                      >
                        {getIconForCategory(d.category)}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {d.title}
                        </Typography>
                        <Chip
                          label={d.category}
                          size="small"
                          sx={{
                            bgcolor: categoryColor(d.category),
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                          }}
                        />
                        {d.authorName && d.authorName !== 'Anonymous' && (
                          <Typography variant="caption" display="block" color="#64748b">
                            by {d.authorName}
                          </Typography>
                        )}
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Chip
                          icon={<CheckCircle />}
                          label={d.status === 'completed' ? 'Completed' : 'Active'}
                          color={d.status === 'completed' ? 'success' : 'primary'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        {d.isVerified && (
                          <Chip
                            icon={<CheckCircle />}
                            label="Verified"
                            size="small"
                            sx={{ bgcolor: '#10b981', color: 'white' }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="#64748b" mb={2}>
                      {d.details}
                    </Typography>

                    {((d.likes && d.likes > 0) || (d.views && d.views > 0)) && (
                      <Box display="flex" gap={2} mb={2}>
                        {d.likes > 0 && (
                          <Typography variant="caption" color="#64748b">
                            👍 {d.likes} likes
                          </Typography>
                        )}
                        {d.views > 0 && (
                          <Typography variant="caption" color="#64748b">
                            👁️ {d.views} views
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color={categoryColor(d.category)}>
                          ₹{(d.amount || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          Amount Used
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight="bold" color="#10b981">
                          {d.beneficiaries || 0}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          People Helped
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="#64748b">
                      Posted on{' '}
                      {new Date(d.createdAt || d.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '25px',
                px: 4,
                border: '2px solid #4f86ff',
                color: '#4f86ff',
                fontWeight: 700,
                '&:hover': { bgcolor: '#4f86ff', color: 'white' },
              }}
            >
              View All Stories
            </Button>
          </Box>
        </Paper>

        {/* Post Story Dialog */}
        <Dialog
          open={postDialogOpen}
          onClose={() => handlePostDialogClose(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: 'none',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color="#1e293b"
                  sx={{ fontSize: '28px' }}
                >
                  ✍️ Share Your Impact Story
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                color="#64748b"
                sx={{ fontSize: '16px', lineHeight: 1.5 }}
              >
                Tell the community about your charitable experience or impact story.
              </Typography>
            </Box>
            
            {/* Form Fields */}
            <Grid container spacing={3}>
              {/* Story Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Story Title"
                  placeholder="Give your story a meaningful title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              {/* Category Selection */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  {['Healthcare', 'Education', 'Food & Nutrition', 'Housing', 'Environment', 'Empowerment', 'User Story'].map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  placeholder="0"
                  value={newPostAmount}
                  onChange={(e) => setNewPostAmount(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              {/* Beneficiaries */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="People Helped"
                  type="number"
                  placeholder="0"
                  value={newPostBeneficiaries}
                  onChange={(e) => setNewPostBeneficiaries(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              {/* Author Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  placeholder="Anonymous"
                  value={newPostAuthor || user?.name || ''}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>
              
              {/* Story Details */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Your Story"
                  placeholder="Write your story here... Share how you made a difference or experienced help from the community."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              {/* Additional Info */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0' 
                }}>
                  <Typography variant="body2" color="#64748b" mb={1}>
                    📊 Additional Information:
                  </Typography>
                  <Typography variant="caption" color="#64748b">
                    • Your story will be posted on: <strong>{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</strong>
                  </Typography>
                  <br />
                  <Typography variant="caption" color="#64748b">
                    • Status: Will be set to <Chip label="Active" size="small" color="primary" sx={{ fontSize: '10px', height: '16px' }} />
                  </Typography>
                  <br />
                  <Typography variant="caption" color="#64748b">
                    • Verification: Pending admin review {user?.isVerified && '(You are a verified user)'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              mt: 3
            }}>
              <Button
                onClick={() => handlePostDialogClose(false)}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  color: '#64748b',
                  fontSize: '16px',
                  fontWeight: 500,
                  textTransform: 'none',
                  border: 'none',
                  background: 'transparent',
                  '&:hover': { 
                    bgcolor: '#f1f5f9',
                    border: 'none'
                  },
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handlePostDialogClose(true)}
                disabled={!newPostContent.trim() || !newPostTitle.trim()}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: (!newPostContent.trim() || !newPostTitle.trim()) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                  '&:hover': { 
                    background: (!newPostContent.trim() || !newPostTitle.trim()) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
                  },
                  '&:disabled': { 
                    bgcolor: '#9ca3af', 
                    color: 'white',
                    cursor: 'not-allowed',
                    boxShadow: 'none'
                  },
                }}
              >
                Post Story
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* DonationUpdate Dialog */}
        <Dialog
          open={donationUpdateDialogOpen}
          onClose={() => setDonationUpdateDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              maxHeight: '90vh'
            }
          }}
        >
          <DonationUpdateForm
            updateId={editingDonationUpdateId}
            onClose={() => setDonationUpdateDialogOpen(false)}
            onSave={handleDonationUpdateSave}
          />
        </Dialog>

        {/* Payment Dialog */}
        <PaymentDialog
          open={openPayment}
          amount={selectedAmount}
          onClose={() => setOpenPayment(false)}
          onPaymentComplete={onPaymentComplete}
        />

        {/* Donation Success Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ borderRadius: '12px' }}
          >
            Thank you! Your donation of ₹{selectedAmount} was successful! 🎉
          </Alert>
        </Snackbar>

        {/* Post Success Snackbar */}
        <Snackbar
          open={postSuccessSnackbar}
          autoHideDuration={4000}
          onClose={() => setPostSuccessSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setPostSuccessSnackbar(false)}
            sx={{ borderRadius: '12px' }}
          >
            Your story has been posted successfully! 🎉
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

function PaymentDialog({ open, onClose, amount, onPaymentComplete }) {
  const [step, setStep] = useState(1);
  const [count, setCount] = useState(30);

  useEffect(() => {
    if (open) {
      setStep(1);
      setCount(30);
    }
  }, [open]);

  useEffect(() => {
    let timer;
    if (step === 1 && count > 0) {
      timer = setTimeout(() => setCount((c) => c - 1), 1000);
    }
    if (step === 1 && count === 0) {
      simulateSuccess();
    }
    return () => clearTimeout(timer);
  }, [step, count]);

  const simulateSuccess = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        onPaymentComplete(amount);
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'linear-gradient(135deg,#4f86ff 0%,#3b82f6 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {step === 1 && '📱 Complete Payment'}
          {step === 2 && '⏳ Processing Payment'}
          {step === 3 && '✅ Payment Successful'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        {step === 1 && (
          <>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              ₹{amount.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="#64748b" mb={3}>
              Scan this QR code with any UPI app
            </Typography>

            <Box
              sx={{
                width: 200,
                height: 200,
                mx: 'auto',
                mb: 3,
                border: '4px solid #4f86ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(45deg,#f0f0f0 25%,transparent 25%,transparent 75%,#f0f0f0 75%),linear-gradient(45deg,#f0f0f0 25%,transparent 25%,transparent 75%,#f0f0f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0,10px 10px',
                position: 'relative',
              }}
            >
              <QrCodeScanner sx={{ fontSize: 60, color: '#4f86ff' }} />
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: '#10b981',
                  color: 'white',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {count}
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={simulateSuccess}
              sx={{
                borderRadius: '25px',
                px: 4,
                background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                fontWeight: 700,
              }}
            >
              Simulate Success
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                bgcolor: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Processing your donation…
            </Typography>
            <Typography variant="body2" color="#64748b">
              Please wait while we confirm the payment of ₹{amount}
            </Typography>
          </>
        )}

        {step === 3 && (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                bgcolor: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Thank you for your generosity! 🎉
            </Typography>
            <Typography variant="body2" color="#64748b">
              Your donation of ₹{amount} makes a real impact.
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DonationPage;
