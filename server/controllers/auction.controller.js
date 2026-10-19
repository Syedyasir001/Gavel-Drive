const Auction = require('../models/Auction');
const { refundAuctionDeposits } = require('./deposit.controller');

/**
 * @route   GET /api/auctions
 * @desc    Get all auctions (optionally filtered by ?status=), populate car and seller
 * @access  Public
 */
const getAllAuctions = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by status if provided in query params (e.g. ?status=live)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const auctions = await Auction.find(filter)
      .populate({
        path: 'car',
        populate: {
          path: 'seller',
          select: 'name email profilePic',
        },
      })
      .populate('seller', 'name email profilePic')
      .populate('winner', 'name email profilePic')
      .sort({ createdAt: -1 });

    // Check for expired auctions in background
    const now = Date.now();
    for (const a of auctions) {
      if (a.endTime && new Date(a.endTime).getTime() <= now && a.status !== 'ended') {
        a.status = 'ended';
        await a.save();
        await refundAuctionDeposits(a._id);
      }
    }

    return res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auctions/:id
 * @desc    Get single auction by ID, populate car.images, car.seller, and winner
 * @access  Public
 */
const getAuctionById = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'car',
        populate: {
          path: 'seller',
          select: '-password',
        },
      })
      .populate('seller', '-password')
      .populate('winner', 'name email profilePic');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: `Auction not found with id ${req.params.id}`,
      });
    }

    // Auto-end expired auction and refund held deposits
    if (auction.endTime && new Date(auction.endTime).getTime() <= Date.now() && auction.status !== 'ended') {
      auction.status = 'ended';
      await auction.save();
      await refundAuctionDeposits(auction._id);
    }

    return res.status(200).json({
      success: true,
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

const createAuction = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Create auction endpoint placeholder',
    });
  } catch (error) {
    next(error);
  }
};

const updateAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
    }

    Object.assign(auction, req.body);
    await auction.save();

    if (req.body.status === 'ended') {
      await refundAuctionDeposits(auction._id);
    }

    res.status(200).json({
      success: true,
      message: `Auction ${req.params.id} updated`,
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auctions/:id/end
 * @desc    End an auction and refund all held bidding deposits
 * @access  Public / Protected
 */
const endAuction = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    let auction = null;

    if (require('mongoose').Types.ObjectId.isValid(auctionId)) {
      auction = await Auction.findById(auctionId);
      if (auction) {
        auction.status = 'ended';
        await auction.save();
      }
    }

    const refunded = await refundAuctionDeposits(auctionId);

    return res.status(200).json({
      success: true,
      message: `Auction concluded. ${refunded.length} bidder deposit(s) refunded successfully.`,
      count: refunded.length,
      refundedDeposits: refunded,
      auction,
    });
  } catch (error) {
    next(error);
  }
};

const cancelAuction = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: `Cancel auction ${req.params.id} placeholder`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  endAuction,
  cancelAuction,
};

