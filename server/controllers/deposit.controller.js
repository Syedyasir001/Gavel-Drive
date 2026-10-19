const Deposit = require('../models/Deposit');
const Auction = require('../models/Auction');
const mongoose = require('mongoose');

/**
 * Helper: Refund all held deposits for a specific auction
 * @param {string|mongoose.Types.ObjectId} auctionId
 * @returns {Promise<Array>} List of refunded deposit records
 */
const refundAuctionDeposits = async (auctionId) => {
  try {
    const heldDeposits = await Deposit.find({
      auction: auctionId,
      status: 'held',
    });

    if (!heldDeposits.length) return [];

    const now = new Date();
    const updated = [];

    for (const dep of heldDeposits) {
      dep.status = 'refunded';
      dep.refundedAt = now;
      dep.refundTransactionId = `REF_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await dep.save();
      updated.push(dep);
    }

    return updated;
  } catch (error) {
    console.error(`Error refunding deposits for auction ${auctionId}:`, error);
    return [];
  }
};

/**
 * @route   POST /api/bids/deposit
 * @desc    Pay refundable entry fee to unlock bidding on an auction
 * @access  Private / Protected
 */
const payEntryFee = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to pay bidding deposit',
      });
    }

    const { auctionId, paymentMethod, amount, auctionTitle } = req.body;
    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: 'Auction ID is required',
      });
    }

    // Check if user already has an active held deposit for this auction
    const existingHeld = await Deposit.findOne({
      user: userId,
      auction: auctionId,
      status: 'held',
    });

    if (existingHeld) {
      return res.status(200).json({
        success: true,
        message: 'Bidding entry fee already active and held for this auction',
        hasAccess: true,
        data: existingHeld,
      });
    }

    // Default entry fee is ₹10,000
    const depositAmount = Number(amount) || 10000;
    const pMethod = paymentMethod || {
      brand: 'Visa',
      last4: '4092',
    };

    const transactionId = `TXN_DEP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const deposit = await Deposit.create({
      user: userId,
      auction: auctionId,
      auctionTitle: auctionTitle || '',
      amount: depositAmount,
      status: 'held',
      paymentMethod: pMethod,
      transactionId,
    });

    return res.status(201).json({
      success: true,
      message: `Refundable deposit of ₹${depositAmount.toLocaleString('en-IN')} held successfully. Bidding access unlocked.`,
      hasAccess: true,
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bids/deposit/:auctionId
 * @desc    Get user's entry fee deposit status for an auction
 * @access  Private / Protected (or optional)
 */
const getDepositStatus = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { auctionId } = req.params;

    if (!userId) {
      return res.status(200).json({
        success: true,
        hasAccess: false,
        deposit: null,
      });
    }

    const deposit = await Deposit.findOne({
      user: userId,
      auction: auctionId,
    }).sort({ createdAt: -1 });

    const hasAccess = Boolean(deposit && deposit.status === 'held');

    return res.status(200).json({
      success: true,
      hasAccess,
      deposit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/bids/deposit/:auctionId/refund
 * @desc    Explicitly trigger deposit refunds for an auction (when auction ends)
 * @access  Public or Protected
 */
const triggerAuctionRefund = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const refunded = await refundAuctionDeposits(auctionId);

    // If real MongoDB auction exists, also ensure status is 'ended'
    if (mongoose.Types.ObjectId.isValid(auctionId)) {
      await Auction.findByIdAndUpdate(auctionId, { status: 'ended' });
    }

    return res.status(200).json({
      success: true,
      message: `Refunded ${refunded.length} deposit(s) for auction ${auctionId}`,
      count: refunded.length,
      data: refunded,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bids/deposits/me
 * @desc    Get all bidding deposits made by current authenticated user
 * @access  Private / Protected
 */
const getUserDeposits = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });

    const summary = {
      totalHeld: deposits
        .filter((d) => d.status === 'held')
        .reduce((sum, d) => sum + d.amount, 0),
      totalRefunded: deposits
        .filter((d) => d.status === 'refunded')
        .reduce((sum, d) => sum + d.amount, 0),
      count: deposits.length,
      heldCount: deposits.filter((d) => d.status === 'held').length,
      refundedCount: deposits.filter((d) => d.status === 'refunded').length,
    };

    return res.status(200).json({
      success: true,
      summary,
      data: deposits,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  payEntryFee,
  getDepositStatus,
  triggerAuctionRefund,
  getUserDeposits,
  refundAuctionDeposits,
};
