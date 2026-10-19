const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user reference'],
    },
    auction: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please provide an auction reference'],
    },
    auctionTitle: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide deposit amount'],
      default: 10000,
      min: [0, 'Deposit amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['held', 'refunded'],
      default: 'held',
    },
    paymentMethod: {
      id: { type: String, default: '' },
      brand: { type: String, default: 'Visa' },
      last4: { type: String, default: '4092' },
    },
    transactionId: {
      type: String,
      required: true,
    },
    refundTransactionId: {
      type: String,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by user and auction
depositSchema.index({ user: 1, auction: 1 });
depositSchema.index({ auction: 1, status: 1 });

module.exports = mongoose.model('Deposit', depositSchema);
