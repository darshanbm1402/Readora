const Book = require("../models/Book");

// ======================================================
// ADD A NEW BOOK - ADMIN
// ======================================================
const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      totalCopies,
      publishedYear,
      coverImage,
    } = req.body;

    if (
      !title ||
      !author ||
      !isbn ||
      !category ||
      totalCopies === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, author, ISBN, category and total copies are required",
      });
    }

    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    if (totalCopies < 1) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be at least 1",
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      description: description || "",
      totalCopies,
      availableCopies: totalCopies,
      publishedYear: publishedYear || null,
      coverImage: coverImage || "",
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    console.error("Add book error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding book",
    });
  }
};

// ======================================================
// GET ALL BOOKS
// ======================================================
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get all books error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching books",
    });
  }
};

// ======================================================
// GET SINGLE BOOK BY ID
// ======================================================
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Get book by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching book",
    });
  }
};

// ======================================================
// SEARCH BOOKS
// ======================================================
const searchBooks = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const keyword = search.trim();

    const books = await Book.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { isbn: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Search books error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while searching books",
    });
  }
};

// ======================================================
// UPDATE BOOK - ADMIN
// ======================================================
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      author,
      isbn,
      category,
      description,
      totalCopies,
      publishedYear,
      coverImage,
    } = req.body;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({
        isbn,
        _id: { $ne: id },
      });

      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }
    }

    if (totalCopies !== undefined && totalCopies < 1) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be at least 1",
      });
    }

    if (totalCopies !== undefined) {
      const issuedCopies =
        book.totalCopies - book.availableCopies;

      if (totalCopies < issuedCopies) {
        return res.status(400).json({
          success: false,
          message: `Total copies cannot be less than issued copies (${issuedCopies})`,
        });
      }

      book.totalCopies = totalCopies;
      book.availableCopies = totalCopies - issuedCopies;
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (isbn !== undefined) book.isbn = isbn;
    if (category !== undefined) book.category = category;
    if (description !== undefined) book.description = description;
    if (publishedYear !== undefined)
      book.publishedYear = publishedYear;
    if (coverImage !== undefined)
      book.coverImage = coverImage;

    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Update book error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating book",
    });
  }
};

// ======================================================
// DELETE BOOK - ADMIN
// ======================================================
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const issuedCopies =
      book.totalCopies - book.availableCopies;

    if (issuedCopies > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a book while copies are issued",
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting book",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================
module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  searchBooks,
  updateBook,
  deleteBook,
};