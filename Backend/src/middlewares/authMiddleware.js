
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access Denied: No Token Provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or Expired Token" });

    console.log("✅ Decoded Token:", user); // Log the token payload
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  console.log("🔹 Checking admin access. User role:", req.user?.role); // Log user role

  if (!req.user || req.user.role !== "admin") {
    console.warn("⛔ Access denied. User role:", req.user?.role);
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "User access required" });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isUser };