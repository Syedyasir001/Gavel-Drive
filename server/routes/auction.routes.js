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

// @route   GET /api/auctions
// @desc    Get all active auctions
router.get('/', getAllAuctions);

// @route   GET /api/auctions/:id
// @desc    Get auction details by ID
router.get('/:id', getAuctionById);

// @route   POST /api/auctions
// @desc    Create a new auction
router.post('/', createAuction);

// @route   PUT /api/auctions/:id
// @desc    Update auction details
router.put('/:id', updateAuction);

// @route   POST /api/auctions/:id/end
// @desc    End an auction and refund all held deposits
router.post('/:id/end', endAuction);

// @route   DELETE /api/auctions/:id
// @desc    Cancel an auction
router.delete('/:id', cancelAuction);

module.exports = router;

