import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/Auth/Login';

// Pages
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Services from './pages/Services';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Styles
import './styles/global.css';
import styles from './styles/AdminApp.module.css';

function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <div className={styles.adminApp}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AdminApp;