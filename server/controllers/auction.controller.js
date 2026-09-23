const Auction = require('../models/Auction');

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
    res.status(200).json({
      success: true,
      message: `Update auction ${req.params.id} placeholder`,
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
  cancelAuction,
};
