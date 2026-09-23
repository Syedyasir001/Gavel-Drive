const express = require('express');
const router = express.Router();
const {
  getBidsForAuction,
  placeBid,
  getMyBids,
} = require('../controllers/bid.controller');

// @route   GET /api/bids/auction/:auctionId
// @desc    Get bid history for an auction
router.get('/auction/:auctionId', getBidsForAuction);

// @route   POST /api/bids
// @desc    Place a new bid
router.post('/', placeBid);

// @route   GET /api/bids/me
// @desc    Get current user's bids
router.get('/me', getMyBids);

module.exports = router;
