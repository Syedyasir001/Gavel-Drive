const express = require('express');
const router = express.Router();
const {
  getBidsForAuction,
  placeBid,
  getMyBids,
} = require('../controllers/bid.controller');

const {
  payEntryFee,
  getDepositStatus,
  triggerAuctionRefund,
  getUserDeposits,
} = require('../controllers/deposit.controller');

const { verifyToken } = require('../middleware/auth.middleware');

// Middleware to extract user from token if Authorization header present
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// @route   POST /api/bids/deposit
// @desc    Pay refundable entry fee deposit to unlock bidding on an auction
router.post('/deposit', verifyToken, payEntryFee);

// @route   GET /api/bids/deposit/:auctionId
// @desc    Get user's deposit status for an auction
router.get('/deposit/:auctionId', optionalAuth, getDepositStatus);

// @route   POST /api/bids/deposit/:auctionId/refund
// @desc    Trigger refunds for all held deposits on an auction
router.post('/deposit/:auctionId/refund', triggerAuctionRefund);

// @route   GET /api/bids/deposits/me
// @desc    Get all bidding deposits made by current user
router.get('/deposits/me', verifyToken, getUserDeposits);

// @route   GET /api/bids/auction/:auctionId
// @desc    Get bid history for an auction
router.get('/auction/:auctionId', getBidsForAuction);

// @route   POST /api/bids
// @desc    Place a new bid
router.post('/', optionalAuth, placeBid);

// @route   GET /api/bids/me
// @desc    Get current user's bids
router.get('/me', verifyToken, getMyBids);

module.exports = router;

