const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

// Helper function to generate tokens
const generateTokens = (user) => {
  // Ensure the user object has the required fields
  if (!user._id || !user.role) {
    throw new Error("User object missing required fields");
  }

  // Create access token with user ID and role
  const accessToken = jwt.sign(
    { 
      userId: user._id.toString(), 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );

  // Create refresh token with user ID and role (including role in refresh token)
  const refreshToken = jwt.sign(
    { 
      userId: user._id.toString(),
      role: user.role // Include role in refresh token
    },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Signup request received:", { name, email, role });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role: role || "user" });

    console.log("User created successfully:", { id: user._id, role: user.role });

    const { accessToken, refreshToken } = generateTokens(user);
    
    // Debug token contents
    const decodedAccess = jwt.decode(accessToken);
    console.log("🔹 Access token payload:", decodedAccess);
    
    res.status(201).json({ 
      message: "User registered successfully", 
      accessToken, 
      refreshToken, 
      role: user.role,
      userId: user._id 
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Wrong password" });

    const { accessToken, refreshToken } = generateTokens(user);
    
    // Debug token contents
    const decodedAccess = jwt.decode(accessToken);
    console.log("🔹 Login - Access token payload:", decodedAccess);

    // Determine redirect path based on role
    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";

    res.json({ 
      accessToken, 
      refreshToken, 
      role: user.role,
      userId: user._id,
      redirectPath 
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    console.log("🔹 Refresh token decoded:", decoded);
    
    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.warn("⛔ User not found:", decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Debug new token contents
    const decodedNew = jwt.decode(newAccessToken);
    console.log("🔹 New access token payload:", decodedNew);
    
    // Return new tokens and user info
    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken,
      role: user.role,
      userId: user._id 
    });
  } catch (err) {
    console.error("⛔ Refresh token error:", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = { signup, login, refreshTokenHandler };