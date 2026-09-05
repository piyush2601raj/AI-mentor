import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // =====================================================
            // FIXED ENDPOINT
            // Backend:
            // @RequestMapping("/api/auth")
            // @PostMapping("/register")
            //
            // Final URL:
            // http://localhost:8080/api/auth/register
            // =====================================================

            await api.post("/api/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setSuccess("Account created successfully!");

            // Small delay so user can see success message
            setTimeout(() => {
                navigate("/login", {
                    state: {
                        registered: true,
                        email: formData.email
                    }
                });
            }, 1000);

        } catch (err) {
            console.error("Registration error:", err);

            if (err.response) {
                if (err.response.status === 409) {
                    setError("An account with this email already exists.");
                } else if (err.response.data?.message) {
                    setError(err.response.data.message);
                } else if (err.response.status === 401) {
                    setError("Unauthorized request.");
                } else if (err.response.status === 404) {
                    setError("Registration endpoint not found.");
                } else {
                    setError("Registration failed. Please try again.");
                }
            } else {
                setError(
                    "Unable to connect to server. Please make sure backend is running."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* Background decoration */}
            <div className="register-bg-circle circle-one"></div>
            <div className="register-bg-circle circle-two"></div>

            <div className="register-container">

                {/* LEFT SIDE */}
                <div className="register-brand">

                    <div className="brand-logo">
                        <span>AI</span>
                    </div>

                    <h1>
                        Learn smarter.
                        <br />
                        Grow faster.
                    </h1>

                    <p>
                        Your personalized AI-powered learning companion
                        designed to help you build skills and achieve your goals.
                    </p>

                    <div className="brand-features">

                        <div className="brand-feature">
                            <div className="feature-icon">✓</div>
                            <div>
                                <strong>Personalized Learning</strong>
                                <span>Learning paths built around your goals</span>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <div className="feature-icon">✓</div>
                            <div>
                                <strong>Track Your Progress</strong>
                                <span>Monitor your roadmap and achievements</span>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <div className="feature-icon">✓</div>
                            <div>
                                <strong>AI Mentor</strong>
                                <span>Get intelligent guidance whenever you need</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="register-card">

                    <div className="register-header">

                        <div className="mobile-logo">
                            AI
                        </div>

                        <h2>Create your account</h2>

                        <p>
                            Start your personalized learning journey today.
                        </p>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="auth-alert auth-error">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="auth-alert auth-success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* NAME */}
                        <div className="form-group">
                            <label>Full Name</label>

                            <div className="input-wrapper">
                                <span className="input-icon name-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
                                        <path
                                            d="M5 20C5.7 16.6 8.1 14.5 12 14.5C15.9 14.5 18.3 16.6 19 20"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="form-group">
                            <label>Email Address</label>

                            <div className="input-wrapper">
                                <span className="input-icon email-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect
                                            x="3.5"
                                            y="5.5"
                                            width="17"
                                            height="13"
                                            rx="2.5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        />
                                        <path
                                            d="M5 7L12 12.5L19 7"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <span className="input-icon password-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect
                                            x="5"
                                            y="10"
                                            width="14"
                                            height="10"
                                            rx="2.2"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M8 10V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <circle cx="12" cy="15" r="1.2" fill="#ffffff" />
                                    </svg>
                                </span>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <small>
                                Use at least 6 characters.
                            </small>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="form-group">
                            <label>Confirm Password</label>

                            <div className="input-wrapper">
                                <span className="input-icon confirm-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect
                                            x="5"
                                            y="10"
                                            width="14"
                                            height="10"
                                            rx="2.2"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M8 10V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M9.5 15.2L11.2 16.8L14.8 13.2"
                                            stroke="#ffffff"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span>→</span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="login-link">
                        Already have an account?
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="register-footer">
                        By creating an account, you agree to our
                        <span> Terms of Service</span> and
                        <span> Privacy Policy</span>.
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Register;