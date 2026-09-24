import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  User,
  Mail,
  GraduationCap,
  Phone,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/auth/me");

        if (response.data.success) {
          const user = response.data.user;

          setProfile(user);
          setEditData({
            name: user.name || "",
            phone: user.phone || "",
            rollNumber: user.rollNumber || "",
            academicYear: user.academicYear || "",
          });
        } else {
          setError(
            response.data.message || "Unable to load profile."
          );
        }
      } catch (err) {
        console.error("Fetch profile error:", err);

        if (err.response?.status === 401) {
          setError("Please login to view your profile.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to connect to the server."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setEditData({
      name: profile.name || "",
      phone: profile.phone || "",
      rollNumber: profile.rollNumber || "",
      academicYear: profile.academicYear || "",
    });

    setSaveMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name || "",
      phone: profile.phone || "",
      rollNumber: profile.rollNumber || "",
      academicYear: profile.academicYear || "",
    });

    setSaveMessage("");
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const response = await API.put("/auth/profile", {
        name: editData.name,
        phone: editData.phone,
        rollNumber: editData.rollNumber,
        academicYear: editData.academicYear,
      });

      if (response.data.success) {
        setProfile(response.data.user);

        setEditData({
          name: response.data.user.name || "",
          phone: response.data.user.phone || "",
          rollNumber: response.data.user.rollNumber || "",
          academicYear: response.data.user.academicYear || "",
        });

        setIsEditing(false);
        setSaveMessage("Profile updated successfully.");
      } else {
        setError(
          response.data.message || "Unable to update profile."
        );
      }
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "ST";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Loader2 size={26} className="loading-spinner" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <AlertCircle size={22} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-inner">
          <Link to="/" className="profile-logo">
            <div className="profile-logo-icon">
              <BookOpen size={22} />
            </div>
            <span>Readora</span>
          </Link>

          <Link to="/books" className="profile-browse">
            Browse Books
          </Link>
        </div>
      </header>

      <main className="profile-main">
        <Link to="/user/dashboard" className="profile-back">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <section className="profile-title-section">
          <div>
            <span className="profile-label">ACCOUNT SETTINGS</span>
            <h1>My Profile</h1>
            <p>
              View and manage your Readora account information.
            </p>
          </div>

          {!isEditing && (
            <button
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          )}
        </section>

        {saveMessage && (
          <div className="profile-success">
            <ShieldCheck size={20} />
            <span>{saveMessage}</span>
          </div>
        )}

        {error && profile && (
          <div className="profile-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <section className="profile-card">
          <div className="profile-card-top">
            <div className="profile-avatar">
              {getInitials(profile.name)}
            </div>

            <div className="profile-user-heading">
              <h2>{profile.name}</h2>
              <p>Student Account</p>

              <div className="profile-verified">
                <ShieldCheck size={15} />
                {profile.isEmailVerified
                  ? "Verified Library Member"
                  : "Library Member"}
              </div>
            </div>
          </div>

          {isEditing ? (
            <form
              className="profile-form"
              onSubmit={handleSave}
            >
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="name">Full Name</label>

                  <div className="profile-input-wrapper">
                    <User size={18} />

                    <input
                      id="name"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="profile-input-wrapper">
                    <Mail size={18} />

                    <input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <div className="profile-input-wrapper">
                    <Phone size={18} />

                    <input
                      id="phone"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="rollNumber">
                    Roll Number
                  </label>

                  <div className="profile-input-wrapper">
                    <GraduationCap size={18} />

                    <input
                      id="rollNumber"
                      name="rollNumber"
                      value={editData.rollNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="academicYear">
                    Academic Year
                  </label>

                  <div className="profile-input-wrapper">
                    <GraduationCap size={18} />

                    <input
                      id="academicYear"
                      name="academicYear"
                      value={editData.academicYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="loading-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <User size={19} />

                <div>
                  <span>Full Name</span>
                  <strong>{profile.name || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-info-item">
                <Mail size={19} />

                <div>
                  <span>Email Address</span>
                  <strong>{profile.email || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-info-item">
                <GraduationCap size={19} />

                <div>
                  <span>Roll Number</span>
                  <strong>
                    {profile.rollNumber || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <GraduationCap size={19} />

                <div>
                  <span>Academic Year</span>
                  <strong>
                    {profile.academicYear || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <Phone size={19} />

                <div>
                  <span>Phone Number</span>
                  <strong>
                    {profile.phone || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <ShieldCheck size={19} />

                <div>
                  <span>Email Verification</span>
                  <strong>
                    {profile.isEmailVerified
                      ? "Verified"
                      : "Not Verified"}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="profile-security-note">
          <ShieldCheck size={20} />

          <div>
            <strong>Your account is protected</strong>

            <p>
              Your profile information is securely loaded from
              your Readora account and saved to the database when
              you make changes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
