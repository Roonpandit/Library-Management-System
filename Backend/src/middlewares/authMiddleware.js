const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No Token Provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Session Expired. Please log in again." });
    }

    console.log("✅ Decoded Token:", decoded); // Log the token payload
    req.user = decoded; // Store decoded user data in request
    next();
  });
};

// Middleware to restrict access to admin users
const isAdmin = (req, res, next) => {
  console.log("🔹 Checking admin access. User role:", req.user?.role);

  if (!req.user || req.user.role !== "admin") {
    console.warn("⛔ Access denied. User role:", req.user?.role);
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Middleware to restrict access to regular users
const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "User access required" });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isUser };