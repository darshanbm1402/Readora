import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import API from "../services/api";
import "./VerifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/verify-otp", {
        email: email.trim(),
        otp,
      });

      if (response.data.success) {
        setSuccess(
          response.data.message ||
            "Email verified successfully."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(
          response.data.message ||
            "Email verification failed."
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setResending(true);

    try {
      const response = await API.post("/auth/resend-otp", {
        email: email.trim(),
      });

      if (response.data.success) {
        setSuccess(
          response.data.message ||
            "A new OTP has been sent to your email."
        );
        setOtp("");
      } else {
        setError(
          response.data.message ||
            "Unable to resend OTP."
        );
      }
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      {/* Branding Section */}
      <div className="verify-brand">
        <div className="verify-brand-content">
          <div className="verify-brand-logo">
            <BookOpen size={30} strokeWidth={2.3} />
          </div>

          <h1>Readora</h1>

          <p className="verify-brand-tagline">
            Verify your email address to complete your
            Readora account setup.
          </p>

          <div className="verify-brand-feature">
            <ShieldCheck size={21} />
            <span>Secure email verification</span>
          </div>
        </div>
      </div>

      {/* Verification Section */}
      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-header">
            <span className="verify-label">
              EMAIL VERIFICATION
            </span>

            <div className="verify-icon">
              <Mail size={27} />
            </div>

            <h2>Verify your email</h2>

            <p>
              Enter the 6-digit OTP sent to your email
              address.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="verify-form"
          >
            {/* Error */}
            {error && (
              <div className="verify-error">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="verify-success">
                {success}
              </div>
            )}

            {/* Email */}
            <div className="verify-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="verify-input-wrapper">
                <Mail
                  size={19}
                  className="verify-input-icon"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* OTP */}
            <div className="verify-form-group">
              <label htmlFor="otp">
                Verification OTP
              </label>

              <div className="verify-input-wrapper">
                <ShieldCheck
                  size={19}
                  className="verify-input-icon"
                />

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="verify-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}

              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="resend-section">
            <span>Didn't receive the OTP?</span>

            <button
              type="button"
              className="resend-button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <Link
            to="/login"
            className="verify-back-login"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
