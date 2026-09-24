const express = require("express");

const {
  getAllUsers,
  getDashboardStats,
  deleteUser,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Only authenticated admins can view all users
router.get("/users", protect, adminOnly, getAllUsers);
// Admin dashboard statistics
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);

router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;