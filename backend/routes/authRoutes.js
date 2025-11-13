// routes/authRoutes.js (Example of the new structure)
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
} = require('../controllers/authController');

// A single registration route
router.post('/register', register);

// Login and logout routes remain the same
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;