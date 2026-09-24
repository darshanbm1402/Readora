const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");

const DEFAULT_FINE_PER_DAY = 10;
const DEFAULT_ISSUE_PERIOD_DAYS = 14;
const DEFAULT_MAX_BOOKS = 3;

const getSettings = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

const calculateOverdueDays = (dueDate, endDate = new Date()) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const end = new Date(endDate);

  if (end <= due) return 0;

  const difference = end.getTime() - due.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

const calculateFine = (
  dueDate,
  endDate = new Date(),
  finePerDay = DEFAULT_FINE_PER_DAY
) => {
  const overdueDays = calculateOverdueDays(
    dueDate,
    endDate
  );

  return overdueDays * Number(finePerDay);
};

// ISSUE A BOOK - ADMIN
const issueBook = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    if (!studentId || !bookId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and book ID are required",
      });
    }

    const settings = await getSettings();

    if (!settings.libraryEnabled) {
      return res.status(400).json({
        success: false,
        message: "Library system is currently disabled",
      });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Book can only be issued to a student",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({
        success: false,
        message:
          "No copies of this book are currently available",
      });
    }

    const activeBorrowCount = await Borrow.countDocuments({
      student: studentId,
      status: {
        $in: ["issued", "overdue"],
      },
    });

    const maxBooks =
      Number(settings.maxBooks) || DEFAULT_MAX_BOOKS;

    if (activeBorrowCount >= maxBooks) {
      return res.status(400).json({
        success: false,
        message: `Student has reached the maximum limit of ${maxBooks} active book(s)`,
      });
    }

    const existingBorrow = await Borrow.findOne({
      student: studentId,
      book: bookId,
      status: {
        $in: ["issued", "overdue"],
      },
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message:
          "This student already has this book issued",
      });
    }

    const issueDate = new Date();

    const issuePeriod =
      Number(settings.issuePeriod) ||
      DEFAULT_ISSUE_PERIOD_DAYS;

    const dueDate = new Date(issueDate);

    dueDate.setDate(
      dueDate.getDate() + issuePeriod
    );

    const borrow = await Borrow.create({
      student: studentId,
      book: bookId,
      issueDate,
      dueDate,
      status: "issued",
      fine: 0,
    });

    book.availableCopies -= 1;

    await book.save();

    await Notification.create({
      user: studentId,
      title: "Book Issued",
      message: `The book "${book.title}" has been issued to you. Due date: ${dueDate.toDateString()}.`,
      type: "success",
    });

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      borrow,
    });
  } catch (error) {
    console.error("Issue book error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while issuing book",
    });
  }
};

// RETURN A BOOK - ADMIN
const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res.status(400).json({
        success: false,
        message: "Borrow ID is required",
      });
    }

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned",
      });
    }

    const book = await Book.findById(borrow.book);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const settings = await getSettings();

    const returnDate = new Date();

    const overdueDays = calculateOverdueDays(
      borrow.dueDate,
      returnDate
    );

    const fine = calculateFine(
      borrow.dueDate,
      returnDate,
      settings.finePerDay
    );

    borrow.returnDate = returnDate;
    borrow.status = "returned";
    borrow.fine = fine;

    await borrow.save();

    book.availableCopies += 1;

    if (book.availableCopies > book.totalCopies) {
      book.availableCopies = book.totalCopies;
    }

    await book.save();

    let notificationMessage = `The book "${book.title}" has been returned successfully.`;

    if (fine > 0) {
      notificationMessage += ` Your overdue fine is ₹${fine}.`;
    }

    await Notification.create({
      user: borrow.student,
      title:
        fine > 0
          ? "Book Returned - Fine Applied"
          : "Book Returned",
      message: notificationMessage,
      type: fine > 0 ? "fine" : "success",
    });

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      overdueDays,
      fine,
      borrow,
    });
  } catch (error) {
    console.error("Return book error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while returning book",
    });
  }
};

// GET ALL BORROWING RECORDS - ADMIN
const getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate(
        "student",
        "name email rollNumber"
      )
      .populate(
        "book",
        "title author isbn category coverImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    console.error("Get all borrows error:", error);

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching borrowing records",
    });
  }
};

// GET LOGGED-IN STUDENT'S BORROWING HISTORY
const getMyBorrowHistory = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      student: req.user.id,
    })
      .populate(
        "book",
        "title author isbn category coverImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    console.error(
      "Get my borrow history error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching borrowing history",
    });
  }
};

// GET CURRENTLY ISSUED BOOKS - ADMIN
const getIssuedBooks = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      status: {
        $in: ["issued", "overdue"],
      },
    })
      .populate(
        "student",
        "name email rollNumber"
      )
      .populate(
        "book",
        "title author isbn category coverImage"
      )
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    console.error(
      "Get issued books error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching issued books",
    });
  }
};

// UPDATE OVERDUE BORROWING RECORDS - ADMIN
const updateOverdueBooks = async (req, res) => {
  try {
    const settings = await getSettings();

    const now = new Date();

    const overdueBorrows = await Borrow.find({
      status: "issued",
      dueDate: {
        $lt: now,
      },
    }).populate("book", "title");

    let updatedCount = 0;

    for (const borrow of overdueBorrows) {
      const overdueDays = calculateOverdueDays(
        borrow.dueDate,
        now
      );

      const fine = calculateFine(
        borrow.dueDate,
        now,
        settings.finePerDay
      );

      borrow.status = "overdue";
      borrow.fine = fine;

      await borrow.save();

      await Notification.create({
        user: borrow.student,
        title: "Book Overdue",
        message: `The book "${borrow.book.title}" is overdue by ${overdueDays} day(s). Current fine: ₹${fine}.`,
        type: "warning",
      });

      updatedCount += 1;
    }

    const existingOverdueBorrows =
      await Borrow.find({
        status: "overdue",
        dueDate: {
          $lt: now,
        },
      });

    for (const borrow of existingOverdueBorrows) {
      const fine = calculateFine(
        borrow.dueDate,
        now,
        settings.finePerDay
      );

      if (borrow.fine !== fine) {
        borrow.fine = fine;
        await borrow.save();
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Overdue books and fines updated successfully",
      updatedCount,
    });
  } catch (error) {
    console.error(
      "Update overdue books error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating overdue books",
    });
  }
};

// GET STUDENT DASHBOARD
const getMyDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const borrows = await Borrow.find({
      student: studentId,
    })
      .populate(
        "book",
        "title author isbn category coverImage"
      )
      .sort({ createdAt: -1 });

    const activeBorrows = borrows.filter(
      (borrow) =>
        borrow.status === "issued" ||
        borrow.status === "overdue"
    );

    const overdueBorrows = borrows.filter(
      (borrow) => borrow.status === "overdue"
    );

    const totalFines = borrows.reduce(
      (total, borrow) =>
        total + Number(borrow.fine || 0),
      0
    );

    res.status(200).json({
      success: true,
      dashboard: {
        totalBorrowed: borrows.length,
        currentlyBorrowed: activeBorrows.length,
        overdueBooks: overdueBorrows.length,
        totalFines,
        activeBorrows,
        overdueBorrows,
        history: borrows,
      },
    });
  } catch (error) {
    console.error(
      "Get student dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching student dashboard",
    });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getAllBorrows,
  getMyBorrowHistory,
  getIssuedBooks,
  updateOverdueBooks,
  getMyDashboard,
};