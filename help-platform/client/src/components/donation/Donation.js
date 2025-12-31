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
  const canPost = user?.role === 'admin';  // ✅ Fixed!
// Load Razorpay script

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
      setGoodDeeds([]);
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

  // ✅ CRITICAL FIX: Campaign donation payment handler
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
            const verifyData = await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: orderData.data.transactionId
            });
            
            if (verifyData.success) {
              console.log('✅ Campaign donation verified successfully');
              
              // ✅ CRITICAL FIX: Update campaign directly from backend response
              if (verifyData.data.updatedCampaign) {
                console.log('📊 Updating campaign with fresh data from backend');
                setCampaigns(prevCampaigns => 
                  prevCampaigns.map(c => 
                    c._id === verifyData.data.updatedCampaign._id 
                      ? { ...c, ...verifyData.data.updatedCampaign }
                      : c
                  )
                );
              }
              
              // ✅ Add small delay then refresh all data
              await new Promise(resolve => setTimeout(resolve, 1000));
              
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

  // ✅ CRITICAL FIX: General donation payment handler
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
            const verifyData = await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: orderData.data.transactionId
            });
            
            if (verifyData.success) {
              console.log('✅ General donation verified successfully');
              
              // ✅ Add delay then refresh stats
              await new Promise(resolve => setTimeout(resolve, 1000));
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
        await Promise.all([
          fetchCampaigns(),
          fetchCampaignStats()
        ]);
        
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

  const handleNavigation = (path) => {
    navigate(path);
  };

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

            {canPost && (
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

          {/* Hero Section */}
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

          {/* Community Impact Tracker */}
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

              {canPost && (
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

          {/* Active Campaigns Section */}
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
                              {!user ? 'Login to Donate' : campaign.status !== 'active' ? 'Campaign Ended' : 'Donate Now'}
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

          {/* General Donation Section */}
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
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover:before': {
                        transform: 'translateX(0)',
                      },
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
                  },
                  '& .Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
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

          {/* Impact Stories Section */}
          {goodDeeds.length > 0 ? (
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
                          '&:before': {
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

                          {(story.likes > 0 || story.views > 0) && (
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
                                    {story.views} views
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
                                {story.beneficiaries || 0}+
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
          ) : (
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
      </Box>

      {/* CAMPAIGN DONATION DIALOG */}
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
            background: selectedCampaign ? 
              `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #3b82f6)` : 
              'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            py: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            '&:after': {
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
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
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
                  background: selectedCampaign ? 
                    `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #3b82f6)` : 
                    'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  py: 2,
                  borderRadius: '16px',
                  textTransform: 'none',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    background: selectedCampaign ? 
                      `linear-gradient(135deg, ${categoryColor(selectedCampaign.category)}, #2563eb)` : 
                      'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
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

      {/* GENERAL PAYMENT DIALOG */}
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
            '&:after': {
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
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
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
                    '&:hover fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                  '& .Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
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
                    '&:hover fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                  '& .Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
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
                    '&:hover fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                  '& .Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
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
            startIcon={paymentLoading ? <CircularProgress size={20} color="inherit" /> : <Security />}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              py: 2,
              borderRadius: '16px',
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
            {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <Box mt={3} textAlign="center">
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              🔒 Secure payment powered by Razorpay
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* CREATE CAMPAIGN DIALOG */}
      <Dialog
        open={campaignDialogOpen}
        onClose={handleCampaignClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            py: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
                <CampaignOutlined />
              </Avatar>
              <Typography variant="h6" fontWeight="700">
                Create New Campaign
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCampaignClose}
              disabled={campaignLoading}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleCampaignSubmit}>
          <DialogContent sx={{ p: 4 }}>
            {campaignError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                        <CurrencyRupee />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={campaignFormData.category}
                    onChange={handleCampaignChange}
                    label="Category"
                    disabled={campaignLoading}
                    sx={{ borderRadius: '12px' }}
                  >
                    {campaignCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    name="urgency"
                    value={campaignFormData.urgency}
                    onChange={handleCampaignChange}
                    label="Urgency Level"
                    disabled={campaignLoading}
                    sx={{ borderRadius: '12px' }}
                  >
                    {urgencyLevels.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={campaignFormData.location}
                  onChange={handleCampaignChange}
                  placeholder="City, State"
                  disabled={campaignLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={campaignFormData.endDate}
                  onChange={handleCampaignChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={campaignLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button 
              onClick={handleCampaignClose}
              disabled={campaignLoading}
              sx={{ borderRadius: '12px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={campaignLoading}
              startIcon={campaignLoading ? <CircularProgress size={20} /> : <Add />}
              sx={{
                borderRadius: '12px',
                px: 4,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                },
              }}
            >
              {campaignLoading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* POST DIALOG */}
      <Dialog
        open={postDialogOpen}
        onClose={() => handlePostDialogClose(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            py: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
                <AutoAwesome />
              </Avatar>
              <Typography variant="h6" fontWeight="700">
                Share Your Impact Story
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handlePostDialogClose(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Story Title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Give your story a compelling title"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  label="Category"
                  sx={{ borderRadius: '12px' }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author Name (Optional)"
                value={newPostAuthor}
                onChange={(e) => setNewPostAuthor(e.target.value)}
                placeholder={user?.name || 'Your name'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Your Story"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share the details of your impact story, the challenges you faced, and the positive change you created..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Funds Utilized (₹)"
                value={newPostAmount}
                onChange={(e) => setNewPostAmount(e.target.value)}
                placeholder="10000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupee />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Lives Impacted"
                value={newPostBeneficiaries}
                onChange={(e) => setNewPostBeneficiaries(e.target.value)}
                placeholder="50"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button 
            onClick={() => handlePostDialogClose(false)}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handlePostDialogClose(true)}
            startIcon={<Send />}
            sx={{
              borderRadius: '12px',
              px: 4,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              },
            }}
          >
            Publish Story
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteCampaign}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px' }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
              <Warning />
            </Avatar>
            <Typography variant="h6" fontWeight="700">
              Delete Campaign?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
            Are you sure you want to delete the campaign <strong>"{campaignToDelete?.title}"</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: '12px' }}>
            This action cannot be undone. All campaign data will be permanently removed.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={cancelDeleteCampaign}
            disabled={deleteLoading}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteCampaign}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{ borderRadius: '12px' }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ 
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
            fontWeight: 600
          }}
        >
          🎉 Thank you for your generous donation! Your contribution will make a real difference.
        </Alert>
      </Snackbar>

      <Snackbar
        open={postSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setPostSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setPostSuccessSnackbar(false)} 
          severity="success"
          sx={{ 
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
            fontWeight: 600
          }}
        >
          ✅ Success! Your contribution has been recorded.
        </Alert>
      </Snackbar>

            <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* ✅ FOOTER COMPONENT */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
          color: 'white',
          mt: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Main Footer Content */}
        <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <Heart sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 800,
                      color: 'white',
                    }}
                  >
                    Help<span style={{ color: '#64b5f6' }}>Hub</span>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  Connecting communities through compassion. HelpHub makes it easy to find help when you need it and offer help when you can.
                </Typography>
                
                {/* Social Media Icons */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      color: 'white',
                      mb: 2,
                    }}
                  >
                    Follow Us
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton
                      href="https://facebook.com/helphub"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Facebook fontSize="small" />
                    </IconButton>
                    <IconButton
                      href="https://twitter.com/helphub"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Twitter fontSize="small" />
                    </IconButton>
                    <IconButton
                      href="https://linkedin.com/company/helphub"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <LinkedIn fontSize="small" />
                    </IconButton>
                    <IconButton
                      href="https://instagram.com/helphub"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Instagram fontSize="small" />
                    </IconButton>
                    <IconButton
                      href="https://github.com/helphub"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <GitHub fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Quick Links
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Group sx={{ color: '#64b5f6', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dashboard"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/donate')}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <VolunteerActivism sx={{ color: '#64b5f6', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Donate"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/hall-of-fame')}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmojiEvents sx={{ color: '#64b5f6', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hall of Fame"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Support */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Support
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/help')}
                >
                  <ListItemText
                    primary="Help Center"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/support')}
                >
                  <ListItemText
                    primary="Contact Support"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/guidelines')}
                >
                  <ListItemText
                    primary="Community Guidelines"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Contact & Legal */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Contact & Legal
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Email sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    support@helphub.com
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Phone sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    1-800-HELP-HUB
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={3}>
                  <LocationOn sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>

              {/* Legal Links */}
              <List sx={{ p: 0 }}>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/privacy')}
                >
                  <ListItemText
                    primary="Privacy Policy"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation('/terms')}
                >
                  <ListItemText
                    primary="Terms of Service"
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Container>

        {/* Bottom Bar */}
        <Box
          sx={{
            background: 'rgba(0, 0, 0, 0.2)',
            py: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Container maxWidth="lg">
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  © 2025 HelpHub. All rights reserved. Built with ❤️ for communities worldwide.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent={{ xs: 'center', md: 'flex-end' }}
                  mt={{ xs: 2, md: 0 }}
                >
                  <Security sx={{ color: '#64b5f6', fontSize: 16, mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Trusted • Secure • Community-Driven
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default DonationPage;
