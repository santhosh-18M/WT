import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser, getToken } from '../utils/api';

const GovRoute = ({ children }) => {
  const token = getToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'gov') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GovRoute;
