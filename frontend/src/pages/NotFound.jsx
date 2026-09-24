import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Home, Search } from "lucide-react";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-logo">
          <div className="not-found-logo-icon">
            <BookOpen size={24} />
          </div>
          <span>Readora</span>
        </div>

        <div className="not-found-icon">
          <Search size={38} />
        </div>

        <span className="not-found-code">404</span>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-home-button">
            <Home size={17} />
            Go to Home
          </Link>

          <Link to="/books" className="not-found-books-button">
            <BookOpen size={17} />
            Browse Books
          </Link>
        </div>

        <Link to="/" className="not-found-back">
          <ArrowLeft size={15} />
          Back to Readora
        </Link>
      </div>
    </div>
  );
};

export default NotFound;