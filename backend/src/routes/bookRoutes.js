
const express = require("express");

const {
  addBook,
  getAllBooks,
  getBookById,
  searchBooks,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Only admins can add books
router.post("/add", protect, adminOnly, addBook);

// Only admins can update books
router.put("/:id", protect, adminOnly, updateBook);

// Only admins can delete books
router.delete("/:id", protect, adminOnly, deleteBook);

// Search books
router.get("/search", protect, searchBooks);

router.get("/:id", protect, getBookById);

// Authenticated users can view all books
router.get("/", protect, getAllBooks);



module.exports = router;