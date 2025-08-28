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
  CircularProgress,
  Avatar,
  Divider,
  Fade,
  Slide,
  Backdrop,
} from '@mui/material';
import {
  VolunteerActivism,
  TrendingUp,
  CheckCircle,
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
  Favorite as Heart,
  CurrencyRupee,
  AutoAwesome,
  EmojiEvents,
  Verified,
  Timeline,
  AccountBalance,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { impactPostsAPI, donationUpdateAPI } from '../../services/api';
import DonationUpdateForm from './DonationUpdate';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // Razorpay payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState('');

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
          authorName: 'Dr. Sarah Johnson',
          isVerified: true,
          likes: 124,
          views: 856
        },
        {
          id: 2,
          title: 'Education Scholarship Program',
          category: 'Education',
          beneficiaries: 30,
          amount: 18500,
          date: '2025-08-15',
          details: 'Funded school fees, textbooks, uniforms, and stationery for an entire academic year.',
          authorName: 'Maria Rodriguez',
          isVerified: false,
          likes: 89,
          views: 432
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
      setDonationUpdates([]);
    }
  };

  // ✅ WORKING RAZORPAY PAYMENT FUNCTION - DON'T CHANGE
  const handleRazorpayPayment = async (amount) => {
    if (!donorName.trim() || !donorEmail.trim()) {
      setPaymentError('Please enter your name and email address');
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Failed to load payment gateway. Please try again.');
        return;
      }

      console.log('💰 Creating order for amount:', amount);

      const response = await fetch('http://localhost:5000/api/donations/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim(),
          message: 'Community donation',
          campaignId: 'main-campaign'
        }),
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        setPaymentError(orderData.message || 'Failed to create order');
        return;
      }

      console.log('✅ Order created:', orderData.data.orderId);

      const options = {
        key: 'rzp_test_RAWJZe53MZOrPx',
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: 'HelpHub Community',
        description: 'Community Donation',
        image: '/logo192.png',
        order_id: orderData.data.orderId,
        handler: async function (response) {
          console.log('🎉 Payment successful:', response);
          
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/donations/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: orderData.data.transactionId
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              setTotalCollected(prev => prev + parseFloat(amount));
              setSnackbarOpen(true);
              setOpenPayment(false);
              setCustomAmount('');
            } else {
              setPaymentError('Payment verification failed. Please contact support if amount was deducted.');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            setPaymentError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setPaymentLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response);
        setPaymentError(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Donation error:', error);
      setPaymentError('Something went wrong. Please try again.');
    } finally {
      setPaymentLoading(false);
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
      Healthcare: '#1e40af',
      Education: '#2563eb',
      'Food & Nutrition': '#3b82f6',
      Housing: '#60a5fa',
      Environment: '#93c5fd',
      Empowerment: '#1d4ed8',
      'User Story': '#2563eb',
      'Community': '#3b82f6',
      'Emergency': '#1e40af',
      'Other': '#6b7280'
    }[cat] || '#6b7280');

  const getIconForCategory = (category) => {
    const iconStyle = { fontSize: 24, color: '#ffffff' };
    switch (category) {
      case 'Healthcare':
        return <LocalHospital sx={iconStyle} />;
      case 'Education':
        return <School sx={iconStyle} />;
      case 'Food & Nutrition':
        return <Restaurant sx={iconStyle} />;
      case 'Housing':
        return <HomeIcon sx={iconStyle} />;
      case 'Environment':
        return <Park sx={iconStyle} />;
      default:
        return <Group sx={iconStyle} />;
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Professional Header with Breadcrumb & Post Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(37, 99, 235, 0.1)',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08)',
        }}>
          <Box>
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" sx={{ color: '#2563eb' }} />}
              sx={{ mb: 1 }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={() => handleBreadcrumbClick('/dashboard')}
                sx={{
                  textDecoration: 'none',
                  color: '#64748b',
                  fontWeight: 500,
                  '&:hover': { color: '#2563eb' },
                  transition: 'all 0.2s ease',
                }}
              >
                Dashboard
              </Link>
              <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                Donate
              </Typography>
            </Breadcrumbs>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              Make a difference in someone's life today
            </Typography>
          </Box>

          {user && (
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: 20 }} />}
              onClick={handlePostClick}
              sx={{
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                fontWeight: 600,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.3s ease',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.35)',
                },
              }}
            >
              Share Your Story
            </Button>
          )}
        </Box>

        {/* Hero Section - Professional & Elegant */}
        <Box textAlign="center" mb={6}>
          <Fade in timeout={1000}>
            <Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b', 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                Transform Lives Through
                <br />
                <span style={{ color: '#2563eb' }}>Giving</span>
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b', 
                  maxWidth: 700, 
                  mx: 'auto',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Hello <strong>{user?.name || 'Helper'}</strong>! Join thousands of donors in creating positive change. 
                Every contribution, no matter the size, makes a meaningful impact in our community.
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Professional Campaign Progress Card */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 5,
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                }}
              >
                <EmojiEvents sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b' }}>
                  Campaign Progress
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Building a better future together
                </Typography>
              </Box>
            </Box>

            {user && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleCreateDonationUpdate}
                sx={{
                  borderRadius: '16px',
                  px: 3,
                  py: 1.5,
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                Create Campaign
              </Button>
            )}
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: '#2563eb',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    ₹{totalCollected.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                    of ₹{target.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                <Box sx={{ position: 'relative', mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressPct}
                    sx={{
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
                        borderRadius: 8,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.3))',
                          animation: 'shimmer 2s infinite',
                        }
                      },
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    {Math.round(progressPct)}%
                  </Typography>
                </Box>

                <Box display="flex" gap={4}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>
                      {Math.round(progressPct)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Completed
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700 }}>
                      ₹{Math.round((target - totalCollected) / 1000)}k
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Remaining
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  border: '1px solid rgba(37, 99, 235, 0.1)'
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  }}
                >
                  <Timeline sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: 800, mb: 1 }}>
                  {goodDeeds.reduce((s, d) => s + (d.beneficiaries || 0), 0)}+
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>
                  Lives Impacted
                </Typography>
                <Chip
                  icon={<AutoAwesome />}
                  label={`${goodDeeds.length} Success Stories`}
                  sx={{ 
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)', 
                    color: 'white', 
                    fontWeight: 600,
                    borderRadius: '12px'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Professional Donation Amount Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 5,
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Box textAlign="center" mb={4}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              }}
            >
              <AccountBalance sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
              Choose Your Impact
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto' }}>
              Select an amount that feels right for you. Every contribution makes a difference.
            </Typography>
          </Box>

          <Grid container spacing={3} mb={4}>
            {quickAmounts.map((amt, index) => (
              <Grid item xs={6} sm={4} md={2} key={amt}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => openDialogWith(amt)}
                  sx={{
                    py: 3,
                    borderRadius: '20px',
                    border: '2px solid #e2e8f0',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#1e293b',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#2563eb',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(37, 99, 235, 0.15)',
                      color: '#2563eb',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, #2563eb, #3b82f6)`,
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover::before': {
                      transform: 'translateX(0)',
                    }
                  }}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Box 
            display="flex" 
            gap={3} 
            justifyContent="center" 
            flexWrap="wrap"
            sx={{
              p: 3,
              borderRadius: '24px',
              background: 'rgba(37, 99, 235, 0.02)',
              border: '1px solid rgba(37, 99, 235, 0.1)'
            }}
          >
            <TextField
              placeholder="Enter custom amount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupee sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Heart />}
              disabled={+customAmount <= 0}
              onClick={handleCustomDonate}
              sx={{
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                minWidth: 160,
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.35)',
                },
                '&:disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8'
                }
              }}
            >
              Donate Now
            </Button>
          </Box>
        </Paper>

        {/* Professional Impact Stories Section */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Box textAlign="center" mb={5}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              }}
            >
              <AutoAwesome sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
              Impact Stories
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto' }}>
              Real stories from our community showing how your contributions create lasting change.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {goodDeeds.map((story, index) => (
              <Grid item xs={12} md={6} key={story.id}>
                <Fade in timeout={1000 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
                        borderColor: '#2563eb',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${categoryColor(story.category)}, #3b82f6)`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" gap={3} mb={3}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: `linear-gradient(135deg, ${categoryColor(story.category)}, #3b82f6)`,
                          }}
                        >
                          {getIconForCategory(story.category)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
                            {story.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Chip
                              label={story.category}
                              size="small"
                              sx={{
                                background: `linear-gradient(135deg, ${categoryColor(story.category)}, #3b82f6)`,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '8px'
                              }}
                            />
                            {story.isVerified && (
                              <Chip
                                icon={<Verified sx={{ fontSize: 16 }} />}
                                label="Verified"
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #059669, #10b981)',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: '8px'
                                }}
                              />
                            )}
                          </Box>
                          {story.authorName && story.authorName !== 'Anonymous' && (
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                              by {story.authorName}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
                        {story.details}
                      </Typography>

                      {((story.likes && story.likes > 0) || (story.views && story.views > 0)) && (
                        <Box display="flex" gap={3} mb={3}>
                          {story.likes > 0 && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Heart sx={{ fontSize: 16, color: '#ef4444' }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                {story.likes} likes
                              </Typography>
                            </Box>
                          )}
                          {story.views > 0 && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                👁️ {story.views} views
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      <Divider sx={{ my: 2, borderColor: 'rgba(37, 99, 235, 0.1)' }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>
                            ₹{(story.amount || 0).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Funds Utilized
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>
                            {story.beneficiaries || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Lives Touched
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 2, display: 'block' }}>
                        {new Date(story.createdAt || story.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={5}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '20px',
                px: 5,
                py: 1.5,
                border: '2px solid #2563eb',
                color: '#2563eb',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  borderColor: '#2563eb',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                },
              }}
            >
              View All Success Stories
            </Button>
          </Box>
        </Paper>

        {/* Professional Payment Dialog */}
        <Dialog
          open={openPayment}
          onClose={() => setOpenPayment(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
              overflow: 'hidden'
            }
          }}
          BackdropComponent={Backdrop}
          BackdropProps={{
            sx: { backgroundColor: 'rgba(37, 99, 235, 0.1)', backdropFilter: 'blur(8px)' }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white',
              py: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.3))',
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
                <Security />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700">
                  Secure Donation
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Powered by Razorpay
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => setOpenPayment(false)} 
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 5 }}>
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  fontSize: '2rem'
                }}
              >
                ₹
              </Avatar>
              <Typography variant="h3" sx={{ color: '#2563eb', fontWeight: 800, mb: 1 }}>
                ₹{selectedAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Your generous contribution
              </Typography>
            </Box>

            {paymentError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                {paymentError}
              </Alert>
            )}

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(37, 99, 235, 0.02)',
                      '&:hover fieldset': { borderColor: '#2563eb' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(37, 99, 235, 0.02)',
                      '&:hover fieldset': { borderColor: '#2563eb' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      backgroundColor: 'rgba(37, 99, 235, 0.02)',
                      '&:hover fieldset': { borderColor: '#2563eb' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handleRazorpayPayment(selectedAmount)}
              disabled={paymentLoading || !donorName.trim() || !donorEmail.trim()}
              startIcon={paymentLoading ? <CircularProgress size={20} color="inherit" /> : <Heart />}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                py: 2,
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 12px 32px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  boxShadow: '0 16px 40px rgba(37, 99, 235, 0.35)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  color: '#94a3b8',
                  boxShadow: 'none'
                }
              }}
            >
              {paymentLoading ? 'Processing Payment...' : `Complete Donation of ₹${selectedAmount}`}
            </Button>

            <Box 
              sx={{ 
                textAlign: 'center', 
                mt: 3,
                p: 2,
                borderRadius: '16px',
                background: 'rgba(37, 99, 235, 0.04)',
                border: '1px solid rgba(37, 99, 235, 0.1)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Security sx={{ fontSize: 16, color: '#2563eb' }} />
                Your donation is secured with 256-bit SSL encryption
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Professional Success Snackbar */}
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
            sx={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)'
            }}
          >
            🎉 Thank you! Your donation of ₹{selectedAmount} was successful!
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
            sx={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)'
            }}
          >
            Your story has been shared successfully! 🎉
          </Alert>
        </Snackbar>
      </Container>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
}

export default DonationPage;
