const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Deposit = require('../models/Deposit');
const { refundAuctionDeposits } = require('./deposit.controller');
const { calculateBidIncrement, calculateMinimumNextBid } = require('../utils/bidTiers');

/**
 * @route   GET /api/bids/auction/:auctionId
 * @desc    Get bid history for a specific auction
 * @access  Public
 */
const getBidsForAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auction: auctionId })
      .populate('bidder', 'name email profilePic')
      .sort({ amount: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/bids
 * @desc    Place a new bid with strict Tiered Bid Increment validation
 * @access  Protected / Authenticated
 */
const placeBid = async (req, res, next) => {
  try {
    const auctionId = req.body.auctionId || req.body.auction;
    const rawAmount = req.body.amount;
    const amount = Number(rawAmount);

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Auction ID is required',
      });
    }

    if (!rawAmount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid positive bid amount',
      });
    }

    // Bidder identifier: prioritize verified req.user, fallback to body bidder
    const bidderId = req.user?._id || req.body.bidder || req.body.bidderId;
    if (!bidderId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication or bidder identifier is required to place a bid',
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: `Auction not found with ID ${auctionId}`,
      });
    }

    // Check auction lifecycle status
    if (auction.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Bidding is closed for this auction',
      });
    }

    const now = Date.now();
    if (auction.endTime && new Date(auction.endTime).getTime() <= now) {
      auction.status = 'ended';
      await auction.save();
      await refundAuctionDeposits(auction._id);
      return res.status(400).json({
        success: false,
        message: 'Auction time has expired. All held deposits have been refunded.',
      });
    }

    // Verify bidder has paid the refundable entry fee deposit
    const heldDeposit = await Deposit.findOne({
      user: bidderId,
      auction: auction._id,
      status: 'held',
    });

    if (!heldDeposit) {
      return res.status(403).json({
        success: false,
        code: 'ENTRY_FEE_REQUIRED',
        message: 'A refundable entry fee deposit of ₹10,000 is required to enter the bidding system for this auction.',
        entryFee: auction.entryFee || 10000,
      });
    }

    // Server-side validation using dynamic tiered increment logic
    const validation = auction.validateBidAmount(amount);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        currentBid: validation.currentBid,
        requiredIncrement: validation.requiredIncrement,
        minimumNextBid: validation.minimumNextBid,
      });
    }

    // Anti-Sniping (Soft-Close Rule): If placed in final 2 minutes, extend by 2 minutes
    const twoMinutesMs = 2 * 60 * 1000;
    if (auction.endTime && new Date(auction.endTime).getTime() - now <= twoMinutesMs) {
      auction.endTime = new Date(now + twoMinutesMs);
    }

    // Create Bid document
    const bid = await Bid.create({
      auction: auction._id,
      bidder: bidderId,
      amount,
    });

    // Update auction current standing bid and winner
    auction.currentBid = amount;
    auction.winner = bidderId;
    if (auction.status === 'upcoming') {
      auction.status = 'live';
    }
    await auction.save();

    await bid.populate('bidder', 'name email profilePic');

    const nextIncrement = calculateBidIncrement(auction.currentBid);
    const nextMinimumBid = calculateMinimumNextBid(auction.currentBid);

    return res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: bid,
      auction: {
        _id: auction._id,
        currentBid: auction.currentBid,
        endTime: auction.endTime,
        nextIncrement,
        nextMinimumBid,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bids/me
 * @desc    Get bids submitted by current user
 * @access  Protected
 */
const getMyBids = async (req, res, next) => {
  try {
    const bidderId = req.user?._id || req.query.bidderId;
    if (!bidderId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized or bidder identifier missing',
      });
    }

    const bids = await Bid.find({ bidder: bidderId })
      .populate('auction')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBidsForAuction,
  placeBid,
  getMyBids,
  calculateBidIncrement,
  calculateMinimumNextBid,
};
