const express = require('express');
require('dotenv').config();
const cors = require('cors');
require('./src/config/db'); // Database connection
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const favoriteRoutes = require('./src/routes/favouriteRoutes');

const app = express();

// ✅ Configure CORS for development and production
app.use(cors({
    origin: [
        "http://localhost:5173", // Development
        "https://book-and-author.vercel.app/" // Production
    ],
    credentials: true
}));

app.use(express.json());

// ✅ API Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/favorites', favoriteRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;