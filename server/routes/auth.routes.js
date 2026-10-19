const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getMe,
  updateProfile,
  updateNotifications,
  submitKyc,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getWatchlist,
  toggleWatchlist,
  getAuctionHistory,
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

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, updateProfile);

// @route   PUT /api/auth/notifications
// @desc    Update notification alert preferences
// @access  Private
router.put('/notifications', verifyToken, updateNotifications);

// @route   POST /api/auth/kyc
// @desc    Submit identity verification (KYC)
// @access  Private
router.post('/kyc', verifyToken, submitKyc);

// @route   GET /api/auth/payment-methods
// @desc    Get user's cards on file
// @access  Private
router.get('/payment-methods', verifyToken, getPaymentMethods);

// @route   POST /api/auth/payment-methods
// @desc    Add a payment method card on file
// @access  Private
router.post('/payment-methods', verifyToken, addPaymentMethod);

// @route   DELETE /api/auth/payment-methods/:id
// @desc    Remove a payment method
// @access  Private
router.delete('/payment-methods/:id', verifyToken, deletePaymentMethod);

// @route   PATCH /api/auth/payment-methods/:id/default
// @desc    Set default payment method
// @access  Private
router.patch('/payment-methods/:id/default', verifyToken, setDefaultPaymentMethod);

// @route   GET /api/auth/watchlist
// @desc    Get saved vehicles
// @access  Private
router.get('/watchlist', verifyToken, getWatchlist);

// @route   POST /api/auth/watchlist/:auctionId
// @desc    Toggle saved vehicle
// @access  Private
router.post('/watchlist/:auctionId', verifyToken, toggleWatchlist);

// @route   GET /api/auth/history
// @desc    Get full auction history and ledger (won, lost, sold, active bids)
// @access  Private
router.get('/history', verifyToken, getAuctionHistory);

// @route   GET /api/auth/me (alias for backward compatibility)
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', verifyToken, getMe);

module.exports = router;
