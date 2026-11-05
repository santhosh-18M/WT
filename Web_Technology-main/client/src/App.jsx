import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import GovRoute from './components/GovRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GovLoginPage from './pages/GovLoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EditReportPage from './pages/EditReportPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import GovDashboardPage from './pages/GovDashboardPage.jsx';

const App = () => {
  return (
    <div className="appShellLayout">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gov-login" element={<GovLoginPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/gov"
          element={
            <GovRoute>
              <GovDashboardPage />
            </GovRoute>
          }
        />
        <Route
          path="/gov/:section"
          element={
            <GovRoute>
              <GovDashboardPage />
            </GovRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
