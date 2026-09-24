import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  ArrowRight,
  LogIn,
  Loader2,
  AlertCircle,
} from "lucide-react";

import API from "../services/api";
import "./Books.css";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/books");

        if (response.data.success) {
          setBooks(response.data.books);
        } else {
          setError("Failed to load books.");
        }
      } catch (err) {
        console.error("Failed to fetch books:", err);

        if (err.response?.status === 401) {
          setError("Please login to view the books.");
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

    fetchBooks();
  }, []);

  // Get categories from backend books
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(books.map((book) => book.category).filter(Boolean)),
    ];

    return ["All", ...uniqueCategories];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return books.filter((book) => {
      const matchesSearch =
        !searchValue ||
        book.title?.toLowerCase().includes(searchValue) ||
        book.author?.toLowerCase().includes(searchValue) ||
        book.isbn?.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  return (
    <div className="books-page">
      {/* Header */}
      <header className="books-header">
        <div className="books-header-content">
          <Link to="/" className="books-logo">
            <BookOpen size={28} />
            <span>Readora</span>
          </Link>

          <Link to="/login" className="books-login-btn">
            <LogIn size={18} />
            Login
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="books-container">
        {/* Page heading */}
        <section className="books-hero">
          <div>
            <h1>Explore Books</h1>
            <p>
              Discover books available in the Readora library.
            </p>
          </div>

          <div className="books-count">
            <strong>{books.length}</strong>
            <span>Total Books</span>
          </div>
        </section>

        {/* Search and filter */}
        <section className="books-controls">
          <div className="books-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search by title, author or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="books-category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="books-message">
            <Loader2 className="loading-spinner" size={32} />
            <p>Loading books...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="books-message books-error">
            <AlertCircle size={32} />
            <h3>Unable to load books</h3>
            <p>{error}</p>

            <Link to="/login" className="books-login-message-btn">
              Go to Login
            </Link>
          </div>
        )}

        {/* No books */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="books-message">
            <BookOpen size={40} />
            <h3>No books found</h3>
            <p>Try changing your search or category.</p>
          </div>
        )}

        {/* Books grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <section className="books-grid">
            {filteredBooks.map((book) => {
              const isAvailable = book.availableCopies > 0;

              return (
                <article className="book-card" key={book._id}>
                  {/* Book icon */}
                  <div className="book-cover">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                      />
                    ) : (
                      <BookOpen size={50} />
                    )}
                  </div>

                  {/* Book information */}
                  <div className="book-card-content">
                    <span className="book-category">
                      {book.category}
                    </span>

                    <h2>{book.title}</h2>

                    <p className="book-author">
                      by {book.author}
                    </p>

                    <div className="book-meta">
                      <span>
                        {book.availableCopies} / {book.totalCopies}{" "}
                        available
                      </span>

                      <span
                        className={
                          isAvailable
                            ? "book-available"
                            : "book-unavailable"
                        }
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <Link
                      to={`/book/${book._id}`}
                      className="book-details-btn"
                    >
                      View Details
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default Books;