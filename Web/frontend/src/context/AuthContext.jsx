// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // src/context/AuthContext.jsx - Update the checkAuth method
const checkAuth = async () => {
  try {
    if (tokenManager.isAuthenticated()) {
      try {
        const response = await authAPI.getMe();
        if (response.data && response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
        } else {
          // Invalid response format
          tokenManager.removeToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        tokenManager.removeToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  } catch (error) {
    console.error('Auth check error:', error);
    setIsAuthenticated(false);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  const login = async (credentials, remember = false) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, data } = response.data;
      
      tokenManager.setToken(token, remember);
      setUser(data);
      setIsAuthenticated(true);
      
      return { success: true, user: data };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // src/context/AuthContext.jsx - Update the register method

const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    const data = response.data;
    
    if (data.success) {
      return { success: true, data: data.data, message: data.message };
    } else {
      return { 
        success: false, 
        message: data.message || 'Registration failed'
      };
    }
  } catch (error) {
    console.error('Registration failed:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
};

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.data);
      return { success: true, user: response.data.data };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};