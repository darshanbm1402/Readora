const express = require("express");

const {
  issueBook,
  returnBook,
  getAllBorrows,
  getMyBorrowHistory,
  getIssuedBooks,
  updateOverdueBooks,
  getMyDashboard,
} = require("../controllers/borrowController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Only admins can issue books
router.post("/issue", protect, adminOnly, issueBook);
// Only admins can return books
router.post("/return", protect, adminOnly, returnBook);
// Only admins can view all borrowing records
router.get("/all", protect, adminOnly, getAllBorrows);
// Logged-in student can view their own borrowing history
router.get("/my-history", protect, getMyBorrowHistory);
// Only admins can view currently issued books
router.get("/issued", protect, adminOnly, getIssuedBooks);
// Only admins can update overdue records
router.put("/update-overdue", protect, adminOnly, updateOverdueBooks);

router.get("/my-dashboard", protect, getMyDashboard);

module.exports = router;