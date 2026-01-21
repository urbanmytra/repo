// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ 
        fontSize: 'clamp(4rem, 8vw, 8rem)', 
        fontWeight: '800',
        margin: '0',
        background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        404
      </h1>
      
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
        margin: '1rem 0',
        color: 'var(--text-strong)'
      }}>
        Page Not Found
      </h2>
      
      <p style={{ 
        color: 'var(--text-muted)', 
        marginBottom: '2rem',
        maxWidth: '400px',
        lineHeight: '1.6'
      }}>
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          to="/" 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FiHome />
          Go Home
        </Link>
        
        <button 
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FiArrowLeft />
          Go Back
        </button>
      </div>
    </div>
  );
}