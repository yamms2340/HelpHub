// src/components/donation/Donation.js
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function DonationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openPayment, setOpenPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [totalCollected, setTotalCollected] = useState(156750);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const target = 500000;

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const progressPct = (totalCollected / target) * 100;

  const goodDeeds = [
    {
      id: 1,
      title: 'Emergency Medical Support for Families',
      category: 'Healthcare',
      icon: <LocalHospital sx={{ color: '#dc2626' }} />,
      beneficiaries: 45,
      amount: 25000,
      date: '2025-08-20',
      details: 'Covered ambulance services, emergency medicines, and hospital fees for families who could not afford treatment.',
    },
    {
      id: 2,
      title: 'Education Scholarship Program',
      category: 'Education',
      icon: <School sx={{ color: '#4f86ff' }} />,
      beneficiaries: 30,
      amount: 18500,
      date: '2025-08-15',
      details: 'Funded school fees, textbooks, uniforms, and stationery for an entire academic year.',
    },
    {
      id: 3,
      title: 'Food Distribution Drive',
      category: 'Food & Nutrition',
      icon: <Restaurant sx={{ color: '#f59e0b' }} />,
      beneficiaries: 85,
      amount: 12750,
      date: '2025-08-10',
      details: 'Provided 500+ nutritious meal kits including rice, lentils, and cooking oil to homeless individuals and struggling families.',
    },
    {
      id: 4,
      title: 'Housing Support Initiative',
      category: 'Housing',
      icon: <HomeIcon sx={{ color: '#10b981' }} />,
      beneficiaries: 12,
      amount: 31000,
      date: '2025-08-05',
      details: 'Repaired roofs, fixed plumbing, and improved sanitation facilities for low-income households.',
    },
    {
      id: 5,
      title: 'Environmental Cleanup Project',
      category: 'Environment',
      icon: <Park sx={{ color: '#059669' }} />,
      beneficiaries: 200,
      amount: 8200,
      date: '2025-07-28',
      details: 'Removed plastic waste, planted 50 trees, and installed trash bins in three community parks.',
    },
    {
      id: 6,
      title: 'Women Empowerment Workshop',
      category: 'Empowerment',
      icon: <Group sx={{ color: '#7c3aed' }} />,
      beneficiaries: 25,
      amount: 15300,
      date: '2025-07-20',
      details: 'Provided sewing-machine training, business-planning workshops, and seed funding for micro-enterprises.',
    },
  ];

  const categoryColor = (cat) =>
    ({
      Healthcare: '#dc2626',
      Education: '#4f86ff',
      'Food & Nutrition': '#f59e0b',
      Housing: '#10b981',
      Environment: '#059669',
      Empowerment: '#7c3aed',
    }[cat] || '#64748b');

  const openDialogWith = (amt) => {
    setSelectedAmount(amt);
    setOpenPayment(true);
  };

  const handleCustomDonate = () => {
    if (+customAmount > 0) openDialogWith(+customAmount);
  };

  const onPaymentComplete = (amt) => {
    setTotalCollected((prev) => prev + amt);
    setPaymentComplete(true);
    setSnackbarOpen(true);
    setTimeout(() => setPaymentComplete(false), 5000);
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link
              component="button"
              variant="body2"
              onClick={() => handleBreadcrumbClick('/dashboard')}
              sx={{ 
                textDecoration: 'none', 
                color: '#64748b',
                '&:hover': { color: '#4f86ff' }
              }}
            >
              Dashboard
            </Link>
            <Typography variant="body2" color="primary" fontWeight={600}>
              Donate
            </Typography>
          </Breadcrumbs>
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

        {/* Progress */}
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
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                🎯 Current Campaign Progress
              </Typography>

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

              <Typography variant="body2" color="#64748b">
                {Math.round(progressPct)} % completed • {Math.round((target - totalCollected) / 1000)} k remaining
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="#10b981">
                {goodDeeds.reduce((s, d) => s + d.beneficiaries, 0)}+
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

        {/* Impact Cards */}
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
                        {d.icon}
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
                      </Box>
                      <Chip
                        icon={<CheckCircle />}
                        label="Completed"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Typography variant="body2" color="#64748b" mb={2}>
                      {d.details}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color={categoryColor(d.category)}>
                          ₹{d.amount.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          Amount Used
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight="bold" color="#10b981">
                          {d.beneficiaries}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          People Helped
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="#64748b">
                      Completed on{' '}
                      {new Date(d.date).toLocaleDateString('en-IN', {
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

        {/* Payment Dialog */}
        <PaymentDialog
          open={openPayment}
          amount={selectedAmount}
          onClose={() => setOpenPayment(false)}
          onPaymentComplete={onPaymentComplete}
        />

        {/* Success Snackbar */}
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
    if (step === 1 && count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (step === 1 && count === 0) simulateSuccess();
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

// Make sure this export is present
export default DonationPage;
