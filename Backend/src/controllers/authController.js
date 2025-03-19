const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Signup request received:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role: role || "user" });

    console.log("User created successfully:", user);

    const { accessToken, refreshToken } = generateTokens(user);
    res.status(201).json({ message: "User registered successfully", accessToken, refreshToken, role: user.role });
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

    // ✅ Determine redirect path based on role
    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";

    res.json({ accessToken, refreshToken, role: user.role, redirectPath });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    
    // ✅ Fetch user role from DB using userId from decoded token
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role }, // ✅ Include role
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken: newAccessToken, role: user.role }); // ✅ Return role
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = { signup, login, refreshTokenHandler };