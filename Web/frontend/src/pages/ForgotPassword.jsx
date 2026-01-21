// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, apiUtils } from "../config/api";
import s from "../assets/css/pages/Login.module.css";
import { FiMail, FiArrowLeft } from "react-icons/fi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await authAPI.forgotPassword(email);
      setMessage("Password reset instructions have been sent to your email");
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <div className={s.container}>
        <div className={s.loginCard}>
          <div className={s.header}>
            <button className={s.backBtn} onClick={() => navigate(-1)}>
              <FiArrowLeft />
            </button>
            <div className={s.logo}>
              <h1>Bagajatin</h1>
            </div>
          </div>

          <div className={s.content}>
            <div className={s.welcome}>
              <h2>Forgot Password?</h2>
              <p>
                Enter your email address and we'll send you a link to reset your
                password
              </p>
            </div>

            <form className={s.form} onSubmit={handleSubmit}>
              {error && <div className={s.errorAlert}>{error}</div>}

              {message && <div className={s.successAlert}>{message}</div>}

              <div className={s.formGroup}>
                <label className={s.label}>Email Address</label>
                <div className={s.inputWrapper}>
                  <FiMail className={s.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={s.input}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className={s.submitBtn} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className={s.signup}>
              <p>
                Remember your password? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
        <div className={s.sidePanel}>
          <div className={s.sidePanelContent}>
            <h3>Join Bagajatin Today</h3>
            <p>
              Access thousands of professional home services at your fingertips
            </p>
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
