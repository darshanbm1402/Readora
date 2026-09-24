import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  User,
  Tag,
  Library,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import "./BookDetails.css";

const BookDetails = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/books/${id}`);

        if (response.data.success) {
          setBook(response.data.book);
        } else {
          setError(response.data.message || "Book not found");
        }
      } catch (error) {
        console.error("Fetch book details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load book details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="book-details-page">
        <div className="book-not-found">
          <Loader2 size={42} className="animate-spin" />
          <h2>Loading Book...</h2>
          <p>Please wait while we load the book details.</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-details-page">
        <div className="book-not-found">
          <AlertCircle size={42} />
          <h2>Book Not Found</h2>
          <p>{error || "The book you're looking for doesn't exist."}</p>

          <Link to="/books" className="book-back-button">
            <ArrowLeft size={17} />
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="book-details-page">
      {/* Header */}
      <header className="details-header">
        <div className="details-header-inner">
          <Link to="/" className="details-logo">
            <div className="details-logo-icon">
              <BookOpen size={22} />
            </div>
            <span>Readora</span>
          </Link>

          <Link to="/books" className="details-header-books">
            Browse Books
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="details-main">
        <Link to="/books" className="details-back">
          <ArrowLeft size={17} />
          Back to Books
        </Link>

        <section className="details-card">
          {/* Book Cover */}
          <div className="details-cover-section">
            <div className="details-cover">
              <BookOpen size={64} />
              <span>READORA</span>
            </div>

            <div className="details-security">
              <ShieldCheck size={17} />
              <span>Library managed collection</span>
            </div>
          </div>

          {/* Information */}
          <div className="details-content">
            <span className="details-category">
              {book.category}
            </span>

            <h1>{book.title}</h1>

            <div className="details-author">
              <User size={18} />
              <span>Written by</span>
              <strong>{book.author}</strong>
            </div>

            <p className="details-description">
              {book.description || "No description available."}
            </p>

            <div className="details-info-grid">
              <div className="details-info-item">
                <Tag size={19} />
                <div>
                  <span>Category</span>
                  <strong>{book.category}</strong>
                </div>
              </div>

              <div className="details-info-item">
                <CalendarDays size={19} />
                <div>
                  <span>Published</span>
                  <strong>
                    {book.publishedYear || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="details-info-item">
                <Library size={19} />
                <div>
                  <span>Copies</span>
                  <strong>{book.availableCopies}</strong>
                </div>
              </div>

              <div className="details-info-item">
                <CheckCircle2 size={19} />
                <div>
                  <span>Status</span>
                  <strong
                    className={
                      isAvailable
                        ? "details-available"
                        : "details-unavailable"
                    }
                  >
                    {isAvailable ? "Available" : "Issued"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="details-action">
              {isAvailable ? (
                <Link
                  to="/login"
                  className="issue-book-button"
                >
                  Issue This Book
                  <BookOpen size={18} />
                </Link>
              ) : (
                <button
                  className="issue-book-button disabled"
                  disabled
                >
                  Currently Unavailable
                </button>
              )}

              <p>
                Login to your Readora account to issue a book.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookDetails;
