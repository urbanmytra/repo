// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI, apiUtils } from '../config/api';
import s from '../assets/css/pages/Login.module.css';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      setErrors({});
      
      await authAPI.resetPassword(token, formData.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please log in with your new password.' }
        });
      }, 3000);
      
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      if (errorResult.status === 400) {
        setTokenValid(false);
      } else {
        setErrors({ submit: errorResult.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=```math```{};':"\\|,.<>\/?]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#eab308';
      case 4: return '#22c55e';
      case 5: return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  if (!tokenValid) {
    return (
      <div className={s.loginPage}>
        <div className={s.container}>
          <div className={s.loginCard}>
            <div className={s.header}>
              <button 
                className={s.backBtn}
                onClick={() => navigate('/login')}
              >
                <FiArrowLeft />
              </button>
              <div className={s.logo}>
                <h1>Urban Mytra</h1>
              </div>
            </div>

            <div className={s.content}>
              <div className={s.welcome}>
                <h2>Invalid Reset Link</h2>
                <p>This password reset link is invalid or has expired</p>
              </div>

              <div className={s.errorAlert}>
                The password reset link you clicked is either invalid or has expired. 
                Please request a new password reset link.
              </div>

              <Link to="/forgot-password" className={s.submitBtn} style={{textAlign: 'center'}}>
                Request New Reset Link
              </Link>

              <div className={s.signup}>
                <p>Remember your password? <Link to="/login">Sign In</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={s.loginPage}>
        <div className={s.container}>
          <div className={s.loginCard}>
            <div className={s.content}>
              <div className={s.welcome} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, var(--success), var(--success-hover))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '40px'
                }}>
                  <FiCheckCircle />
                </div>
                <h2>Password Reset Successful!</h2>
                <p>Your password has been reset successfully. You will be redirected to the login page shortly.</p>
              </div>

              <div className={s.successAlert}>
                Redirecting to login page in 3 seconds...
              </div>

              <Link to="/login" className={s.submitBtn} style={{textAlign: 'center'}}>
                Go to Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={s.loginPage}>
      <div className={s.container}>
        <div className={s.loginCard}>
          <div className={s.header}>
            <button 
              className={s.backBtn}
              onClick={() => navigate('/login')}
            >
              <FiArrowLeft />
            </button>
            <div className={s.logo}>
              <h1>Urban Mytra</h1>
            </div>
          </div>

          <div className={s.content}>
            <div className={s.welcome}>
              <h2>Reset Your Password</h2>
              <p>Enter your new password below</p>
            </div>

            <form className={s.form} onSubmit={handleSubmit}>
              {errors.submit && (
                <div className={s.errorAlert}>
                  {errors.submit}
                </div>
              )}

              <div className={s.formGroup}>
                <label className={s.label}>New Password</label>
                <div className={s.inputWrapper}>
                  <FiLock className={s.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${s.input} ${errors.password ? s.error : ''}`}
                    placeholder="Enter your new password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className={s.passwordStrength}>
                    <div className={s.strengthBar}>
                      <div 
                        className={s.strengthFill}
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: getStrengthColor(passwordStrength)
                        }}
                      />
                    </div>
                    <span 
                      className={s.strengthText}
                      style={{ color: getStrengthColor(passwordStrength) }}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                )}
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Confirm New Password</label>
                <div className={s.inputWrapper}>
                  <FiLock className={s.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${s.input} ${errors.confirmPassword ? s.error : ''}`}
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={s.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className={s.errorText}>{errors.confirmPassword}</span>}
              </div>

              {/* Password Requirements */}
              <div className={s.passwordRequirements}>
                <p className={s.requirementsTitle}>Password must contain:</p>
                <ul className={s.requirementsList}>
                  <li className={formData.password.length >= 6 ? s.valid : s.invalid}>
                    At least 6 characters
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? s.valid : s.invalid}>
                    One lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? s.valid : s.invalid}>
                    One uppercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? s.valid : s.invalid}>
                    One number
                  </li>
                </ul>
              </div>

              <button 
                type="submit" 
                className={s.submitBtn}
                disabled={loading || passwordStrength < 3}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className={s.signup}>
              <p>Remember your password? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>

        <div className={s.sidePanel}>
          <div className={s.sidePanelContent}>
            <h3>Secure Password Reset</h3>
            <p>Your security is our priority. Create a strong password to protect your account.</p>
            <ul className={s.features}>
              <li>✓ Secure password encryption</li>
              <li>✓ Account protection</li>
              <li>✓ Safe and reliable</li>
              <li>✓ Instant access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}