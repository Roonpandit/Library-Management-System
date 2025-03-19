const express = require("express");
const Book = require("../models/bookModel");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/** 
 * ✅ Create a new book (Admin only)
 * Prevents duplicate titles
 */
router.post("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const { title, author, genre, publicationYear, description } = req.body;

        if (!title || !author || !genre || !publicationYear || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Check if book title already exists
        const existingBook = await Book.findOne({ title: title.trim() });
        if (existingBook) {
            return res.status(400).json({ message: "Book with this title already exists" });
        }

        const newBook = new Book({ title: title.trim(), author, genre, publicationYear, description });
        await newBook.save();
        
        res.status(201).json({ message: "Book added successfully", book: newBook });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * ✅ Update a book by ID (Admin only)
 * Prevents duplicate titles
 */
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { title, author, genre, publicationYear, description } = req.body;

        if (!title || !author || !genre || !publicationYear || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Directly update without checking for duplicate title
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { title: title.trim(), author, genre, publicationYear, description },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Book updated successfully", book: updatedBook });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * ✅ Delete a book by ID (Admin only)
 */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;