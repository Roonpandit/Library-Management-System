const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY } 
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || "user" });

    const token = generateToken(user);
    res.status(201).json({ message: "User registered successfully", token, role: user.role });
  } catch (err) {
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

    const token = generateToken(user);
    const redirectPath = user.role === "admin" ? "/admin" : "/user";

    res.json({ token, role: user.role, redirectPath });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token expired, please log in again" });

    req.user = decoded;
    next();
  });
};

module.exports = { signup, login, authenticateUser };