import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Search,
  UserRound,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./AdminIssues.css";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);

  const [issuePeriod, setIssuePeriod] = useState(14);

  const [search, setSearch] = useState("");
  const [showIssueForm, setShowIssueForm] = useState(false);

  const [form, setForm] = useState({
    student: "",
    book: "",
  });

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  // ======================================================
  // FETCH ADMIN ISSUE DATA
  // ======================================================
  const fetchIssueData = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * First update overdue records.
       * This automatically:
       * - changes issued -> overdue
       * - calculates current fine
       * - updates existing overdue fines
       */
      try {
        await API.put("/borrow/update-overdue");
      } catch (overdueError) {
        console.error(
          "Update overdue records error:",
          overdueError
        );
      }

      const [
        issuesResponse,
        studentsResponse,
        booksResponse,
        settingsResponse,
      ] = await Promise.all([
        API.get("/borrow/all"),
        API.get("/admin/users"),
        API.get("/books"),
        API.get("/settings"),
      ]);

      if (issuesResponse.data.success) {
        setIssues(issuesResponse.data.borrows || []);
      } else {
        setError("Failed to load issue records.");
      }

      if (studentsResponse.data.success) {
        const studentUsers = (
          studentsResponse.data.users || []
        ).filter((user) => user.role === "student");

        setStudents(studentUsers);
      }

      if (booksResponse.data.success) {
        setBooks(booksResponse.data.books || []);
      }

      if (settingsResponse.data.success) {
        setIssuePeriod(
          Number(
            settingsResponse.data.settings?.issuePeriod || 14
          )
        );
      }
    } catch (err) {
      console.error("Fetch issue data error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load issue management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueData();
  }, []);

  // ======================================================
  // FILTER ISSUES
  // ======================================================
  const filteredIssues = useMemo(() => {
    const value = search.toLowerCase().trim();

    return issues.filter((issue) => {
      const studentName =
        issue.student?.name?.toLowerCase() || "";

      const studentEmail =
        issue.student?.email?.toLowerCase() || "";

      const rollNumber =
        issue.student?.rollNumber?.toLowerCase() || "";

      const bookTitle =
        issue.book?.title?.toLowerCase() || "";

      const bookAuthor =
        issue.book?.author?.toLowerCase() || "";

      const status =
        issue.status?.toLowerCase() || "";

      return (
        studentName.includes(value) ||
        studentEmail.includes(value) ||
        rollNumber.includes(value) ||
        bookTitle.includes(value) ||
        bookAuthor.includes(value) ||
        status.includes(value)
      );
    });
  }, [issues, search]);

  // ======================================================
  // STATISTICS
  // ======================================================
  const activeCount = issues.filter(
    (issue) =>
      issue.status === "issued" ||
      issue.status === "overdue"
  ).length;

  const overdueCount = issues.filter(
    (issue) => issue.status === "overdue"
  ).length;

  // ======================================================
  // AVAILABLE STUDENTS
  // ======================================================
  const availableStudents = students;

  // ======================================================
  // AVAILABLE BOOKS
  // ======================================================
  const availableBooks = books.filter(
    (book) => Number(book.availableCopies) > 0
  );

  // ======================================================
  // FORM CHANGE
  // ======================================================
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  // ======================================================
  // ISSUE BOOK
  // ======================================================
  const handleIssueBook = async (event) => {
    event.preventDefault();

    if (!form.student || !form.book) {
      setFormError(
        "Please select both a student and a book."
      );
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      const response = await API.post("/borrow/issue", {
        studentId: form.student,
        bookId: form.book,
      });

      if (!response.data.success) {
        setFormError(
          response.data.message ||
            "Failed to issue book."
        );
        return;
      }

      setForm({
        student: "",
        book: "",
      });

      setShowIssueForm(false);

      await fetchIssueData();
    } catch (err) {
      console.error("Issue book error:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to issue book. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ======================================================
  // RETURN BOOK
  // ======================================================
  const handleReturn = async (borrowId) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    try {
      setReturningId(borrowId);
      setError("");

      const response = await API.post("/borrow/return", {
        borrowId,
      });

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Failed to return the book."
        );
        return;
      }

      await fetchIssueData();
    } catch (err) {
      console.error("Return book error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to return book. Please try again."
      );
    } finally {
      setReturningId(null);
    }
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ======================================================
  // DISPLAY STATUS
  // ======================================================
  const getDisplayStatus = (status) => {
    if (status === "issued") return "Active";
    if (status === "overdue") return "Overdue";
    if (status === "returned") return "Returned";

    return status || "Unknown";
  };

  return (
    <div className="admin-issues-page">
      {/* ==================== HEADER ==================== */}
      <header className="admin-issues-header">
        <div className="admin-issues-header-inner">
          <Link
            to="/admin/dashboard"
            className="admin-issues-back"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="admin-issues-brand">
            <div className="admin-issues-logo">
              <BookOpen size={21} />
            </div>

            <div>
              <h1>Readora</h1>
              <span>Library Management</span>
            </div>
          </div>

          <span className="admin-issues-badge">
            Administrator
          </span>
        </div>
      </header>

      <main className="admin-issues-main">
        {/* ==================== TITLE ==================== */}
        <section className="admin-issues-title-row">
          <div>
            <p className="admin-issues-eyebrow">
              ADMINISTRATION
            </p>

            <h2>Issues & Returns</h2>

            <p>
              Issue books to students and manage currently
              borrowed books.
            </p>
          </div>

          <button
            className="admin-issues-primary-btn"
            onClick={() =>
              setShowIssueForm(!showIssueForm)
            }
          >
            <BookOpen size={18} />
            Issue New Book
          </button>
        </section>

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="admin-issues-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* ==================== STATS ==================== */}
        <section className="admin-issues-stats">
          <div className="admin-issues-stat">
            <BookOpen size={20} />

            <div>
              <span>Total Issues</span>
              <strong>
                {loading ? "—" : issues.length}
              </strong>
            </div>
          </div>

          <div className="admin-issues-stat">
            <UserRound size={20} />

            <div>
              <span>Currently Issued</span>
              <strong>
                {loading ? "—" : activeCount}
              </strong>
            </div>
          </div>

          <div className="admin-issues-stat">
            <CalendarDays size={20} />

            <div>
              <span>Overdue Books</span>
              <strong>
                {loading ? "—" : overdueCount}
              </strong>
            </div>
          </div>
        </section>

        {/* ==================== ISSUE FORM ==================== */}
        {showIssueForm && (
          <section className="admin-issues-form-panel">
            <div className="admin-issues-form-heading">
              <div>
                <p className="admin-issues-eyebrow">
                  NEW TRANSACTION
                </p>

                <h3>Issue Book</h3>
              </div>
            </div>

            {formError && (
              <div className="admin-issues-form-error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleIssueBook}>
              <div className="admin-issues-form-grid">
                {/* Student */}
                <label>
                  Student

                  <select
                    name="student"
                    value={form.student}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select student
                    </option>

                    {availableStudents.map((student) => (
                      <option
                        key={student._id}
                        value={student._id}
                      >
                        {student.name}{" "}
                        {student.rollNumber
                          ? `(${student.rollNumber})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Book */}
                <label>
                  Book

                  <select
                    name="book"
                    value={form.book}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select available book
                    </option>

                    {availableBooks.map((book) => (
                      <option
                        key={book._id}
                        value={book._id}
                      >
                        {book.title} —{" "}
                        {book.availableCopies} available
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="admin-issues-form-note">
                Books are issued for{" "}
                <strong>{issuePeriod} days</strong>.
                The issue date and due date are automatically
                calculated by the backend.
              </p>

              <div className="admin-issues-form-actions">
                <button
                  type="button"
                  className="admin-issues-cancel"
                  onClick={() =>
                    setShowIssueForm(false)
                  }
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-issues-submit"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Issuing...
                    </>
                  ) : (
                    "Issue Book"
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================== ISSUES TABLE ==================== */}
        <section className="admin-issues-panel">
          <div className="admin-issues-toolbar">
            <div className="admin-issues-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search student, book, roll number..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          {/* ==================== LOADING ==================== */}
          {loading ? (
            <div className="admin-issues-empty">
              <Loader2
                size={34}
                className="animate-spin"
              />

              <h3>Loading issue records...</h3>

              <p>
                Please wait while borrow records are loaded.
              </p>
            </div>
          ) : (
            <div className="admin-issues-table-wrapper">
              <table className="admin-issues-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIssues.map((issue) => {
                    const status =
                      getDisplayStatus(issue.status);

                    const statusClass =
                      issue.status === "overdue"
                        ? "overdue"
                        : issue.status === "returned"
                        ? "returned"
                        : "active";

                    const studentName =
                      issue.student?.name ||
                      "Unknown Student";

                    const rollNumber =
                      issue.student?.rollNumber || "—";

                    const bookTitle =
                      issue.book?.title ||
                      "Unknown Book";

                    return (
                      <tr key={issue._id}>
                        {/* Student */}
                        <td>
                          <div className="admin-issues-student">
                            <div className="admin-issues-avatar">
                              {studentName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {studentName}
                              </strong>

                              <span>
                                {rollNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Book */}
                        <td>
                          <strong className="admin-issues-book">
                            {bookTitle}
                          </strong>

                          {issue.book?.author && (
                            <small>
                              {issue.book.author}
                            </small>
                          )}
                        </td>

                        {/* Issue Date */}
                        <td>
                          {formatDate(
                            issue.issueDate
                          )}
                        </td>

                        {/* Due Date */}
                        <td>
                          {formatDate(
                            issue.dueDate
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`admin-issues-status ${statusClass}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Fine */}
                        <td>
                          <strong>
                            ₹{issue.fine || 0}
                          </strong>
                        </td>

                        {/* Action */}
                        <td>
                          {issue.status ===
                          "returned" ? (
                            <span className="admin-issues-returned">
                              <CheckCircle2 size={15} />
                              Returned
                            </span>
                          ) : (
                            <button
                              className="admin-issues-return-btn"
                              onClick={() =>
                                handleReturn(
                                  issue._id
                                )
                              }
                              disabled={
                                returningId ===
                                issue._id
                              }
                            >
                              {returningId ===
                              issue._id ? (
                                <>
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                  Returning...
                                </>
                              ) : (
                                "Return"
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ==================== EMPTY ==================== */}
              {filteredIssues.length === 0 && (
                <div className="admin-issues-empty">
                  <BookOpen size={34} />

                  <h3>
                    No issue records found
                  </h3>

                  <p>
                    {issues.length === 0
                      ? "There are no borrow records yet."
                      : "Try changing your search."}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminIssues;