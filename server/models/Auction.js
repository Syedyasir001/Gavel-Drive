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

module.exports = mongoose.model('Auction', auctionSchema);
