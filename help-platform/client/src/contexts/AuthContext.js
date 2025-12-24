import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔍 Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await getCurrentUser();
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Get current user (protected route)
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
      console.log('✅ User loaded:', response.data.user.email);
    } catch (error) {
      console.log('❌ Invalid token → Logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 LOGIN
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Logging in:', email);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      console.log('✅ Login success:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }, []);

  // 📝 REGISTER (send OTP only)
  const register = useCallback(async (name, email, password) => {
    try {
      console.log('📝 Registering:', email);
      const response = await authAPI.register({ name, email, password });
      
      console.log('✅ OTP sent to:', email);
      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Register failed:', error.response?.data?.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }, []);

  // ✅ VERIFY OTP (CRITICAL - missing from your code!)
  const verifyOtp = useCallback(async (email, otp) => {
    try {
      console.log('🔐 Verifying OTP for:', email);
      const response = await authAPI.verifyOtp({ email, otp });
      const { token, user } = response.data;

      // Auto-login after OTP verification
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      console.log('🎉 OTP verified + auto-login:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ OTP verification failed:', error.response?.data?.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid OTP'
      };
    }
  }, []);

  // 🚪 LOGOUT
  const logout = useCallback(() => {
    console.log('🚪 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 🔄 REFRESH TOKEN (future-proof)
  const refreshToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();
      const { token, user: refreshedUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(refreshedUser));
      setUser(refreshedUser);
      
      return { success: true };
    } catch (error) {
      logout();
      return { success: false };
    }
  }, [logout]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    verifyOtp,      // ✅ NEW!
    logout,
    getCurrentUser,
    refreshToken,   // ✅ NEW!
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
