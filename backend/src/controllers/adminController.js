const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const User = require("../models/User");

// ======================================================
// GET ALL USERS - ADMIN
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching users",
    });
  }
};

// ======================================================
// GET ADMIN DASHBOARD STATISTICS
// ======================================================

const getDashboardStats = async (req, res) => {
  try {
    const totalBooks =
      await Book.countDocuments();

    const totalStudents =
      await User.countDocuments({
        role: "student",
      });

    const totalIssuedBooks =
      await Borrow.countDocuments({
        status: {
          $in: ["issued", "overdue"],
        },
      });

    const totalReturnedBooks =
      await Borrow.countDocuments({
        status: "returned",
      });

    const totalOverdueBooks =
      await Borrow.countDocuments({
        status: "overdue",
      });

    // Only active/overdue records are considered
    // pending fines.
    const fineResult =
      await Borrow.aggregate([
        {
          $match: {
            status: {
              $in: ["issued", "overdue"],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalFine: {
              $sum: "$fine",
            },
          },
        },
      ]);

    const totalFines =
      fineResult.length > 0
        ? Number(
            fineResult[0].totalFine || 0
          )
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalStudents,
        totalIssuedBooks,
        totalReturnedBooks,
        totalOverdueBooks,
        totalFines,
      },
    });
  } catch (error) {
    console.error(
      "Get dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard statistics",
    });
  }
};

// ======================================================
// DELETE USER - ADMIN
// ======================================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot be deleted",
      });
    }

    const activeBorrow =
      await Borrow.findOne({
        student: id,
        status: {
          $in: ["issued", "overdue"],
        },
      });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this student because they currently have an issued book",
      });
    }

    const Notification =
      require("../models/Notification");

    await Notification.deleteMany({
      user: id,
    });

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting user",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAllUsers,
  getDashboardStats,
  deleteUser,
};