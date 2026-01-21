// components/Auth/AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthNavigationHandler = ({ onAuthExpired }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthExpired = () => {
      onAuthExpired();
      // Add a small delay to prevent multiple redirects
      setTimeout(() => {
        if (!location.pathname.includes('/login')) {
          navigate('/login', { replace: true });
        }
      }, 100);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate, location.pathname, onAuthExpired]);

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleAuthExpired = () => {
    console.log('Auth expired, clearing user data');
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const userData = localStorage.getItem('admin_user');
      
      if (!token || !userData) {
        console.log('No token or user data found');
        setLoading(false);
        return;
      }

      // First validate the token with the server BEFORE setting user
      try {
        console.log('Validating token with server...');
        const response = await authAPI.getProfile();
        
        if (response.success) {
          console.log('Token valid, setting user');
          setUser(response.data);
          // Update localStorage with fresh user data
          localStorage.setItem('admin_user', JSON.stringify(response.data));
        } else {
          console.log('Token validation failed');
          throw new Error('Token validation failed');
        }
      } catch (tokenError) {
        console.error('Token validation error:', tokenError);
        // Token is invalid, clear everything
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear auth data on any error
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        console.log('Login successful');
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      // Try to call logout API, but don't block on it
      await authAPI.logout().catch(err => console.log('Logout API call failed:', err));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('admin_user', JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    changePassword,
    loading,
    isAuthenticated: !!user,
    checkAuthStatus // Expose this for manual refresh
  };

  return (
    <AuthContext.Provider value={value}>
      <AuthNavigationHandler onAuthExpired={handleAuthExpired} />
      {children}
    </AuthContext.Provider>
  );
};