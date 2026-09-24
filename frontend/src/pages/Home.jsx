import React from "react";
import {
  ArrowRight,
  BookMarked,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext.jsx";

import "./Home.css";

// ======================================================
// NAVIGATION
// ======================================================

const navItems = [
  {
    label: "Student Dashboard",
    description:
      "Open issued books, fines, and profile details",
    href: "/user/dashboard",
    match: "/user",
    icon: "dashboard",
  },
  {
    label: "Admin Dashboard",
    description:
      "Manage student issues, returns, and fines",
    href: "/admin/dashboard",
    match: "/admin",
    icon: "admin",
  },
];

// ======================================================
// FEATURES
// ======================================================

const features = [
  {
    icon: BookMarked,
    title: "Manual Book Issuing",
    text:
      "Track manual book issues, due dates, returns, and dynamic fine calculations in one workflow.",
  },
  {
    icon: Users,
    title: "Student Self-Service",
    text:
      "Students can review borrowed books, fines, academic details, and recent activity quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Desk Controls",
    text:
      "Library staff can manage student records, manual book issues, overdue items, and fine records.",
  },
];

// ======================================================
// HOME
// ======================================================

const Home = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const currentUser = auth?.currentUser || null;
  const logout = auth?.logout;

  // ======================================================
  // FOOTER ACTIONS
  // ======================================================

  const footerItems = currentUser
    ? [
        {
          label: "Logout",
          icon: "login",
          kind: "primary",
          action: () => {
            if (logout) {
              logout();
            }

            navigate("/");
          },
        },
      ]
    : [
        {
          label: "Login",
          href: "/login",
          icon: "login",
          kind: "primary",
        },
        {
          label: "Sign Up",
          href: "/signup",
          icon: "signup",
          kind: "secondary",
        },
      ];

  return (
    <div className="home-layout">
      <Sidebar
        title="Readora"
        subtitle="Library management portal"
        badge="Library Portal"
        navItems={navItems}
        footerItems={footerItems}
      />

      <main className="home-main">
        <div className="home-container">

          {/* ======================================================
              HERO
          ====================================================== */}

          <section className="home-hero">
            <div className="hero-content">
              <span className="hero-badge">
                Library Management Website
              </span>

              <h1 className="hero-title">
                Manage students, books, returns, and fines in one
                library dashboard.
              </h1>

              <p className="hero-text">
                Readora gives students a focused borrowing dashboard
                and provides administrators with a practical workspace
                for manual circulation, user records, returns, and
                overdue tracking.
              </p>

              <div className="hero-buttons">
                {currentUser ? (
                  <Link
                    to={
                      currentUser.role === "admin"
                        ? "/admin/dashboard"
                        : "/user/dashboard"
                    }
                    className="hero-button primary"
                  >
                    Go To Dashboard
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="hero-button primary"
                    >
                      Create Account
                      <ArrowRight size={17} />
                    </Link>

                    <Link
                      to="/login"
                      className="hero-button secondary"
                    >
                      Login Now
                      <ArrowRight size={17} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* ======================================================
                INFORMATION CARD
            ====================================================== */}

            <div className="hero-info-card">
              <span className="info-label">
                LIBRARY WORKFLOW
              </span>

              <h2>
                Everything your library needs in one organized
                workspace.
              </h2>

              <p>
                Monitor book issues, manage student records, process
                returns, and track overdue fines without leaving the
                system.
              </p>

              <div className="info-line">
                <span></span>
                <p>Student & Admin access</p>
              </div>

              <div className="info-line">
                <span></span>
                <p>Book circulation management</p>
              </div>

              <div className="info-line">
                <span></span>
                <p>Fine and overdue tracking</p>
              </div>
            </div>
          </section>

          {/* ======================================================
              FEATURES
          ====================================================== */}

          <section className="features-section">
            <div className="section-heading">
              <span>WHY READORA</span>

              <h2>
                Designed for simple library management
              </h2>

              <p>
                A clean workflow for students and library
                administrators.
              </p>
            </div>

            <div className="features-grid">
              {features.map(
                ({ icon: Icon, title, text }) => (
                  <article
                    className="feature-card"
                    key={title}
                  >
                    <div className="feature-icon">
                      <Icon size={23} />
                    </div>

                    <h3>{title}</h3>

                    <p>{text}</p>
                  </article>
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;