import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./AdminBooks.css";

const emptyForm = {
  title: "",
  author: "",
  category: "Fiction",
  isbn: "",
  copies: 1,
};

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  // ======================================================
  // FETCH BOOKS
  // ======================================================
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/books");

      if (response.data.success) {
        setBooks(response.data.books || []);
      } else {
        setError("Failed to load books.");
      }
    } catch (err) {
      console.error("Fetch books error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load books from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ======================================================
// CATEGORIES
// ======================================================
const availableCategories = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Engineering",
  "Computer Science",
  "Mathematics",
  "Business",
  "Management",
  "Economics",
  "History",
  "Geography",
  "Biography",
  "Self-Help",
  "Psychology",
  "Philosophy",
  "Literature",
  "Poetry",
  "Reference",
  "Academic",
  "Competitive Exams",
  "Children",
  "Other",
];

const categories = useMemo(() => {
  const databaseCategories = books
    .map((book) => book.category)
    .filter(Boolean);

  return [
    "All",
    ...new Set([
      ...availableCategories,
      ...databaseCategories,
    ]),
  ];
}, [books]);

  // ======================================================
  // FILTER BOOKS
  // ======================================================
  const filteredBooks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return books.filter((book) => {
      const title = book.title?.toLowerCase() || "";
      const author = book.author?.toLowerCase() || "";
      const isbn = book.isbn?.toLowerCase() || "";

      const matchesSearch =
        title.includes(searchText) ||
        author.includes(searchText) ||
        isbn.includes(searchText);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  // ======================================================
  // STATISTICS
  // ======================================================
  const totalCopies = books.reduce(
    (sum, book) => sum + (Number(book.totalCopies) || 0),
    0
  );

  const availableCopies = books.reduce(
    (sum, book) => sum + (Number(book.availableCopies) || 0),
    0
  );

  const unavailableTitles = books.filter(
    (book) => Number(book.availableCopies) === 0
  ).length;

  // ======================================================
  // ADD BOOK MODAL
  // ======================================================
  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  // ======================================================
  // EDIT BOOK MODAL
  // ======================================================
  const openEditModal = (book) => {
    setEditingBook(book);

    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "Fiction",
      isbn: book.isbn || "",
      copies: book.totalCopies || 1,
    });

    setFormError("");
    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================
  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingBook(null);
    setForm(emptyForm);
    setFormError("");
  };

  // ======================================================
  // FORM CHANGE
  // ======================================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "copies" ? Number(value) : value,
    }));
  };

  // ======================================================
  // ADD / UPDATE BOOK
  // ======================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.isbn.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (form.copies < 1) {
      setFormError("Total copies must be at least 1.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingBook) {
        // UPDATE BOOK
        const response = await API.put(
          `/books/${editingBook._id}`,
          {
            title: form.title.trim(),
            author: form.author.trim(),
            category: form.category,
            isbn: form.isbn.trim(),
            totalCopies: form.copies,
          }
        );

        if (!response.data.success) {
          setFormError(
            response.data.message || "Failed to update book."
          );
          return;
        }
      } else {
        // ADD BOOK
        const response = await API.post("/books/add", {
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          isbn: form.isbn.trim(),
          totalCopies: form.copies,
        });

        if (!response.data.success) {
          setFormError(
            response.data.message || "Failed to add book."
          );
          return;
        }
      }

      closeModal();
      await fetchBooks();
    } catch (err) {
      console.error("Save book error:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to save book. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // DELETE BOOK
  // ======================================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await API.delete(`/books/${id}`);

      if (!response.data.success) {
        setError(
          response.data.message || "Failed to delete book."
        );
        return;
      }

      await fetchBooks();
    } catch (err) {
      console.error("Delete book error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete book. Please try again."
      );
    }
  };

  return (
    <div className="admin-books-page">
      {/* ==================== HEADER ==================== */}
      <header className="admin-books-header">
        <div className="admin-books-header-inner">
          <Link to="/admin/dashboard" className="admin-books-back">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="admin-books-brand">
            <div className="admin-books-logo">
              <BookOpen size={21} />
            </div>

            <div>
              <h1>Readora</h1>
              <span>Library Management</span>
            </div>
          </div>

          <div className="admin-books-header-label">
            Administrator
          </div>
        </div>
      </header>

      <main className="admin-books-main">
        {/* ==================== TITLE ==================== */}
        <section className="admin-books-title-row">
          <div>
            <p className="admin-books-eyebrow">ADMINISTRATION</p>
            <h2>Manage Books</h2>
            <p>
              Add, update and manage the books available in your
              library.
            </p>
          </div>

          <button
            className="admin-books-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add New Book
          </button>
        </section>

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="admin-books-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* ==================== STATS ==================== */}
        <section className="admin-books-stats">
          <div className="admin-books-stat-card">
            <span>Total Titles</span>
            <strong>
              {loading ? "—" : books.length}
            </strong>
          </div>

          <div className="admin-books-stat-card">
            <span>Total Copies</span>
            <strong>
              {loading ? "—" : totalCopies}
            </strong>
          </div>

          <div className="admin-books-stat-card">
            <span>Available Copies</span>
            <strong>
              {loading ? "—" : availableCopies}
            </strong>
          </div>

          <div className="admin-books-stat-card">
            <span>Unavailable Titles</span>
            <strong>
              {loading ? "—" : unavailableTitles}
            </strong>
          </div>
        </section>

        {/* ==================== BOOKS PANEL ==================== */}
        <section className="admin-books-panel">
          <div className="admin-books-toolbar">
            <div className="admin-books-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by title, author or ISBN..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="admin-books-category"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? "All Categories"
                    : item}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-books-result-info">
            Showing <strong>{filteredBooks.length}</strong> of{" "}
            <strong>{books.length}</strong> books
          </div>

          {/* ==================== LOADING ==================== */}
          {loading ? (
            <div className="admin-books-empty">
              <Loader2 size={34} className="animate-spin" />
              <h3>Loading books...</h3>
              <p>
                Please wait while the books are loaded from the
                server.
              </p>
            </div>
          ) : (
            <>
              <div className="admin-books-table-wrapper">
                <table className="admin-books-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>ISBN</th>
                      <th>Copies</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBooks.map((book) => {
                      const available =
                        Number(book.availableCopies) > 0;

                      return (
                        <tr key={book._id}>
                          <td>
                            <div className="admin-book-name">
                              <div className="admin-book-icon">
                                <BookOpen size={18} />
                              </div>

                              <strong>
                                {book.title}
                              </strong>
                            </div>
                          </td>

                          <td>{book.author}</td>

                          <td>
                            <span className="admin-book-category-tag">
                              {book.category}
                            </span>
                          </td>

                          <td className="admin-book-isbn">
                            {book.isbn}
                          </td>

                          <td>
                            <strong>
                              {book.availableCopies}
                            </strong>{" "}
                            / {book.totalCopies}
                          </td>

                          <td>
                            <span
                              className={`admin-book-status ${
                                available
                                  ? "available"
                                  : "unavailable"
                              }`}
                            >
                              {available
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </td>

                          <td>
                            <div className="admin-book-actions">
                              <button
                                className="admin-book-edit"
                                onClick={() =>
                                  openEditModal(book)
                                }
                                title="Edit book"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                className="admin-book-delete"
                                onClick={() =>
                                  handleDelete(book._id)
                                }
                                title="Delete book"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredBooks.length === 0 && (
                  <div className="admin-books-empty">
                    <BookOpen size={34} />

                    <h3>No books found</h3>

                    <p>
                      {books.length === 0
                        ? "No books have been added to the library yet."
                        : "Try changing your search or category filter."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ==================== ADD / EDIT MODAL ==================== */}
      {showModal && (
        <div
          className="admin-books-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-books-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-books-modal-header">
              <div>
                <p className="admin-books-eyebrow">
                  BOOK MANAGEMENT
                </p>

                <h3>
                  {editingBook
                    ? "Edit Book"
                    : "Add New Book"}
                </h3>
              </div>

              <button
                className="admin-books-modal-close"
                onClick={closeModal}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="admin-books-form-error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="admin-books-form-grid">
                {/* Title */}
                <label>
                  Book Title

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                    required
                  />
                </label>

                {/* Author */}
                <label>
                  Author

                  <input
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    required
                  />
                </label>

                {/* Category */}
                <label>
                  Category

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories
                      .filter(
                        (item) => item !== "All"
                      )
                      .map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}

                    {!categories
                      .filter(
                        (item) => item !== "All"
                      )
                      .includes(form.category) && (
                      <option value={form.category}>
                        {form.category}
                      </option>
                    )}
                  </select>
                </label>

                {/* ISBN */}
                <label>
                  ISBN

                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="Enter ISBN"
                    required
                  />
                </label>

                {/* Copies */}
                <label>
                  Total Copies

                  <input
                    type="number"
                    name="copies"
                    min="1"
                    value={form.copies}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="admin-books-modal-actions">
                <button
                  type="button"
                  className="admin-books-cancel"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-books-save"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      {editingBook
                        ? "Saving..."
                        : "Adding..."}
                    </>
                  ) : editingBook ? (
                    "Save Changes"
                  ) : (
                    "Add Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;