import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  IndianRupee,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import "./MyBooks.css";

const MyBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/borrow/my-history");

        if (response.data.success) {
          setBorrowedBooks(response.data.borrows);
        } else {
          setError(
            response.data.message ||
              "Unable to load your books."
          );
        }
      } catch (err) {
        console.error("Failed to fetch my books:", err);

        if (err.response?.status === 401) {
          setError("Please login to view your books.");
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

    fetchMyBooks();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    if (status === "overdue") return "Overdue";
    if (status === "returned") return "Returned";
    return "Active";
  };

  return (
    <div className="my-books-page">
      <header className="my-books-header">
        <div className="my-books-header-inner">
          <Link to="/" className="my-books-logo">
            <div className="my-books-logo-icon">
              <BookOpen size={22} />
            </div>
            <span>Readora</span>
          </Link>

          <Link to="/books" className="my-books-browse">
            Browse Books
          </Link>
        </div>
      </header>

      <main className="my-books-main">
        <Link to="/user/dashboard" className="my-books-back">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <section className="my-books-heading">
          <div>
            <span className="my-books-label">
              STUDENT LIBRARY
            </span>

            <h1>My Books</h1>

            <p>
              View your currently issued books, due dates, and
              fine details.
            </p>
          </div>

          <div className="my-books-count">
            <BookOpen size={21} />

            <div>
              <strong>
  {
    borrowedBooks.filter(
      (book) =>
        book.status === "issued" ||
        book.status === "overdue"
    ).length
  }
</strong>
<span>Currently Issued</span>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="my-books-empty-note">
            <Loader2 size={22} className="loading-spinner" />
            <p>Loading your books...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="my-books-empty-note">
            <AlertCircle size={22} />
            <p>{error}</p>
          </div>
        )}

        {/* No books */}
        {!loading && !error && borrowedBooks.length === 0 && (
          <section className="my-books-empty-note">
            <BookOpen size={20} />
            <p>
              You have no borrowing records yet.
            </p>
          </section>
        )}

        {/* Borrowing records */}
        {!loading && !error && borrowedBooks.length > 0 && (
          <section className="my-books-list">
            {borrowedBooks.map((borrow) => {
              const status = getStatusLabel(borrow.status);

              return (
                <article
                  className="my-book-card"
                  key={borrow._id}
                >
                  <div className="my-book-cover">
                    {borrow.book?.coverImage ? (
                      <img
                        src={borrow.book.coverImage}
                        alt={borrow.book.title}
                      />
                    ) : (
                      <>
                        <BookOpen size={42} />
                        <span>READORA</span>
                      </>
                    )}
                  </div>

                  <div className="my-book-content">
                    <div className="my-book-top">
                      <div>
                        <span className="my-book-category">
                          {borrow.book?.category ||
                            "ISSUED BOOK"}
                        </span>

                        <h2>
                          {borrow.book?.title ||
                            "Unknown Book"}
                        </h2>

                        <p className="my-book-author">
                          by{" "}
                          {borrow.book?.author ||
                            "Unknown Author"}
                        </p>
                      </div>

                      <span
                        className={`my-book-status ${
                          status === "Active"
                            ? "status-active"
                            : status === "Overdue"
                            ? "status-overdue"
                            : "status-returned"
                        }`}
                      >
                        {status === "Active" ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Clock3 size={15} />
                        )}

                        {status}
                      </span>
                    </div>

                    <div className="my-book-details">
                      <div className="my-book-detail">
                        <CalendarDays size={18} />

                        <div>
                          <span>Issued Date</span>
                          <strong>
                            {formatDate(borrow.issueDate)}
                          </strong>
                        </div>
                      </div>

                      <div className="my-book-detail">
                        <Clock3 size={18} />

                        <div>
                          <span>Due Date</span>
                          <strong>
                            {formatDate(borrow.dueDate)}
                          </strong>
                        </div>
                      </div>

                      <div className="my-book-detail">
                        <IndianRupee size={18} />

                        <div>
                          <span>Current Fine</span>
                          <strong>
                            ₹{borrow.fine || 0}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-book-footer">
                      <span>
                        {status === "Active"
                          ? "Please return this book before the due date."
                          : status === "Overdue"
                          ? "This book is overdue. Please return it."
                          : "This book has been returned."}
                      </span>

                      {borrow.book?._id && (
                        <Link
                          to={`/book/${borrow.book._id}`}
                          className="my-book-view"
                        >
                          View Book
                        </Link>
                      )}
                    </div>
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

export default MyBooks;
