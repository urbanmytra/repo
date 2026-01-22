// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from '../assets/css/pages/Login.module.css';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get return URL from query params
  const returnUrl = new URLSearchParams(location.search).get('return') || '/';

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const result = await login({
        email: formData.email,
        password: formData.password
      }, formData.remember);
      
      if (result.success) {
        navigate(returnUrl);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <div className={s.container}>
        <div className={s.loginCard}>
          <div className={s.header}>
            <button 
              className={s.backBtn}
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft />
            </button>
            <div className={s.logo}>
              <h1>Urban Mytra</h1>
            </div>
          </div>

          <div className={s.content}>
            <div className={s.welcome}>
              <h2>Welcome Back</h2>
              <p>Sign in to continue to your account</p>
            </div>

            <form className={s.form} onSubmit={handleSubmit}>
              {errors.submit && (
                <div className={s.errorAlert}>
                  {errors.submit}
                </div>
              )}

              <div className={s.formGroup}>
                <label className={s.label}>Email Address</label>
                <div className={s.inputWrapper}>
                  <FiMail className={s.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${s.input} ${errors.email ? s.error : ''}`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className={s.errorText}>{errors.email}</span>}
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Password</label>
                <div className={s.inputWrapper}>
                  <FiLock className={s.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${s.input} ${errors.password ? s.error : ''}`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={s.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className={s.errorText}>{errors.password}</span>}
              </div>

              <div className={s.formOptions}>
                <label className={s.checkbox}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span className={s.checkmark}></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className={s.forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className={s.submitBtn}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className={s.divider}>
              <span>or</span>
            </div>

            <div className={s.signup}>
              <p>Don't have an account? <Link to={`/register${location.search}`}>Sign Up</Link></p>
            </div>
          </div>
        </div>

        <div className={s.sidePanel}>
          <div className={s.sidePanelContent}>
            <h3>Join Urban Mytra Today</h3>
            <p>Access thousands of professional home services at your fingertips</p>
            <ul className={s.features}>
              <li>✓ Verified professionals</li>
              <li>✓ Instant booking</li>
              <li>✓ Secure payments</li>
              <li>✓ 24/7 support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}