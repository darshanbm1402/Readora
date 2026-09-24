import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  IndianRupee,
  Receipt,
  Loader2,
  AlertCircle,
} from "lucide-react";

import API from "../services/api";

import "./AdminFines.css";

const AdminFines = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ======================================================
  // FETCH BORROW RECORDS + UPDATE OVERDUE FINES
  // ======================================================

  const fetchBorrowRecords = async () => {
    try {
      setLoading(true);
      setError("");

      // Refresh overdue statuses and automatic fines first.
      try {
        await API.put("/borrow/update-overdue");
      } catch (overdueError) {
        console.error(
          "Update overdue records error:",
          overdueError
        );
      }

      const response = await API.get("/borrow/all");

      if (response.data.success) {
        setBorrows(response.data.borrows || []);
      } else {
        setError(
          response.data.message ||
            "Failed to load fine records."
        );
      }
    } catch (err) {
      console.error(
        "Fetch fine records error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load fine records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowRecords();
  }, []);

  // ======================================================
  // FINE RECORDS
  // ======================================================

  const fineRecords = useMemo(() => {
    return borrows.filter(
      (borrow) =>
        Number(borrow.fine || 0) > 0
    );
  }, [borrows]);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase().trim();

    return fineRecords.filter((record) => {
      const student =
        record.student?.name?.toLowerCase() || "";

      const email =
        record.student?.email?.toLowerCase() || "";

      const rollNumber =
        record.student?.rollNumber?.toLowerCase() || "";

      const book =
        record.book?.title?.toLowerCase() || "";

      return (
        student.includes(value) ||
        email.includes(value) ||
        rollNumber.includes(value) ||
        book.includes(value)
      );
    });
  }, [fineRecords, search]);

  // ======================================================
  // OUTSTANDING FINE AMOUNT
  // Active + overdue only
  // ======================================================

  const outstandingFines = useMemo(() => {
    return fineRecords
      .filter(
        (record) =>
          record.status === "issued" ||
          record.status === "overdue"
      )
      .reduce(
        (total, record) =>
          total + Number(record.fine || 0),
        0
      );
  }, [fineRecords]);

  // ======================================================
  // TOTAL RECORDED FINE AMOUNT
  // Includes returned records
  // ======================================================

  const totalFineAmount = useMemo(() => {
    return fineRecords.reduce(
      (total, record) =>
        total + Number(record.fine || 0),
      0
    );
  }, [fineRecords]);

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
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
  // CALCULATE OVERDUE DAYS
  // ======================================================

  const calculateOverdueDays = (record) => {
    if (!record.dueDate) {
      return 0;
    }

    const dueDate = new Date(record.dueDate);

    const endDate = record.returnDate
      ? new Date(record.returnDate)
      : new Date();

    if (
      Number.isNaN(dueDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return 0;
    }

    if (endDate <= dueDate) {
      return 0;
    }

    const difference =
      endDate.getTime() -
      dueDate.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  // ======================================================
  // STATUS LABEL
  // ======================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "issued":
        return "Active";

      case "overdue":
        return "Overdue";

      case "returned":
        return "Recorded";

      default:
        return "Unknown";
    }
  };

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "issued":
        return "pending";

      case "overdue":
        return "pending";

      case "returned":
        return "recorded";

      default:
        return "recorded";
    }
  };

  return (
    <div className="admin-fines-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="admin-fines-header">

        <Link
          to="/admin/dashboard"
          className="admin-fines-back"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="admin-fines-brand">

          <div className="admin-fines-logo">
            <Receipt size={21} />
          </div>

          <div>
            <h1>Readora</h1>
            <span>Library Management</span>
          </div>

        </div>

        <span className="admin-fines-badge">
          Administrator
        </span>

      </header>

      <main className="admin-fines-main">

        {/* ======================================================
            TITLE
        ====================================================== */}

        <p className="admin-fines-eyebrow">
          ADMINISTRATION
        </p>

        <h2>Manage Fines</h2>

        <p className="admin-fines-description">
          View fines calculated automatically from
          overdue library borrow records.
        </p>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="admin-fines-error">

            <AlertCircle size={20} />

            <span>{error}</span>

          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <section className="admin-fines-stats">

          <div className="admin-fines-card">

            <span>
              Outstanding Fines
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${outstandingFines}`}
            </strong>

          </div>

          <div className="admin-fines-card">

            <span>
              Fine Records
            </span>

            <strong>
              {loading
                ? "—"
                : fineRecords.length}
            </strong>

          </div>

          <div className="admin-fines-card">

            <span>
              Recorded Fine Amount
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${totalFineAmount}`}
            </strong>

          </div>

        </section>

        {/* ======================================================
            FINE RECORDS
        ====================================================== */}

        <section className="admin-fines-panel">

          <div className="admin-fines-panel-title">

            <div>

              <h3>Fine Records</h3>

              <p>
                {fineRecords.length} records
                with fines
              </p>

            </div>

            <div className="admin-fines-search">

              <SearchIcon />

              <input
                type="text"
                placeholder="Search student or book..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

          </div>

          {/* ======================================================
              LOADING
          ====================================================== */}

          {loading ? (
            <div className="admin-fines-empty">

              <Loader2
                size={34}
                className="animate-spin"
              />

              <h3>
                Loading fine records...
              </h3>

              <p>
                Please wait while the records
                are loaded.
              </p>

            </div>
          ) : (
            <div className="admin-fines-table-wrapper">

              <table className="admin-fines-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Fine</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map((record) => {

                    const studentName =
                      record.student?.name ||
                      "Unknown Student";

                    const bookTitle =
                      record.book?.title ||
                      "Unknown Book";

                    const overdueDays =
                      calculateOverdueDays(record);

                    return (
                      <tr key={record._id}>

                        {/* STUDENT */}

                        <td>

                          <strong>
                            {studentName}
                          </strong>

                          {record.student
                            ?.rollNumber && (
                            <small>
                              {
                                record.student
                                  .rollNumber
                              }
                            </small>
                          )}

                        </td>

                        {/* BOOK */}

                        <td>

                          <strong>
                            {bookTitle}
                          </strong>

                          {record.book?.author && (
                            <small>
                              {record.book.author}
                            </small>
                          )}

                        </td>

                        {/* DUE DATE */}

                        <td>
                          {formatDate(
                            record.dueDate
                          )}
                        </td>

                        {/* OVERDUE DAYS */}

                        <td>
                          {overdueDays}{" "}
                          {overdueDays === 1
                            ? "day"
                            : "days"}
                        </td>

                        {/* FINE */}

                        <td>

                          <strong>
                            ₹
                            {Number(
                              record.fine || 0
                            )}
                          </strong>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`admin-fines-status ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {getStatusLabel(
                              record.status
                            )}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {filteredRecords.length === 0 && (
                <div className="admin-fines-empty">

                  <IndianRupee size={34} />

                  <h3>
                    No fine records found
                  </h3>

                  <p>
                    {fineRecords.length === 0
                      ? "There are currently no fine records."
                      : "Try changing your search."}
                  </p>

                </div>
              )}

            </div>
          )}

        </section>

        {/* ======================================================
            PAYMENT NOTE
        ====================================================== */}

        <section className="admin-fines-note">

          <Receipt size={20} />

          <div>

            <strong>
              Automatic Fine Tracking
            </strong>

            <p>
              Fines are calculated automatically
              according to the overdue period and
              the fine-per-day value configured in
              Admin Settings. Payment collection is
              not currently implemented.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

// ======================================================
// SEARCH ICON
// ======================================================

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle
      cx="11"
      cy="11"
      r="8"
    />

    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default AdminFines;