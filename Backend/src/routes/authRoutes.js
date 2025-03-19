const express = require('express');
const { signup, login } = require('../controllers/authController');
const { verifyToken, isAdmin, isUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// ✅ Protected routes based on roles
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

router.get('/user', verifyToken, isUser, (req, res) => {
  res.json({ message: "Welcome, User!" });
});

module.exports = router;