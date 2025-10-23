import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.user);
        } catch (error) {
          // Token invalid, clear storage
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (access, refresh, userData) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isCustomer = () => {
    return user?.role === 'customer';
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    isAdmin,
    isCustomer,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};