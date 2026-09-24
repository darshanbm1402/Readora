const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getSettings);
router.put("/", protect, adminOnly, updateSettings);

module.exports = router;