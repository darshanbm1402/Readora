import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./AdminStudents.css";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ======================================================
  // FETCH STUDENTS
  // ======================================================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      if (response.data.success) {
        const studentUsers = (response.data.users || []).filter(
          (user) => user.role === "student"
        );

        setStudents(studentUsers);
      } else {
        setError("Failed to load students.");
      }
    } catch (err) {
      console.error("Fetch students error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load students from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================
  const filteredStudents = useMemo(() => {
    const value = search.toLowerCase().trim();

    return students.filter((student) => {
      const name = student.name?.toLowerCase() || "";
      const email = student.email?.toLowerCase() || "";
      const rollNumber = student.rollNumber?.toLowerCase() || "";
      const phone = student.phone?.toLowerCase() || "";
      const academicYear =
        student.academicYear?.toLowerCase() || "";

      return (
        name.includes(value) ||
        email.includes(value) ||
        rollNumber.includes(value) ||
        phone.includes(value) ||
        academicYear.includes(value)
      );
    });
  }, [students, search]);

  // ======================================================
  // DELETE STUDENT
  // ======================================================
  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(student._id);
      setError("");

      const response = await API.delete(
        `/admin/users/${student._id}`
      );

      if (!response.data.success) {
        setError(
          response.data.message || "Failed to delete student."
        );
        return;
      }

      setStudents((previous) =>
        previous.filter(
          (item) => item._id !== student._id
        )
      );
    } catch (err) {
      console.error("Delete student error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete student. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // STATISTICS
  // ======================================================
  const activeCount = students.filter(
    (student) => student.isEmailVerified === true
  ).length;

  const inactiveCount = students.length - activeCount;

  return (
    <div className="admin-students-page">
      {/* ==================== HEADER ==================== */}
      <header className="admin-students-header">
        <div className="admin-students-header-inner">
          <Link
            to="/admin/dashboard"
            className="admin-students-back"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="admin-students-brand">
            <div className="admin-students-logo">
              <Users size={21} />
            </div>

            <div>
              <h1>Readora</h1>
              <span>Library Management</span>
            </div>
          </div>

          <span className="admin-students-badge">
            Administrator
          </span>
        </div>
      </header>

      <main className="admin-students-main">
        {/* ==================== TITLE ==================== */}
        <section className="admin-students-title">
          <p className="admin-students-eyebrow">
            ADMINISTRATION
          </p>

          <h2>Manage Students</h2>

          <p>
            View and manage student accounts registered with the
            library.
          </p>
        </section>

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="admin-students-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* ==================== STATS ==================== */}
        <section className="admin-students-stats">
          <div className="admin-students-stat">
            <Users size={20} />

            <div>
              <span>Total Students</span>
              <strong>
                {loading ? "—" : students.length}
              </strong>
            </div>
          </div>

          <div className="admin-students-stat">
            <UserCheck size={20} />

            <div>
              <span>Verified Accounts</span>
              <strong>
                {loading ? "—" : activeCount}
              </strong>
            </div>
          </div>

          <div className="admin-students-stat">
            <UserX size={20} />

            <div>
              <span>Unverified Accounts</span>
              <strong>
                {loading ? "—" : inactiveCount}
              </strong>
            </div>
          </div>
        </section>

        {/* ==================== STUDENTS PANEL ==================== */}
        <section className="admin-students-panel">
          <div className="admin-students-toolbar">
            <div className="admin-students-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by name, email, roll number..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          <div className="admin-students-result">
            Showing <strong>{filteredStudents.length}</strong>{" "}
            of <strong>{students.length}</strong> students
          </div>

          {/* ==================== LOADING ==================== */}
          {loading ? (
            <div className="admin-students-empty">
              <Loader2
                size={34}
                className="animate-spin"
              />

              <h3>Loading students...</h3>

              <p>
                Please wait while student accounts are loaded
                from the server.
              </p>
            </div>
          ) : (
            <div className="admin-students-table-wrapper">
              <table className="admin-students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Academic Year</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const verified =
                      student.isEmailVerified === true;

                    const initials =
                      student.name
                        ?.trim()
                        .charAt(0)
                        .toUpperCase() || "S";

                    return (
                      <tr key={student._id}>
                        {/* Student */}
                        <td>
                          <div className="admin-student-info">
                            <div className="admin-student-avatar">
                              {initials}
                            </div>

                            <div>
                              <strong>
                                {student.name}
                              </strong>

                              <span>
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td>
                          {student.rollNumber || "—"}
                        </td>

                        {/* Academic Year */}
                        <td>
                          {student.academicYear || "—"}
                        </td>

                        {/* Phone */}
                        <td>
                          {student.phone || "—"}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`admin-student-status ${
                              verified
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {verified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>

                        {/* Action */}
                        <td>
                          <button
                            className="admin-student-delete"
                            onClick={() =>
                              handleDelete(student)
                            }
                            disabled={
                              deletingId === student._id
                            }
                            title="Delete student"
                          >
                            {deletingId === student._id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}

                            {deletingId === student._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ==================== EMPTY ==================== */}
              {filteredStudents.length === 0 && (
                <div className="admin-students-empty">
                  <Users size={34} />

                  <h3>No students found</h3>

                  <p>
                    {students.length === 0
                      ? "No student accounts are registered yet."
                      : "Try searching with a different name, email, or roll number."}
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

export default AdminStudents;