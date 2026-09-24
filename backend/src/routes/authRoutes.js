const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  verifyEmailOTP,
  resendEmailOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-otp", verifyEmailOTP);

router.post("/resend-otp", resendEmailOTP);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

router.get("/protected-test", protect, (req, res) => {
  res.json({
    success: true,
    message: "JWT authentication is working!",
    user: req.user,
  });
});

module.exports = router;