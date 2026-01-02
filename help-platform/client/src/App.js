import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { RequestsProvider } from './components/requests/RequestContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RequestList from './components/requests/RequestList';
import CreateRequest from './components/requests/CreateRequest';
import MyRequests from './components/requests/Myrequests';
import HallOfFame from './components/hallOfFame/HallOfFame';
import HomePage from './components/home/HomePage';
import Leaderboard from './components/requests/LeaderBoard';
import DonationPage from './components/donation/Donation';
import VerifyOtp from './components/auth/VerifyOtp';

// REWARDS SYSTEM COMPONENTS
import RewardsPage from './components/rewards/RewardsPage';
import MyRedemptions from './components/rewards/MyRedemptions';

// Enhanced Professional Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 700, 
      fontSize: '2.5rem', 
      lineHeight: 1.2,
      letterSpacing: '-0.025em'
    },
    h2: { 
      fontWeight: 700, 
      fontSize: '2rem', 
      lineHeight: 1.3,
      letterSpacing: '-0.025em'
    },
    h3: { 
      fontWeight: 600, 
      fontSize: '1.75rem', 
      lineHeight: 1.3 
    },
    h4: { 
      fontWeight: 600, 
      fontSize: '1.5rem', 
      lineHeight: 1.4 
    },
    h5: { 
      fontWeight: 600, 
      fontSize: '1.25rem', 
      lineHeight: 1.4 
    },
    h6: { 
      fontWeight: 600, 
      fontSize: '1.125rem', 
      lineHeight: 1.4 
    },
    button: { 
      textTransform: 'none', 
      fontWeight: 600,
      letterSpacing: '0.025em'
    },
  },
  shape: { 
    borderRadius: 12 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          '&:hover': { 
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
  },
});

// Shared Layout Component for Protected Routes
const AppLayout = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    }}
  >
    <Header />
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
  </Box>
);

// Auth Layout Component
const AuthLayout = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RequestsProvider>
          <Router>
            <Routes>
              {/* ================================
                  PUBLIC ROUTES
              ================================ */}
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Public Home Page */}
              <Route path="/home" element={<HomePage />} />
              
              {/* Authentication Routes */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                }
              />

              {/* ================================
                  PROTECTED ROUTES
              ================================ */}

              {/* Dashboard - Main Requests View */}
              <Route path="/verify-otp" element={<VerifyOtp />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RequestList />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Request Management */}
              <Route
                path="/create-request"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CreateRequest />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyRequests />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* REWARDS SYSTEM - Professional Integration */}
              <Route
                path="/rewards"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RewardsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-redemptions"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyRedemptions />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Donation System */}
              <Route
                path="/donate"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DonationPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Community Features */}
              <Route
                path="/hall-of-fame"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HallOfFame />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Leaderboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Router>
        </RequestsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
