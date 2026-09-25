const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["192.168.1.1"]);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const borrowRoutes = require("./src/routes/borrowRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Readora backend is running successfully!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Readora backend running on http://localhost:${PORT}`);
});