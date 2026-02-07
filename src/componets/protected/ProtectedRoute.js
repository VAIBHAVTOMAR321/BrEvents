// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Simple authentication check using localStorage
  const isAuthenticated = () => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth !== null;
  };

  if (!isAuthenticated()) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
