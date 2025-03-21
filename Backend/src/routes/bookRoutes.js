// src/routes/bookRoutes.js
const express = require("express");
const Book = require("../models/bookModel");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const cloudinary = require("../config/cloudinary");
const fs = require('fs');
const path = require('path');

const router = express.Router();

/** 
 * ✅ Create a new book with image (Admin only)
 */
router.post("/", verifyToken, isAdmin, upload.single('image'), async (req, res) => {
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

        // Create book object
        const bookData = { 
            title: title.trim(), 
            author, 
            genre, 
            publicationYear, 
            description 
        };

        // Upload image if provided
        if (req.file) {
            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "book-covers",
                    quality: "auto:best",
                    fetch_format: "auto",
                    crop: "limit",
                    flags: "preserve_transparency"
                });
                
                // Add image data to book
                bookData.image = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
                
                // Remove temporary file
                fs.unlinkSync(req.file.path);
            } catch (uploadError) {
                // Clean up the temporary file in case of error
                if (req.file && req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        const newBook = new Book(bookData);
        await newBook.save();
        
        res.status(201).json({ message: "Book added successfully", book: newBook });
    } catch (error) {
        // Clean up any temporary file in case of other errors
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/** 
 * ✅ Update a book with possible image update (Admin only)
 */
router.put("/:id", verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, author, genre, publicationYear, description } = req.body;

        if (!title || !author || !genre || !publicationYear || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Get the existing book
        const existingBook = await Book.findById(req.params.id);
        if (!existingBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Prepare update data
        const updateData = {
            title: title.trim(),
            author,
            genre,
            publicationYear,
            description
        };

        // Handle image upload if provided
        if (req.file) {
            try {
                // Delete old image if exists
                if (existingBook.image && existingBook.image.publicId) {
                    await cloudinary.uploader.destroy(existingBook.image.publicId);
                }
                
                // Upload new image
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "book-covers",
                    quality: "auto:best",
                    fetch_format: "auto",
                    crop: "limit",
                    flags: "preserve_transparency"
                });
                
                // Update image data
                updateData.image = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
                
                // Remove temporary file
                fs.unlinkSync(req.file.path);
            } catch (uploadError) {
                // Clean up the temporary file in case of error
                if (req.file && req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({ message: "Book updated successfully", book: updatedBook });
    } catch (error) {
        // Clean up any temporary file in case of other errors
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/** 
 * ✅ Delete a book and its image (Admin only)
 */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Delete image from Cloudinary if exists
        if (book.image && book.image.publicId) {
            await cloudinary.uploader.destroy(book.image.publicId);
        }

        // Delete the book
        await Book.findByIdAndDelete(req.params.id);

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/** 
 * ✅ Get all books (Public)
 */
router.get("/", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/** 
 * ✅ Get a single book by ID (Public)
 */
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;