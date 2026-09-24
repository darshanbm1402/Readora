import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import API from "../services/api";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!formData.terms) {
      setError("Please accept the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess(
          response.data.message ||
            "Account created successfully. Please verify your email."
        );

        navigate("/verify-otp", {
          state: {
            email: formData.email.trim(),
          },
        });
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Left Branding Section */}
      <div className="signup-brand">
        <div className="signup-brand-content">
          <div className="signup-brand-logo">
            <BookOpen size={30} strokeWidth={2.3} />
          </div>

          <h1>Readora</h1>

          <p className="signup-brand-tagline">
            Create your account and experience a smarter, simpler way to
            manage your library.
          </p>

          <div className="signup-brand-feature">
            <ShieldCheck size={21} />
            <span>Secure &amp; convenient library access</span>
          </div>
        </div>
      </div>

      {/* Signup Section */}
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <span className="signup-label">GET STARTED</span>

            <h2>Create your Readora account</h2>

            <p>
              Fill in your details to create your library account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Error Message */}
            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="signup-success">
                {success}
              </div>
            )}

            {/* Name */}
            <div className="signup-form-group">
              <label htmlFor="name">Full Name</label>

              <div className="signup-input-wrapper">
                <User size={19} className="signup-input-icon" />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="signup-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="signup-input-wrapper">
                <Mail size={19} className="signup-input-icon" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="signup-form-group">
              <label htmlFor="password">Password</label>

              <div className="signup-input-wrapper">
                <Lock size={19} className="signup-input-icon" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="signup-form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="signup-input-wrapper">
                <Lock size={19} className="signup-input-icon" />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Account Type */}
            <div className="signup-form-group">
              <label htmlFor="role">Account Type</label>

              <select id="role" name="role" value="student" disabled>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Terms */}
            <label className="signup-terms">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <span>
                I agree to the Readora terms and conditions.
              </span>
            </label>

            {/* Signup Button */}
            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}

              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="signup-divider">
            <span>OR</span>
          </div>

          <div className="login-prompt">
            <span>Already have an account?</span>

            <Link to="/login">Login</Link>
          </div>

          <Link to="/" className="signup-back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
