import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  BookOpen,
  Clock3,
  IndianRupee,
  User,
  Search,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";

import "./StudentDashboard.css";

const StudentDashboard = () => {
  const {
    currentUser,
    loading: authLoading,
  } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH STUDENT DASHBOARD
  // ======================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      if (authLoading) {
        return;
      }

      if (!currentUser) {
        setError(
          "Please login to view your dashboard."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          "/borrow/my-dashboard"
        );

        if (response.data.success) {
          setDashboard(
            response.data.dashboard || {}
          );
        } else {
          setError(
            response.data.message ||
              "Unable to load dashboard."
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch student dashboard:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
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

    fetchDashboard();
  }, [currentUser, authLoading]);

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // STATUS
  // ======================================================

  const getStatusLabel = (status) => {
    if (status === "overdue") {
      return "Overdue";
    }

    return "Active";
  };

  // ======================================================
  // DUE SOON
  // ======================================================

  const dueSoonCount = useMemo(() => {
    if (!dashboard?.activeBorrows) {
      return 0;
    }

    const now = new Date();

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(
      now.getDate() + 7
    );

    return dashboard.activeBorrows.filter(
      (borrow) => {
        if (
          borrow.status !== "issued" ||
          !borrow.dueDate
        ) {
          return false;
        }

        const dueDate = new Date(
          borrow.dueDate
        );

        if (Number.isNaN(dueDate.getTime())) {
          return false;
        }

        return (
          dueDate >= now &&
          dueDate <= sevenDaysFromNow
        );
      }
    ).length;
  }, [dashboard]);

  // ======================================================
  // STATS
  // ======================================================

  const stats = [
    {
      title: "Books Issued",
      value:
        dashboard?.currentlyBorrowed ?? 0,
      icon: <BookOpen size={22} />,
      text: "Currently with you",
    },
    {
      title: "Due Soon",
      value: dueSoonCount,
      icon: <Clock3 size={22} />,
      text: "Within 7 days",
    },
    {
      title: "Total Fines",
      value: `₹${dashboard?.totalFines ?? 0}`,
      icon: <IndianRupee size={22} />,
      text: "Recorded fine amount",
    },
  ];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="student-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="student-header">

        <div className="student-header-inner">

          <Link
            to="/"
            className="student-logo"
          >
            <div className="student-logo-icon">
              <BookOpen size={22} />
            </div>

            <span>Readora</span>
          </Link>

          <nav className="student-nav">

            <Link to="/books">
              Browse Books
            </Link>

            <Link
              to="/profile"
              className="student-profile-link"
            >
              <User size={17} />
              Profile
            </Link>

          </nav>

        </div>

      </header>

      <main className="student-main">

        {/* ======================================================
            WELCOME
        ====================================================== */}

        <section className="student-welcome">

          <div>

            <span className="student-label">
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome back,{" "}
              {currentUser?.name || "Student"}!
            </h1>

            <p>
              Manage your books, track due dates,
              and explore the Readora library.
            </p>

          </div>

          <Link
            to="/books"
            className="student-search-button"
          >
            <Search size={18} />
            Find a Book
          </Link>

        </section>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {(authLoading || loading) && (

          <div className="student-loading">

            <Loader2
              size={24}
              className="loading-spinner"
            />

            <span>
              Loading your dashboard...
            </span>

          </div>

        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {!authLoading &&
          !loading &&
          error && (

            <div className="student-error">

              <AlertCircle size={20} />

              <span>{error}</span>

            </div>

          )}

        {/* ======================================================
            DASHBOARD
        ====================================================== */}

        {!authLoading &&
          !loading &&
          !error &&
          dashboard && (

            <>

              {/* ==================================================
                  STATS
              ================================================== */}

              <section className="student-stats">

                {stats.map((stat) => (

                  <div
                    className="student-stat-card"
                    key={stat.title}
                  >

                    <div className="student-stat-icon">
                      {stat.icon}
                    </div>

                    <div>

                      <span>
                        {stat.title}
                      </span>

                      <strong>
                        {stat.value}
                      </strong>

                      <small>
                        {stat.text}
                      </small>

                    </div>

                  </div>

                ))}

              </section>

              {/* ==================================================
                  CONTENT
              ================================================== */}

              <section className="student-content-grid">

                {/* ==================================================
                    BOOKS
                ================================================== */}

                <div className="student-books-section">

                  <div className="student-section-heading">

                    <div>

                      <span className="student-section-label">
                        YOUR LIBRARY
                      </span>

                      <h2>
                        Recently Issued Books
                      </h2>

                    </div>

                    <Link to="/my-books">
                      View All
                      <ArrowRight size={16} />
                    </Link>

                  </div>

                  <div className="student-book-list">

                    {dashboard.activeBorrows?.length > 0 ? (

                      dashboard.activeBorrows
                        .slice(0, 3)
                        .map((borrow) => {

                          const status =
                            getStatusLabel(
                              borrow.status
                            );

                          return (

                            <div
                              className="student-book-item"
                              key={borrow._id}
                            >

                              <div className="student-book-cover">

                                {borrow.book?.coverImage ? (

                                  <img
                                    src={
                                      borrow.book
                                        .coverImage
                                    }
                                    alt={
                                      borrow.book
                                        .title ||
                                      "Book cover"
                                    }
                                  />

                                ) : (

                                  <BookOpen size={30} />

                                )}

                              </div>

                              <div className="student-book-info">

                                <h3>
                                  {borrow.book?.title ||
                                    "Unknown Book"}
                                </h3>

                                <p>
                                  {borrow.book?.author ||
                                    "Unknown Author"}
                                </p>

                                <div className="student-due-date">

                                  <CalendarDays
                                    size={15}
                                  />

                                  <span>
                                    Due:{" "}
                                    {formatDate(
                                      borrow.dueDate
                                    )}
                                  </span>

                                </div>

                              </div>

                              <div
                                className={`student-book-status ${
                                  status === "Active"
                                    ? "student-status-active"
                                    : "student-status-overdue"
                                }`}
                              >

                                {status === "Active" ? (

                                  <CheckCircle2
                                    size={15}
                                  />

                                ) : (

                                  <AlertCircle
                                    size={15}
                                  />

                                )}

                                {status}

                              </div>

                            </div>

                          );
                        })

                    ) : (

                      <div className="student-empty-books">

                        <BookOpen size={22} />

                        <span>
                          You currently have no
                          issued books.
                        </span>

                      </div>

                    )}

                  </div>

                </div>

                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <aside className="student-quick-actions">

                  <div className="student-section-heading">

                    <div>

                      <span className="student-section-label">
                        QUICK ACCESS
                      </span>

                      <h2>
                        Library Services
                      </h2>

                    </div>

                  </div>

                  <div className="student-action-list">

                    <Link
                      to="/books"
                      className="student-action-card"
                    >

                      <div className="student-action-icon">
                        <Search size={20} />
                      </div>

                      <div>

                        <strong>
                          Browse Books
                        </strong>

                        <span>
                          Find books available in
                          the library
                        </span>

                      </div>

                      <ArrowRight size={17} />

                    </Link>

                    <Link
                      to="/my-books"
                      className="student-action-card"
                    >

                      <div className="student-action-icon">
                        <BookOpen size={20} />
                      </div>

                      <div>

                        <strong>
                          My Books
                        </strong>

                        <span>
                          Check issued books and
                          due dates
                        </span>

                      </div>

                      <ArrowRight size={17} />

                    </Link>

                    <Link
                      to="/profile"
                      className="student-action-card"
                    >

                      <div className="student-action-icon">
                        <User size={20} />
                      </div>

                      <div>

                        <strong>
                          My Profile
                        </strong>

                        <span>
                          View and manage your
                          account
                        </span>

                      </div>

                      <ArrowRight size={17} />

                    </Link>

                  </div>

                </aside>

              </section>

              {/* ==================================================
                  NOTICE
              ================================================== */}

              <section className="student-notice">

                <AlertCircle size={20} />

                <div>

                  <strong>
                    Library Reminder
                  </strong>

                  <p>
                    Please return books on or
                    before their due dates to
                    avoid additional fines.
                  </p>

                </div>

              </section>

            </>

          )}

      </main>

    </div>
  );
};

export default StudentDashboard;