const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getMe,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// @route   POST /api/auth/register
// @desc    Register a new user & get JWT token
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current authenticated user profile (no password)
// @access  Private
router.get('/profile', verifyToken, getProfile);

// @route   GET /api/auth/me (alias for backward compatibility)
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', verifyToken, getMe);

module.exports = router;
