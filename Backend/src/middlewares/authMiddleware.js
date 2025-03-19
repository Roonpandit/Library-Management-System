const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded); // Log the entire decoded token
    
    // Ensure the role is extracted correctly
    if (!decoded.userId) {
      return res.status(403).json({ message: "Invalid Token Structure" });
    }
    
    req.user = decoded; // Store the entire decoded token
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

const isAdmin = (req, res, next) => {
  // Debug role information
  console.log("🔹 Checking admin access. User:", req.user);
  console.log("🔹 Role from token:", req.user?.role);

  if (!req.user) {
    console.warn("⛔ Access denied. No user found in request.");
    return res.status(403).json({ message: "Admin access required" });
  }
  
  if (req.user.role !== "admin") {
    console.warn(`⛔ Access denied. User role: ${req.user.role} (expected: admin)`);
    return res.status(403).json({ message: "Admin access required" });
  }
  
  console.log("✅ Admin access granted.");
  next();
};

const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "User access required" });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isUser };