const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Please provide a car reference'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startPrice: {
      type: Number,
      required: [true, 'Please provide a start price'],
      min: [0, 'Start price cannot be negative'],
    },
    currentBid: {
      type: Number,
      min: [0, 'Current bid cannot be negative'],
      default: function () {
        return this.startPrice;
      },
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide an auction start time'],
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide an auction end time'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'upcoming',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure currentBid defaults to startPrice if not explicitly provided
auctionSchema.pre('validate', function (next) {
  if (this.currentBid === undefined || this.currentBid === null) {
    this.currentBid = this.startPrice;
  }
  next();
});

const { calculateBidIncrement, calculateMinimumNextBid } = require('../utils/bidTiers');

// Instance methods for tiered increment calculations
auctionSchema.methods.calculateBidIncrement = function () {
  const current = Number(this.currentBid ?? this.startPrice ?? 0);
  return calculateBidIncrement(current);
};

auctionSchema.methods.calculateMinimumNextBid = function () {
  const current = Number(this.currentBid ?? this.startPrice ?? 0);
  return calculateMinimumNextBid(current);
};

auctionSchema.methods.validateBidAmount = function (amount) {
  const current = Number(this.currentBid ?? this.startPrice ?? 0);
  const increment = calculateBidIncrement(current);
  const minRequired = calculateMinimumNextBid(current);
  const numAmount = Number(amount);

  if (!numAmount || isNaN(numAmount)) {
    return { valid: false, message: 'Bid amount must be a valid number' };
  }
  if (numAmount < minRequired) {
    return {
      valid: false,
      message: `Bid amount must be at least ₹${minRequired.toLocaleString('en-IN')} (minimum increment of ₹${increment.toLocaleString('en-IN')})`,
      currentBid: current,
      requiredIncrement: increment,
      minimumNextBid: minRequired,
    };
  }
  return { valid: true, minimumNextBid: minRequired, increment };
};

// Static methods
auctionSchema.statics.calculateBidIncrement = calculateBidIncrement;
auctionSchema.statics.calculateMinimumNextBid = calculateMinimumNextBid;

module.exports = mongoose.model('Auction', auctionSchema);
