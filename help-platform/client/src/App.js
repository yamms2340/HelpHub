import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute'; // Add this import
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RequestList from './components/requests/RequestList';
import CreateRequest from './components/requests/CreateRequest';
import HallOfFame from './components/hallOfFame/HallOfFame';
import HomePage from './components/home/HomePage'; // Add this import

// Enhanced theme with modern design
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f86ff',
      light: '#7ba3ff',
      dark: '#3b82f6',
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
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
        contained: {
          background: '#4f86ff',
          '&:hover': {
            background: '#3b82f6',
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
          '&:hover': {
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#4f86ff',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

// ... your existing theme code ...

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public home page - NO header, NO background wrapper */}
                      <Route path="/" element={<Navigate to="/home" replace />} />

            <Route path="/home" element={<HomePage />} />
            
            {/* Public auth routes - NO header, simple wrapper */}
            <Route 
              path="/login" 
              element={
                <Box sx={{ 
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                }}>
                  <Login />
                </Box>
              } 
            />
            <Route 
              path="/register" 
              element={
                <Box sx={{ 
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                }}>
                  <Register />
                </Box>
              } 
            />
            
            {/* Protected routes - WITH header and background */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      <RequestList />
                    </Box>
                  </Box>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hall-of-fame" 
              element={
                <ProtectedRoute>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      <HallOfFame />
                    </Box>
                  </Box>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-request" 
              element={
                <ProtectedRoute>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      <CreateRequest />
                    </Box>
                  </Box>
                </ProtectedRoute>
              } 
            />



            
            {/* Redirect unknown routes to home */}

            
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
