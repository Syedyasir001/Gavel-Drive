const Auction = require('../models/Auction');
const Car = require('../models/Car');
const User = require('../models/User');
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

/**
 * @route   POST /api/auctions
 * @desc    Create a new auction and persist to MongoDB
 * @access  Private / Optional Auth
 */
const createAuction = async (req, res, next) => {
  try {
    const {
      car,
      startPrice,
      endTime,
      startTime,
      currentBid,
      seller,
      status,
    } = req.body;

    if (!car) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a car reference',
      });
    }

    if (startPrice === undefined || startPrice === null || isNaN(Number(startPrice))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid starting price',
      });
    }

    if (!endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an auction end time',
      });
    }

    // Verify car exists
    const carDoc = await Car.findById(car);
    if (!carDoc) {
      return res.status(404).json({
        success: false,
        message: `Car not found with id ${car}`,
      });
    }

    // Resolve seller: token user -> body seller -> car seller -> fallback user in DB
    let auctionSeller = req.user?._id || seller || carDoc.seller;
    if (!auctionSeller) {
      const defaultUser = await User.findOne();
      if (defaultUser) {
        auctionSeller = defaultUser._id;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to create an auction.',
        });
      }
    }

    const parsedStartTime = startTime ? new Date(startTime) : new Date();
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedEndTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid auction end time date',
      });
    }

    if (parsedEndTime <= parsedStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Auction end time must be after the start time',
      });
    }

    const parsedStartPrice = Number(startPrice);
    const initialBid =
      currentBid !== undefined && !isNaN(Number(currentBid))
        ? Number(currentBid)
        : parsedStartPrice;

    // Status resolution
    let auctionStatus = status;
    const now = Date.now();
    if (!auctionStatus) {
      if (parsedEndTime.getTime() <= now) {
        auctionStatus = 'ended';
      } else if (parsedStartTime.getTime() <= now) {
        auctionStatus = 'live';
      } else {
        auctionStatus = 'upcoming';
      }
    }

    const auction = await Auction.create({
      car: carDoc._id,
      seller: auctionSeller,
      startPrice: parsedStartPrice,
      currentBid: initialBid,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      status: auctionStatus,
    });

    await auction.populate([
      {
        path: 'car',
        populate: {
          path: 'seller',
          select: 'name email profilePic',
        },
      },
      {
        path: 'seller',
        select: 'name email profilePic',
      },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: auction,
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
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: `Auction not found with id ${req.params.id}`,
      });
    }

    auction.status = 'ended';
    await auction.save();
    const refunded = await refundAuctionDeposits(auction._id);

    return res.status(200).json({
      success: true,
      message: `Auction ${req.params.id} cancelled successfully`,
      refundedDeposits: refunded,
      data: auction,
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

