import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GOOGLE OAUTH LOGIN
  // =====================================================
  // Sends the browser to Spring Security. Google then shows
  // its real account-selection/login screen.
 const OAUTH_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleGoogleLogin = () => {
    setError("");
    window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/google`;
  };

  const handleSocialLogin = (provider) => {
    setError("");
    window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`;
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // BACKEND LOGIN ENDPOINT
      // =================================================

     const response = await api.post(
    "/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      console.log("Login response:", response.data);

      // =================================================
      // JWT TOKEN
      // =================================================

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.jwt;

      if (!token) {
        throw new Error("JWT token was not received from server.");
      }

      localStorage.setItem("token", token);

      // =================================================
      // USER DATA
      // =================================================

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // =================================================
      // USER ID
      // =================================================

      if (response.data?.userId) {
        localStorage.setItem(
          "userId",
          String(response.data.userId)
        );
      }

      if (response.data?.id) {
        localStorage.setItem(
          "userId",
          String(response.data.id)
        );
      }

      // =================================================
      // NAME
      // =================================================

      if (response.data?.name) {
        localStorage.setItem(
          "name",
          response.data.name
        );
      }

      // =================================================
      // EMAIL
      // =================================================

      localStorage.setItem(
        "email",
        formData.email.trim()
      );

      // =================================================
      // ROLE
      // =================================================

      if (response.data?.role) {
        localStorage.setItem(
          "role",
          response.data.role
        );
      }

      // =================================================
      // REMEMBER ME
      // =================================================

      localStorage.setItem(
        "rememberMe",
        rememberMe ? "true" : "false"
      );

      // =================================================
      // GO TO DASHBOARD
      // =================================================

      navigate("/dashboard");

    } catch (err) {

      console.error("Login error:", err);

      if (err.response) {

        if (err.response.status === 401) {
          setError(
            "Invalid email or password."
          );

        } else if (err.response.status === 403) {
          setError(
            "You are not authorized to login."
          );

        } else if (err.response.status === 404) {
          setError(
            "Login endpoint not found. Please check the backend server."
          );

        } else {
          setError(
            err.response.data?.message ||
            "Login failed. Please try again."
          );
        }

      } else if (err.request) {

        setError(
          "Unable to connect to server. Please make sure the backend is running."
        );

      } else {

        setError(
          err.message ||
          "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =================================================
          LEFT BRAND PANEL
      ================================================= */}

      <section className="login-brand-panel">

        <div className="brand-content">

          {/* Logo */}

          <div className="brand-logo-row">

            <div className="brand-logo">
              AI
            </div>

            <div>
              <h2>AI Mentor</h2>
              <p>Learn • Grow • Succeed</p>
            </div>

          </div>


          {/* Welcome */}

          <div className="brand-welcome">

            <span className="welcome-badge">
              YOUR PERSONAL AI LEARNING COMPANION
            </span>

            <h1>
              Welcome
              <br />
              Back!
            </h1>

            <p className="brand-description">
              Continue your personalized learning journey
              and unlock your full potential with
              AI-powered guidance.
            </p>

          </div>


          {/* Features */}

          <div className="brand-features">

            <div className="brand-feature">

              <div className="feature-icon blue-icon">
                🎓
              </div>

              <div>
                <h3>Personalized Learning</h3>

                <p>
                  Custom roadmaps tailored to your goals
                </p>
              </div>

            </div>


            <div className="brand-feature">

              <div className="feature-icon purple-icon">
                📊
              </div>

              <div>
                <h3>Skill Advancement</h3>

                <p>
                  Track progress and improve continuously
                </p>
              </div>

            </div>


            <div className="brand-feature">

              <div className="feature-icon green-icon">
                💬
              </div>

              <div>
                <h3>AI-Powered Support</h3>

                <p>
                  Get instant help from your AI Mentor
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* Bottom decoration */}

        <div className="mountain-decoration">

          <div className="mountain mountain-one"></div>
          <div className="mountain mountain-two"></div>
          <div className="mountain mountain-three"></div>

          <div className="road-line"></div>

          <div className="flag">
            ⚑
          </div>

          <span className="star star-one">•</span>
          <span className="star star-two">•</span>
          <span className="star star-three">•</span>

        </div>

      </section>


      {/* =================================================
          RIGHT LOGIN SECTION
      ================================================= */}

      <section className="login-form-section">

        <div className="login-card">

          {/* Mobile logo */}

          <div className="mobile-brand">

            <div className="mobile-logo">
              AI
            </div>

            <h2>AI Mentor</h2>

          </div>


          {/* Card Header */}

          <div className="login-header">

            <div className="login-card-logo">
              AI
            </div>

            <h1>AI Mentor</h1>

            <p>
              Login to continue learning
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="login-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}


          {/* Form */}

          <form onSubmit={handleLogin}>

            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <div className="input-wrapper">

                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Zm2.1-.15 6.9 5.18 6.9-5.18H5.1Zm13.65 1.88-6.3 4.73a.75.75 0 0 1-.9 0l-6.3-4.73v8.77c0 .083.067.15.15.15h13.2a.15.15 0 0 0 .15-.15V8.48Z"/></svg>
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>


            {/* Password */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M7.5 10V7.75a4.5 4.5 0 1 1 9 0V10h.75A2.75 2.75 0 0 1 20 12.75v6.5A2.75 2.75 0 0 1 17.25 22h-10A2.75 2.75 0 0 1 4.5 19.25v-6.5A2.75 2.75 0 0 1 7.25 10h.25Zm1.5 0h6V7.75a3 3 0 1 0-6 0V10Zm-1.75 1.5a1.25 1.25 0 0 0-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25h-10Zm5 2.25a1.25 1.25 0 0 1 .75 2.25v1.25h-1.5V16a1.25 1.25 0 0 1 .75-2.25Z"/></svg>
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "◉" : "○"}
                </button>

              </div>

            </div>


            {/* Remember / Forgot */}

            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  navigate("/forgot-password")
                }
              >
                Forgot password?
              </button>

            </div>


            {/* Login Button */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* Divider */}

          <div className="login-divider">

            <span></span>

            <p>
              or continue with
            </p>

            <span></span>

          </div>


          {/* Social Buttons */}

          <div className="social-buttons">

            <button
              type="button"
              className="social-button google-social-button"
              onClick={handleGoogleLogin}
              aria-label="Continue with Google"
            >

              <span className="google-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" focusable="false">
                  <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z"/>
                  <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.37l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.28v2.52A9.74 9.74 0 0 0 12 21.5Z"/>
                  <path fill="#FBBC05" d="M6.53 13.57A5.86 5.86 0 0 1 6.22 12c0-.54.11-1.06.31-1.57V7.91H3.28A9.73 9.73 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.09l3.25-2.52Z"/>
                  <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.43 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.41l3.25 2.52C7.3 8.11 9.46 6.39 12 6.39Z"/>
                </svg>
              </span>

              <span>Continue with Google</span>

            </button>


            <button
              type="button"
              className="social-button"
              onClick={() => handleSocialLogin("github")}
            >

              <span className="github-icon">
                ●
              </span>

              GitHub

            </button>

          </div>


          {/* Register */}

          <div className="register-text">

            Don't have an account?

            <Link to="/register">
              Sign up
            </Link>

          </div>

        </div>


        {/* Footer */}

        <footer className="login-footer">

          <span>
            © 2026 AI Mentor
          </span>

          <span>•</span>

          <a href="#privacy">
            Privacy Policy
          </a>

          <span>•</span>

          <a href="#terms">
            Terms of Service
          </a>

          <span>•</span>

          <a href="#help">
            Help
          </a>

        </footer>

      </section>

    </div>
  );
};

export default Login;