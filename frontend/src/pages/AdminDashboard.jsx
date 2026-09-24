import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  BookOpen,
  Users,
  ClipboardList,
  IndianRupee,
  Plus,
  UserPlus,
  AlertTriangle,
  ArrowRight,
  Search,
  Settings,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import API from "../services/api";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH DASHBOARD STATISTICS
  // ======================================================

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          "/admin/dashboard-stats"
        );

        if (response.data.success) {
          setStats(
            response.data.stats || {}
          );
        } else {
          setError(
            response.data.message ||
              "Failed to load dashboard statistics."
          );
        }
      } catch (err) {
        console.error(
          "Dashboard stats error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="admin-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="admin-header">

        <div className="admin-header-left">

          <div className="admin-logo">
            <BookOpen size={24} />
          </div>

          <div>
            <h1>Readora</h1>

            <p>
              Library Management System
            </p>
          </div>

        </div>

        <div className="admin-header-right">

          <div className="admin-role">
            <ShieldCheck size={18} />
            <span>
              Administrator
            </span>
          </div>

          <Link
            to="/profile"
            className="admin-profile-link"
          >
            Admin Profile
          </Link>

        </div>

      </header>

      <main className="admin-dashboard-content">

        {/* ======================================================
            WELCOME
        ====================================================== */}

        <section className="admin-welcome">

          <div>
            <h2>
              Welcome back, Administrator!
            </h2>

            <p>
              Manage your library, students,
              books, issues, and fines from
              here.
            </p>
          </div>

        </section>

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <section className="admin-stats-section">

          <div className="section-heading">

            <div>
              <h2>
                Library Overview
              </h2>

              <p>
                Current library statistics
              </p>
            </div>

          </div>

          {loading ? (
            <div className="dashboard-loading">

              <Loader2
                size={24}
                className="animate-spin"
              />

              <span>
                Loading dashboard statistics...
              </span>

            </div>
          ) : error ? (
            <div className="dashboard-error">

              <AlertTriangle size={20} />

              <span>
                {error}
              </span>

            </div>
          ) : (
            <div className="stats-grid">

              {/* ==================================================
                  TOTAL BOOKS
              ================================================== */}

              <div className="stat-card">

                <div className="stat-icon">
                  <BookOpen size={22} />
                </div>

                <div className="stat-content">

                  <p>
                    Total Books
                  </p>

                  <h3>
                    {stats?.totalBooks ?? 0}
                  </h3>

                  <span>
                    Book titles in library
                  </span>

                </div>

              </div>

              {/* ==================================================
                  STUDENTS
              ================================================== */}

              <div className="stat-card">

                <div className="stat-icon">
                  <Users size={22} />
                </div>

                <div className="stat-content">

                  <p>
                    Students
                  </p>

                  <h3>
                    {stats?.totalStudents ?? 0}
                  </h3>

                  <span>
                    Registered students
                  </span>

                </div>

              </div>

              {/* ==================================================
                  BOOKS ISSUED
              ================================================== */}

              <div className="stat-card">

                <div className="stat-icon">
                  <ClipboardList size={22} />
                </div>

                <div className="stat-content">

                  <p>
                    Books Issued
                  </p>

                  <h3>
                    {stats?.totalIssuedBooks ?? 0}
                  </h3>

                  <span>
                    Currently issued
                  </span>

                </div>

              </div>

              {/* ==================================================
                  RECORDED FINES
              ================================================== */}

              <div className="stat-card">

                <div className="stat-icon">
                  <IndianRupee size={22} />
                </div>

                <div className="stat-content">

                  <p>
                    Recorded Fines
                  </p>

                  <h3>
                    ₹{stats?.totalFines ?? 0}
                  </h3>

                  <span>
                    Fines calculated by the system
                  </span>

                </div>

              </div>

            </div>
          )}

        </section>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="quick-actions-section">

          <div className="section-heading">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Frequently used administration tools
              </p>

            </div>

          </div>

          <div className="quick-actions-grid">

            <Link
              to="/admin/books"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <BookOpen size={22} />
              </div>

              <div className="quick-action-content">
                <h3>
                  Manage Books
                </h3>

                <p>
                  Add, edit, delete, and search books.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/admin/students"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <UserPlus size={22} />
              </div>

              <div className="quick-action-content">
                <h3>
                  Manage Students
                </h3>

                <p>
                  View and manage registered students.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/admin/issues"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <ClipboardList size={22} />
              </div>

              <div className="quick-action-content">
                <h3>
                  Issue & Returns
                </h3>

                <p>
                  Issue books and process returns.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

            <Link
              to="/admin/fines"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <IndianRupee size={22} />
              </div>

              <div className="quick-action-content">
                <h3>
                  Manage Fines
                </h3>

                <p>
                  View calculated fine records.
                </p>
              </div>

              <ArrowRight size={20} />
            </Link>

          </div>

        </section>

        {/* ======================================================
            OVERDUE BOOKS
        ====================================================== */}

        <section className="overdue-section">

          <div className="section-heading">

            <div>

              <h2>
                Overdue Books
              </h2>

              <p>
                Books that have passed their due date
              </p>

            </div>

            <Link
              to="/admin/issues"
              className="view-all-link"
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="empty-state">

            <AlertTriangle size={32} />

            <h3>
              Overdue details
            </h3>

            <p>
              Detailed overdue records are available
              in the issue management section.
            </p>

            <Link
              to="/admin/issues"
              className="empty-state-button"
            >
              Manage Issues
            </Link>

          </div>

        </section>

        {/* ======================================================
            SYSTEM CONTROLS
        ====================================================== */}

        <section className="system-controls-section">

          <div className="section-heading">

            <div>

              <h2>
                System Controls
              </h2>

              <p>
                Manage library administration settings
              </p>

            </div>

          </div>

          <div className="system-controls-grid">

            <Link
              to="/books"
              className="system-control-card"
            >
              <Search size={20} />

              <div>
                <h3>
                  Search Library
                </h3>

                <p>
                  Search books in the library.
                </p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/admin/books"
              className="system-control-card"
            >
              <Plus size={20} />

              <div>
                <h3>
                  Add New Book
                </h3>

                <p>
                  Add a new book to the library.
                </p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/admin/settings"
              className="system-control-card"
            >
              <Settings size={20} />

              <div>
                <h3>
                  Settings
                </h3>

                <p>
                  Manage system settings.
                </p>
              </div>

              <ArrowRight size={18} />
            </Link>

          </div>

        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;