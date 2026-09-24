import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle,
  Loader2,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Send password reset OTP
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/forgot-password", {
        email,
      });

      setSuccess(
        response.data.message ||
          "Password reset OTP has been sent to your email."
      );

      setMode("reset");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send password reset OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setSuccess(
        response.data.message ||
          "Password reset successfully."
      );

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared branding section
  const BrandingPanel = () => (
    <div className="login-brand">
      <div className="login-brand-content">
        <div className="login-brand-logo">
          <BookOpen size={32} strokeWidth={2.2} />
        </div>

        <h1>Readora</h1>

        <p className="login-brand-tagline">
          Your smarter, simpler way to access and manage
          your library.
        </p>

        <div className="login-brand-feature">
          <ShieldCheck size={20} />
          <span>Secure & convenient library access</span>
        </div>
      </div>
    </div>
  );

  // Forgot Password screen
  if (mode === "forgot") {
    return (
      <div className="login-page">
        <BrandingPanel />

        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <KeyRound size={30} />
              </div>

              <h1>Forgot Password?</h1>

              <p>
                Enter your registered email address and we’ll
                send you an OTP to reset your password.
              </p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {success && (
              <div className="login-success">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email Address</label>

                <div className="input-wrapper">
                  <Mail size={19} />

                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="loading-spinner"
                    />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            <button
              type="button"
              className="back-home"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft size={18} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password screen
  if (mode === "reset") {
    return (
      <div className="login-page">
        <BrandingPanel />

        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <Lock size={30} />
              </div>

              <h1>Reset Password</h1>

              <p>
                Enter the OTP sent to your email and create a
                new password.
              </p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {success && (
              <div className="login-success">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Email Address</label>

                <div className="input-wrapper">
                  <Mail size={19} />

                  <input
                    type="email"
                    value={email}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label>OTP</label>

                <div className="input-wrapper">
                  <KeyRound size={19} />

                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>

                <div className="input-wrapper">
                  <Lock size={19} />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>

                <div className="input-wrapper">
                  <Lock size={19} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="loading-spinner"
                    />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <button
              type="button"
              className="back-home"
              onClick={() => {
                setMode("forgot");
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Login screen
  return (
    <div className="login-page">
      <BrandingPanel />

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Lock size={30} />
            </div>

            <h1>Welcome Back</h1>

            <p>Login to your Readora account</p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="loading-spinner"
                  />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="signup-prompt">
            Don't have an account?{" "}
            <Link to="/signup">Create Account</Link>
          </div>

          <Link to="/" className="back-home">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;