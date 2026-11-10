const express = require('express');
const router = express.Router();
const {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  endAuction,
  cancelAuction,
} = require('../controllers/auction.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/auctions
// @desc    Get all active auctions
router.get('/', getAllAuctions);

// @route   GET /api/auctions/:id
// @desc    Get auction details by ID
router.get('/:id', getAuctionById);

// @route   POST /api/auctions
// @desc    Create a new auction
router.post('/', verifyToken, createAuction);

// @route   PUT /api/auctions/:id
// @desc    Update auction details
router.put('/:id', optionalAuth, updateAuction);

// @route   POST /api/auctions/:id/end
// @desc    End an auction and refund all held deposits
router.post('/:id/end', optionalAuth, endAuction);

// @route   DELETE /api/auctions/:id
// @desc    Cancel an auction
router.delete('/:id', optionalAuth, cancelAuction);

module.exports = router;

