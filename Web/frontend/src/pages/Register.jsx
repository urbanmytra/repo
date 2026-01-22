// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from '../assets/css/pages/Register.module.css';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { authAPI, apiUtils } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const returnUrl = new URLSearchParams(location.search).get('return') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.address.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    const errorKey = name.startsWith('address.') ? name.split('.')[1] : name;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

 // src/pages/Register.jsx - Update the handleSubmit function

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  try {
    setLoading(true);
    setErrors({});
    
    // Format the data properly
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.replace(/\s/g, ''),
      password: formData.password,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.zipCode.trim()
      }
    };
    
    console.log('Sending registration data:', userData);
    
    const response = await authAPI.register(userData);
    const result = apiUtils.formatResponse(response);
    
    if (result.success) {
      // Show success message and redirect to login
      alert('Registration successful!.');
      navigate(`/login${location.search}`);
    } else {
      setErrors({ submit: result.message || 'Registration failed. Please try again.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setErrors({ submit: errorMessage });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={s.registerPage}>
      <div className={s.container}>
        <div className={s.registerCard}>
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
              <h2>Create Account</h2>
              <p>Join Urban Mytra to access professional home services</p>
            </div>

            <form className={s.form} onSubmit={handleSubmit}>
              {errors.submit && (
                <div className={s.errorAlert}>
                  {errors.submit}
                </div>
              )}

              {/* Personal Information */}
              <div className={s.section}>
                <h3 className={s.sectionTitle}>Personal Information</h3>
                
                <div className={s.formGroup}>
                  <label className={s.label}>Full Name</label>
                  <div className={s.inputWrapper}>
                    <FiUser className={s.inputIcon} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${s.input} ${errors.name ? s.error : ''}`}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && <span className={s.errorText}>{errors.name}</span>}
                </div>

                <div className={s.formRow}>
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
                    <label className={s.label}>Phone Number</label>
                    <div className={s.inputWrapper}>
                      <FiPhone className={s.inputIcon} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${s.input} ${errors.phone ? s.error : ''}`}
                        placeholder="Enter your phone number"
                        disabled={loading}
                      />
                    </div>
                    {errors.phone && <span className={s.errorText}>{errors.phone}</span>}
                  </div>
                </div>

                <div className={s.formRow}>
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
                        placeholder="Create a password"
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

                  <div className={s.formGroup}>
                    <label className={s.label}>Confirm Password</label>
                    <div className={s.inputWrapper}>
                      <FiLock className={s.inputIcon} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${s.input} ${errors.confirmPassword ? s.error : ''}`}
                        placeholder="Confirm your password"
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
                </div>
              </div>

              {/* Address Information */}
              <div className={s.section}>
                <h3 className={s.sectionTitle}>Address Information</h3>
                
                <div className={s.formGroup}>
                  <label className={s.label}>Street Address</label>
                  <div className={s.inputWrapper}>
                    <FiMapPin className={s.inputIcon} />
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className={`${s.input} ${errors.street ? s.error : ''}`}
                      placeholder="Enter your street address"
                      disabled={loading}
                    />
                  </div>
                  {errors.street && <span className={s.errorText}>{errors.street}</span>}
                </div>

                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.label}>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className={`${s.input} ${errors.city ? s.error : ''}`}
                      placeholder="Enter your city"
                      disabled={loading}
                    />
                    {errors.city && <span className={s.errorText}>{errors.city}</span>}
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={`${s.input} ${errors.state ? s.error : ''}`}
                      placeholder="Enter your state"
                      disabled={loading}
                    />
                    {errors.state && <span className={s.errorText}>{errors.state}</span>}
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>ZIP Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={`${s.input} ${errors.zipCode ? s.error : ''}`}
                      placeholder="Enter ZIP code"
                      disabled={loading}
                    />
                    {errors.zipCode && <span className={s.errorText}>{errors.zipCode}</span>}
                  </div>
                </div>
              </div>

              <div className={s.formGroup}>
                <label className={s.checkbox}>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span className={s.checkmark}></span>
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
                {errors.agreeToTerms && <span className={s.errorText}>{errors.agreeToTerms}</span>}
              </div>

              <button 
                type="submit" 
                className={s.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className={s.signin}>
              <p>Already have an account? <Link to={`/login${location.search}`}>Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}