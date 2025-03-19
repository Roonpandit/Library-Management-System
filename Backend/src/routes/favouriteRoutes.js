const express = require("express");
const User = require("../models/userModel");
const Book = require("../models/bookModel");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

/** 
 * ✅ Add a book to the user's favorites
 */
router.post("/:bookId", verifyToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.userId; // Get user ID from the token

        // Check if the book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Find the user and check if the book is already in their favorites
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If book is already in favorites, return an error
        if (user.favorites.includes(bookId)) {
            return res.status(400).json({ message: "This book is already in your favorites" });
        }

        // Add the book to the user's favorites
        user.favorites.push(bookId);
        await user.save();

        res.status(200).json({ message: "Book added to favorites", favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/** 
 * ✅ Remove a book from the user's favorites
 */
router.delete("/:bookId", verifyToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.userId; // Get user ID from the token

        // Find the user and check if the book is in their favorites
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If the book is not in favorites, return an error
        if (!user.favorites.includes(bookId)) {
            return res.status(400).json({ message: "This book is not in your favorites" });
        }

        // Remove the book from the user's favorites
        user.favorites = user.favorites.filter(id => id.toString() !== bookId);
        await user.save();

        res.status(200).json({ message: "Book removed from favorites", favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/** 
 * ✅ Get all favorite books of the user
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).populate("favorites");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;