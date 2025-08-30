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
  DialogActions,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
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
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Send,
  Help,
  CampaignOutlined,
  CalendarToday,
  Delete as DeleteIcon,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { impactPostsAPI, campaignAPI, donationsAPI } from '../../services/api';

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

  // ✅ REAL-TIME CAMPAIGN PROGRESS STATES (UNLIMITED TOTAL)
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    totalDonors: 0,
    totalDonatedAllTime: 0
  });

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postSuccessSnackbar, setPostSuccessSnackbar] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [goodDeeds, setGoodDeeds] = useState([]);

  // ✅ NEW: Campaign-specific donation states
  const [campaignDonationOpen, setCampaignDonationOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDonationAmount, setCampaignDonationAmount] = useState('');

  // Razorpay payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState('');

  // Campaign states
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // DELETE CAMPAIGN STATES
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Post dialog states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('User Story');
  const [newPostAmount, setNewPostAmount] = useState('');
  const [newPostBeneficiaries, setNewPostBeneficiaries] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');

  // Campaign form states
  const [campaignFormData, setCampaignFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: '',
    urgency: 'Medium',
    location: '',
    endDate: ''
  });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignError, setCampaignError] = useState('');

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const campaignQuickAmounts = [500, 1000, 2000, 5000];

  // Categories for both post form and campaign form
  const categories = [
    'User Story',
    'Healthcare',
    'Education',
    'Food & Nutrition',
    'Housing',
    'Environment',
    'Community',
    'Emergency',
    'Other'
  ];

  const campaignCategories = [
    'Healthcare',
    'Education', 
    'Food & Nutrition',
    'Housing',
    'Environment',
    'Emergency',
    'Community',
    'Other'
  ];

  const urgencyLevels = [
    'Low',
    'Medium', 
    'High',
    'Critical'
  ];

  // Load data on mount
  useEffect(() => {
    fetchImpactPosts();
    fetchCampaigns();
    fetchCampaignStats();
  }, []);

  // ✅ FIXED: Remove fake stories fallback
  const fetchImpactPosts = async () => {
    try {
      console.log('🔄 Fetching real impact posts from backend...');
      const response = await impactPostsAPI.getAllPosts();
      
      if (response.success && response.data) {
        const postsData = response.data.posts || response.data;
        
        if (Array.isArray(postsData) && postsData.length > 0) {
          const formattedPosts = postsData.map(post => ({
            ...post,
            id: post._id || post.id,
            date: post.createdAt || post.date,
            icon: getIconForCategory(post.category)
          }));
          console.log('✅ Real impact posts loaded:', formattedPosts.length, 'posts');
          setGoodDeeds(formattedPosts);
        } else {
          console.log('📝 No impact posts found in database');
          setGoodDeeds([]);
        }
      } else {
        console.log('📝 No impact posts data received');
        setGoodDeeds([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch impact posts:', error);
      setGoodDeeds([]); // Empty array instead of fake data
    }
  };

  // ✅ FETCH REAL-TIME CAMPAIGN STATISTICS (UNLIMITED TOTAL)
  const fetchCampaignStats = async () => {
    setLoadingStats(true);
    try {
      console.log('🔄 Fetching campaign statistics from database...');
      const response = await campaignAPI.getCampaignStats();
      console.log('✅ Campaign stats fetched:', response);
      if (response.success) {
        setCampaignStats(response.data);
        console.log('📊 Campaign stats updated:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch campaign stats:', error);
      setCampaignStats({
        totalCampaigns: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        totalDonors: 0,
        totalDonatedAllTime: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      console.log('🔄 Fetching campaigns from database...');
      const response = await campaignAPI.getAllCampaigns();
      console.log('✅ Campaigns fetched:', response);
      if (response.success) {
        setCampaigns(response.data || []);
        console.log('📝 Campaigns state updated with', (response.data || []).length, 'campaigns');
      }
    } catch (error) {
      console.error('❌ Failed to fetch campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // ✅ NEW: Campaign-specific donation functions
  const handleCampaignDonate = (campaign) => {
    if (!user) {
      alert('Please login to donate');
      return;
    }
    setSelectedCampaign(campaign);
    setCampaignDonationOpen(true);
    setCampaignDonationAmount('');
    setPaymentError('');
  };

  const handleCampaignDonationClose = () => {
    setCampaignDonationOpen(false);
    setSelectedCampaign(null);
    setCampaignDonationAmount('');
    setPaymentError('');
  };

  // ✅ FIXED: Campaign donation with API service calls
  const handleCampaignDonationPayment = async (amount) => {
    if (!donorName.trim() || !donorEmail.trim()) {
      setPaymentError('Please enter your name and email address');
      return;
    }

    if (!selectedCampaign) {
      setPaymentError('No campaign selected');
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

      console.log('💰 Creating campaign donation order:', {
        campaignId: selectedCampaign._id,
        campaignTitle: selectedCampaign.title,
        amount: parseFloat(amount)
      });

      // ✅ FIXED: Use API service instead of direct fetch
      const orderData = await donationsAPI.createOrder({
        amount: parseFloat(amount),
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim(),
        message: `Donation for ${selectedCampaign.title}`,
        campaignId: selectedCampaign._id
      });
      
      if (!orderData.success) {
        setPaymentError(orderData.message || 'Failed to create order');
        return;
      }

      console.log('✅ Campaign donation order created:', orderData.data.orderId);

      const options = {
        key: 'rzp_test_RAWJZe53MZOrPx',
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: 'HelpHub Community',
        description: `Donation for ${selectedCampaign.title}`,
        image: '/logo192.png',
        order_id: orderData.data.orderId,
        handler: async function (response) {
          console.log('🎉 Campaign donation payment successful:', response);
          
          try {
            // ✅ FIXED: Use API service for payment verification
            const verifyData = await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: orderData.data.transactionId
            });
            
            if (verifyData.success) {
              console.log('✅ Campaign donation verified successfully');
              
              // ✅ CRITICAL: Update campaign with donation
              try {
                await campaignAPI.donateToCampaign(selectedCampaign._id, {
                  amount: parseFloat(amount),
                  donorName: donorName.trim(),
                  donorEmail: donorEmail.trim(),
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id
                });
                console.log('✅ Campaign donation amount updated');
              } catch (donationError) {
                console.error('❌ Error updating campaign donation:', donationError);
              }
              
              // ✅ REFRESH ALL DATA AFTER SUCCESSFUL DONATION
              await Promise.all([
                fetchCampaigns(),
                fetchCampaignStats()
              ]);
              
              setSnackbarOpen(true);
              setCampaignDonationOpen(false);
              setCampaignDonationAmount('');
              setSelectedCampaign(null);
              
              console.log('✅ Campaign data refreshed after donation');
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
      console.error('Campaign donation error:', error);
      setPaymentError('Something went wrong. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // DELETE CAMPAIGN FUNCTIONS
  const handleDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    setDeleteLoading(true);
    try {
      console.log('🗑️ Deleting campaign:', campaignToDelete._id);
      const response = await campaignAPI.deleteCampaign(campaignToDelete._id);
      
      if (response.success) {
        console.log('✅ Campaign deleted successfully');
        // Refresh data
        await fetchCampaigns();
        await fetchCampaignStats();
        setDeleteDialogOpen(false);
        setCampaignToDelete(null);
        setPostSuccessSnackbar(true);
      } else {
        throw new Error(response.message || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      alert(`Failed to delete campaign: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteCampaign = () => {
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  // ✅ FIXED: General donation with API service calls
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

      console.log('💰 Creating general donation order for amount:', amount);

      // ✅ FIXED: Use API service instead of direct fetch
      const orderData = await donationsAPI.createOrder({
        amount: parseFloat(amount),
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim(),
        message: 'General community donation',
        campaignId: 'general'
      });
      
      if (!orderData.success) {
        setPaymentError(orderData.message || 'Failed to create order');
        return;
      }

      console.log('✅ General donation order created:', orderData.data.orderId);

      const options = {
        key: 'rzp_test_RAWJZe53MZOrPx',
        amount: orderData.data.amount * 100,
        currency: orderData.data.currency,
        name: 'HelpHub Community',
        description: 'General Community Donation',
        image: '/logo192.png',
        order_id: orderData.data.orderId,
        handler: async function (response) {
          console.log('🎉 General donation payment successful:', response);
          
          try {
            // ✅ FIXED: Use API service for payment verification
            const verifyData = await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: orderData.data.transactionId
            });
            
            if (verifyData.success) {
              // ✅ REFRESH CAMPAIGN STATS AFTER GENERAL DONATION
              await fetchCampaignStats();
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

  // Button click handlers
  const handlePostClick = () => {
    console.log('Opening post dialog...');
    setPostDialogOpen(true);
  };

  const handleCreateCampaign = () => {
    console.log('Opening campaign dialog...');
    setCampaignDialogOpen(true);
  };

  // Dialog close handlers  
  const handlePostDialogClose = async (shouldSubmit) => {
    if (shouldSubmit && newPostContent.trim() && newPostTitle.trim()) {
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

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!campaignFormData.title.trim()) {
      setCampaignError('Campaign title is required');
      return;
    }
    
    if (!campaignFormData.description.trim()) {
      setCampaignError('Campaign description is required');
      return;
    }
    
    if (!campaignFormData.targetAmount || parseFloat(campaignFormData.targetAmount) <= 0) {
      setCampaignError('Valid target amount is required');
      return;
    }
    
    if (!campaignFormData.category) {
      setCampaignError('Campaign category is required');
      return;
    }

    setCampaignLoading(true);
    setCampaignError('');

    try {
      console.log('🚀 Creating campaign with data:', campaignFormData);
      
      const response = await campaignAPI.createCampaign({
        ...campaignFormData,
        targetAmount: parseFloat(campaignFormData.targetAmount)
      });

      console.log('✅ Campaign created successfully:', response);

      if (response.success) {
        console.log('🔄 Refreshing campaigns and stats from database...');
        // ✅ REFRESH BOTH CAMPAIGNS AND STATS
        await Promise.all([
          fetchCampaigns(),
          fetchCampaignStats()
        ]);
        
        // Reset form
        setCampaignFormData({
          title: '',
          description: '',
          targetAmount: '',
          category: '',
          urgency: 'Medium',
          location: '',
          endDate: ''
        });

        setCampaignDialogOpen(false);
        setPostSuccessSnackbar(true);
        console.log('✅ Campaign successfully created and data refreshed!');
      } else {
        setCampaignError(response.message || 'Failed to create campaign');
      }
      
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      setCampaignError('Failed to create campaign. Please try again.');
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleCampaignChange = (e) => {
    setCampaignFormData({
      ...campaignFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCampaignClose = () => {
    if (!campaignLoading) {
      setCampaignFormData({
        title: '',
        description: '',
        targetAmount: '',
        category: '',
        urgency: 'Medium',
        location: '',
        endDate: ''
      });
      setCampaignError('');
      setCampaignDialogOpen(false);
    }
  };

  // Footer handlers
  const handleNavigation = (path) => {
    navigate(path);
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

  // ✅ UNLIMITED TOTAL DONATION PROGRESS (NO LIMITS)
  const totalDonatedAmount = campaignStats.totalDonatedAllTime || campaignStats.totalCurrentAmount || 0;

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

  return (
    <>
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

          {/* ✅ REAL-TIME PROGRESS TRACKER (UNLIMITED TOTAL) */}
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
                  <Timeline sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b' }}>
                    Community Impact Tracker
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Real-time donations and campaign progress (unlimited total)
                  </Typography>
                </Box>
              </Box>

              {user && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleCreateCampaign}
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

            {loadingStats ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
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
                        ₹{(totalDonatedAmount || 0).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                        Total Donated
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
                        Unlimited donation progress - every contribution counts!
                      </Typography>
                      <Box sx={{ 
                        height: 16, 
                        borderRadius: 8,
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
                        position: 'relative',
                        overflow: 'hidden',
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
                      }} />
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                            {(campaignStats.totalCampaigns || 0)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Active Campaigns
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 700 }}>
                            {(campaignStats.totalDonors || 0)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Total Donors
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>
                            ₹{Math.round((campaignStats.totalCurrentAmount || 0) / 1000)}k
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Raised This Month
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 700 }}>
                            {goodDeeds.reduce((s, d) => s + (d.beneficiaries || 0), 0)}+
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Lives Impacted
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
                      <EmojiEvents sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: 800, mb: 1 }}>
                      Growing
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>
                      Impact Every Day
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
            )}
          </Paper>

          {/* ✅ ACTIVE CAMPAIGNS WITH DONATE BUTTONS */}
          {campaigns.length > 0 && (
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
                  <CampaignOutlined sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
                  Active Campaigns ({campaigns.length})
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto' }}>
                  Support these ongoing campaigns and help make a difference in our community.
                </Typography>
              </Box>

              {loadingCampaigns ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {campaigns.map((campaign) => (
                    <Grid item xs={12} md={6} key={campaign._id || campaign.id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: '20px',
                          border: '1px solid rgba(37, 99, 235, 0.1)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.15)',
                            borderColor: '#2563eb',
                          },
                        }}
                      >
                        {/* DELETE BUTTON FOR CAMPAIGN CREATORS */}
                        {user && campaign.creator && campaign.creator._id === user.id && (
                          <Tooltip title="Delete Campaign">
                            <IconButton
                              onClick={() => handleDeleteCampaign(campaign)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                                zIndex: 1,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <CardContent sx={{ p: 4 }}>
                          <Box display="flex" gap={3} mb={3}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                background: `linear-gradient(135deg, ${categoryColor(campaign.category)}, #3b82f6)`,
                              }}
                            >
                              {getIconForCategory(campaign.category)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
                                {campaign.title}
                              </Typography>
                              <Chip
                                label={campaign.category}
                                size="small"
                                sx={{
                                  background: `linear-gradient(135deg, ${categoryColor(campaign.category)}, #3b82f6)`,
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: '8px'
                                }}
                              />
                              {campaign.urgency && (
                                <Chip
                                  label={`${campaign.urgency} Priority`}
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    background: campaign.urgency === 'Critical' ? '#ef4444' : 
                                               campaign.urgency === 'High' ? '#f97316' : 
                                               campaign.urgency === 'Medium' ? '#eab308' : '#22c55e',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '8px'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
                            {campaign.description}
                          </Typography>

                          <Box mb={3}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>
                                ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                of ₹{campaign.targetAmount.toLocaleString('en-IN')}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(((campaign.currentAmount || 0) / campaign.targetAmount) * 100, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${categoryColor(campaign.category)}, #3b82f6)`,
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                              {Math.round(((campaign.currentAmount || 0) / campaign.targetAmount) * 100)}% funded
                              {campaign.donors && campaign.donors.length > 0 && (
                                <span> • {campaign.donors.length} donors</span>
                              )}
                            </Typography>
                          </Box>

                          {/* ✅ DONATE BUTTON FOR EACH CAMPAIGN */}
                          <Box mb={3}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<Heart />}
                              onClick={() => handleCampaignDonate(campaign)}
                              disabled={!user || campaign.status !== 'active'}
                              sx={{
                                borderRadius: '12px',
                                py: 1.5,
                                background: `linear-gradient(135deg, ${categoryColor(campaign.category)}, #3b82f6)`,
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: `0 8px 24px ${categoryColor(campaign.category)}40`,
                                '&:hover': {
                                  background: `linear-gradient(135deg, ${categoryColor(campaign.category)}, #2563eb)`,
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 12px 32px ${categoryColor(campaign.category)}50`,
                                },
                                '&:disabled': {
                                  background: '#e2e8f0',
                                  color: '#94a3b8'
                                }
                              }}
                            >
                              {!user ? 'Login to Donate' : 
                               campaign.status !== 'active' ? 'Campaign Ended' : 
                               'Donate Now'}
                            </Button>
                          </Box>

                          <Divider sx={{ my: 2, borderColor: 'rgba(37, 99, 235, 0.1)' }} />

                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Created by
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {campaign.creator?.name || 'Anonymous'}
                              </Typography>
                            </Box>
                            {campaign.location && (
                              <Box textAlign="right">
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  Location
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                  {campaign.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Created on {new Date(campaign.createdAt || campaign.date).toLocaleDateString('en-IN', {
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
              )}
            </Paper>
          )}

          {/* Professional General Donation Section */}
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
                General Community Donation
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto' }}>
                Support our overall community efforts with a general donation.
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

          {/* ✅ IMPACT STORIES SECTION - NO FAKE DATA */}
          {goodDeeds.length > 0 && (
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
          )}

          {/* ✅ EMPTY STATE MESSAGE WHEN NO IMPACT STORIES */}
          {goodDeeds.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: '32px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(37, 99, 235, 0.1)',
                boxShadow: '0 20px 40px rgba(37, 99, 235, 0.08)',
                textAlign: 'center'
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
                <AutoAwesome sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="700" sx={{ color: '#1e293b', mb: 1 }}>
                Impact Stories
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', mb: 3 }}>
                Be the first to share your impact story and inspire others in our community!
              </Typography>
              {user && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handlePostClick}
                  sx={{
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(37, 99, 235, 0.35)',
                    },
                  }}
                >
                  Share Your Story
                </Button>
              )}
            </Paper>
          )}
        </Container>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </Box>

      {/* ✅ CAMPAIGN-SPECIFIC DONATION DIALOG */}
      <Dialog
        open={campaignDonationOpen}
        onClose={handleCampaignDonationClose}
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
      >
        <DialogTitle
          sx={{
            background: selectedCampaign ? `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #3b82f6)` : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
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
              {selectedCampaign ? getIconForCategory(selectedCampaign.category) : <Heart />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">
                Donate to Campaign
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {selectedCampaign ? selectedCampaign.title : 'Loading...'}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCampaignDonationClose} 
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
          {selectedCampaign && (
            <>
              <Box textAlign="center" mb={4}>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 2 }}>
                  {selectedCampaign.title}
                </Typography>
                <Box display="flex" justifyContent="center" gap={2} mb={3}>
                  <Chip label={selectedCampaign.category} size="small" />
                  <Chip
                    label={`₹${(selectedCampaign.currentAmount || 0).toLocaleString('en-IN')} raised`}
                    size="small"
                    sx={{ background: '#e0f2fe', color: '#0277bd' }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((selectedCampaign.currentAmount || 0) / selectedCampaign.targetAmount) * 100, 100)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {Math.round(((selectedCampaign.currentAmount || 0) / selectedCampaign.targetAmount) * 100)}% of ₹{selectedCampaign.targetAmount.toLocaleString('en-IN')} goal
                </Typography>
              </Box>

              <Box mb={4}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Choose Amount
                </Typography>
                <Grid container spacing={2} mb={3}>
                  {campaignQuickAmounts.map((amt) => (
                    <Grid item xs={6} key={amt}>
                      <Button
                        fullWidth
                        variant={campaignDonationAmount === amt.toString() ? 'contained' : 'outlined'}
                        onClick={() => setCampaignDonationAmount(amt.toString())}
                        sx={{ py: 1.5, borderRadius: '12px' }}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <TextField
                  fullWidth
                  label="Custom Amount"
                  type="number"
                  value={campaignDonationAmount}
                  onChange={(e) => setCampaignDonationAmount(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupee />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Box>

              {paymentError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '12px',
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
                    label="Your Name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => handleCampaignDonationPayment(campaignDonationAmount)}
                disabled={paymentLoading || !donorName.trim() || !donorEmail.trim() || !campaignDonationAmount || parseFloat(campaignDonationAmount) <= 0}
                startIcon={paymentLoading ? <CircularProgress size={20} color="inherit" /> : <Heart />}
                sx={{
                  background: selectedCampaign ? `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #3b82f6)` : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  py: 2,
                  borderRadius: '16px',
                  textTransform: 'none',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    background: selectedCampaign ? `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #2563eb)` : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
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
                {paymentLoading ? 'Processing...' : `Donate ₹${campaignDonationAmount || 0} to Campaign`}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* General Payment Dialog */}
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
                General Donation
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Community support
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteCampaign}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
            <Warning />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="700">
              Delete Campaign
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1e293b' }}>
            Are you sure you want to delete this campaign?
          </Typography>
          
          {campaignToDelete && (
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                {campaignToDelete.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Target: ₹{campaignToDelete.targetAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Current Amount: ₹{(campaignToDelete.currentAmount || 0).toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}

          <Alert severity="warning" sx={{ borderRadius: '12px' }}>
            {campaignToDelete && (campaignToDelete.currentAmount > 0) ? 
              'This campaign has received donations and cannot be deleted. Consider marking it as completed instead.' :
              'This will permanently delete the campaign and all associated data.'
            }
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={cancelDeleteCampaign}
            disabled={deleteLoading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDeleteCampaign}
            disabled={deleteLoading || (campaignToDelete && campaignToDelete.currentAmount > 0)}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af',
              }
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SHARE YOUR STORY DIALOG */}
      <Dialog
        open={postDialogOpen}
        onClose={() => handlePostDialogClose(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
          }
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
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
              <AutoAwesome />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Share Your Impact Story ✨
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Inspire others with your helping experience
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => handlePostDialogClose(false)} 
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Story Title"
                placeholder="e.g., 'How I helped a family during emergency'"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                sx={{ mb: 3 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newPostCategory}
                  label="Category"
                  onChange={(e) => setNewPostCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author Name (Optional)"
                placeholder="Your name or leave blank for Anonymous"
                value={newPostAuthor}
                onChange={(e) => setNewPostAuthor(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="People Helped"
                type="number"
                placeholder="e.g., 5"
                value={newPostBeneficiaries}
                onChange={(e) => setNewPostBeneficiaries(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount Utilized (₹)"
                type="number"
                placeholder="e.g., 10000"
                value={newPostAmount}
                onChange={(e) => setNewPostAmount(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Story"
                placeholder="Tell us about the help you provided, the impact it made, and how it changed lives..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => handlePostDialogClose(false)}
            sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handlePostDialogClose(true)}
            disabled={!newPostTitle.trim() || !newPostContent.trim()}
            sx={{ 
              borderRadius: 3, 
              textTransform: 'none', 
              px: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            }}
          >
            Share Story
          </Button>
        </DialogActions>
      </Dialog>

      {/* CAMPAIGN CREATION DIALOG */}
      <Dialog
        open={campaignDialogOpen}
        onClose={handleCampaignClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
          }
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
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
              <CampaignOutlined />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Create New Campaign ✨
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Launch your fundraising initiative
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCampaignClose}
            disabled={campaignLoading}
            sx={{
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCampaignSubmit}>
          <DialogContent sx={{ p: 4 }}>
            {campaignError && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: '12px' }}
                onClose={() => setCampaignError('')}
              >
                {campaignError}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign Title"
                  name="title"
                  value={campaignFormData.title}
                  onChange={handleCampaignChange}
                  placeholder="e.g., Help Build a Community Center"
                  disabled={campaignLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Campaign Description"
                  name="description"
                  value={campaignFormData.description}
                  onChange={handleCampaignChange}
                  placeholder="Describe your campaign, its goals, and the impact it will make..."
                  disabled={campaignLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  name="targetAmount"
                  type="number"
                  value={campaignFormData.targetAmount}
                  onChange={handleCampaignChange}
                  placeholder="50000"
                  disabled={campaignLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupee sx={{ color: '#2563eb' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={campaignLoading}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={campaignFormData.category}
                    label="Category"
                    onChange={handleCampaignChange}
                    sx={{ borderRadius: '12px' }}
                  >
                    {campaignCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={campaignLoading}>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    name="urgency"
                    value={campaignFormData.urgency}
                    label="Urgency Level"
                    onChange={handleCampaignChange}
                    sx={{ borderRadius: '12px' }}
                  >
                    {urgencyLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location (Optional)"
                  name="location"
                  value={campaignFormData.location}
                  onChange={handleCampaignChange}
                  placeholder="e.g., Mumbai, India"
                  disabled={campaignLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: '#2563eb' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="End Date (Optional)"
                  name="endDate"
                  type="date"
                  value={campaignFormData.endDate}
                  onChange={handleCampaignChange}
                  disabled={campaignLoading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#2563eb' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCampaignClose}
              disabled={campaignLoading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 4,
                borderColor: '#e5e7eb',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#d1d5db',
                  background: '#f9fafb',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={campaignLoading}
              startIcon={
                campaignLoading ? <CircularProgress size={20} color="inherit" /> : <CampaignOutlined />
              }
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 4,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                }
              }}
            >
              {campaignLoading ? 'Creating Campaign...' : 'Create Campaign'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* SUCCESS SNACKBARS */}
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
          🎉 Thank you! Your donation was successful!
        </Alert>
      </Snackbar>

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
          Success! 🎉
        </Alert>
      </Snackbar>
    </>
  );
}

export default DonationPage;
