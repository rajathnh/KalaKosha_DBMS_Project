// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axios';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true to check for an active session

  // Check for an active session when the app first loads
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data.user);
      } catch (error) {
        // This is expected if the user is not logged in
        setUser(null);
      } finally {
        // This is crucial to prevent protected routes from redirecting prematurely
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []); 

  // --- AUTHENTICATION FUNCTIONS ---

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setUser(response.data.user);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw the error so the component can catch it and show a message
    }
  };

  // NEW UNIFIED REGISTER FUNCTION
  const register = async (userData) => {
    try {
      // Calls the single, unified backend endpoint
      const response = await apiClient.post('/auth/register', userData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-throw for the component
    }
  };

  const logout = async () => {
    try {
      await apiClient.get('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // We don't need to throw here, as logout should always succeed on the client-side
    }
  };

  // The value object provided to consuming components
  const value = { 
    user, 
    loading, 
    login, 
    register, // The new single register function
    logout 
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};