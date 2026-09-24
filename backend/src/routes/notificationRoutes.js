const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyNotifications);

router.put("/:id/read", protect, markNotificationAsRead);

router.put("/read-all", protect, markAllNotificationsAsRead);

module.exports = router;