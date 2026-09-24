import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Save,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./AdminSettings.css";

const defaultSettings = {
  libraryName: "Readora Library",
  issuePeriod: 14,
  finePerDay: 10,
  maxBooks: 3,
  openingTime: "09:00",
  closingTime: "17:00",
  libraryEnabled: true,
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/settings");

      if (response.data.success) {
        setSettings({
          ...defaultSettings,
          ...response.data.settings,
        });
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load library settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!settings.libraryName.trim()) {
      setError("Library name is required.");
      return;
    }

    if (Number(settings.issuePeriod) < 1) {
      setError("Issue period must be at least 1 day.");
      return;
    }

    if (Number(settings.finePerDay) < 0) {
      setError("Fine per day cannot be negative.");
      return;
    }

    if (Number(settings.maxBooks) < 1) {
      setError("Maximum books must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put("/settings", {
        libraryName: settings.libraryName,
        issuePeriod: Number(settings.issuePeriod),
        finePerDay: Number(settings.finePerDay),
        maxBooks: Number(settings.maxBooks),
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        libraryEnabled: settings.libraryEnabled,
      });

      if (response.data.success) {
        setSettings({
          ...defaultSettings,
          ...response.data.settings,
        });

        setSuccess("Settings saved successfully.");
      }
    } catch (err) {
      console.error("Save settings error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="settings-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="settings-header">
        <Link to="/admin/dashboard" className="back-button">
  <ArrowLeft size={20} />
  Back to Dashboard
</Link>

        <div className="settings-title">
          <div className="settings-icon">
            <Settings size={28} />
          </div>

          <div>
            <h1>Library Settings</h1>
            <p>Manage Readora library configuration</p>
          </div>
        </div>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSave}>
          {error && (
            <div className="settings-message error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="settings-message success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="settings-card">
            <div className="card-heading">
              <BookOpen size={22} />
              <div>
                <h2>Library Information</h2>
                <p>Basic information about your library</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="libraryName">Library Name</label>
              <input
                id="libraryName"
                type="text"
                name="libraryName"
                value={settings.libraryName}
                onChange={handleChange}
                placeholder="Enter library name"
              />
            </div>
          </div>

          <div className="settings-card">
            <div className="card-heading">
              <Clock size={22} />
              <div>
                <h2>Borrowing Rules</h2>
                <p>Configure book issue and fine policies</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="issuePeriod">
                  Issue Period (Days)
                </label>

                <input
                  id="issuePeriod"
                  type="number"
                  name="issuePeriod"
                  min="1"
                  value={settings.issuePeriod}
                  onChange={handleChange}
                />

                <small>
                  Number of days a student can keep an issued book.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="finePerDay">
                  Fine Per Overdue Day (₹)
                </label>

                <input
                  id="finePerDay"
                  type="number"
                  name="finePerDay"
                  min="0"
                  value={settings.finePerDay}
                  onChange={handleChange}
                />

                <small>
                  Fine charged for each overdue day.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="maxBooks">
                  Maximum Books Per Student
                </label>

                <input
                  id="maxBooks"
                  type="number"
                  name="maxBooks"
                  min="1"
                  value={settings.maxBooks}
                  onChange={handleChange}
                />

                <small>
                  Maximum number of active books a student can have.
                </small>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-heading">
              <Clock size={22} />
              <div>
                <h2>Library Hours</h2>
                <p>Set the normal operating hours</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="openingTime">Opening Time</label>

                <input
                  id="openingTime"
                  type="time"
                  name="openingTime"
                  value={settings.openingTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="closingTime">Closing Time</label>

                <input
                  id="closingTime"
                  type="time"
                  name="closingTime"
                  value={settings.closingTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="system-control">
              <div>
                <h2>Library System</h2>
                <p>
                  Enable or disable the library system.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  name="libraryEnabled"
                  checked={settings.libraryEnabled}
                  onChange={handleChange}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="save-settings-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;