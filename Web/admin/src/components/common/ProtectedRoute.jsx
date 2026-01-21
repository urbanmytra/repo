import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import styles from '../../styles/common/ProtectedRoute.module.css';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}