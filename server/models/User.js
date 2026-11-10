const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      default: 'user',
    },
    profilePic: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    verificationDetails: {
      documentType: { type: String, default: '' },
      documentNumber: { type: String, default: '' },
      legalName: { type: String, default: '' },
      submittedAt: { type: Date },
      verifiedAt: { type: Date },
    },
    paymentMethods: [
      {
        id: { type: String, required: true },
        brand: { type: String, default: 'Visa' },
        bankName: { type: String, default: 'Indian Scheduled Bank' },
        cardType: { type: String, default: 'Credit Card' },
        last4: { type: String, required: true },
        expMonth: { type: Number, required: true },
        expYear: { type: Number, required: true },
        cardholderName: { type: String, default: '' },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notificationPreferences: {
      outbidAlerts: { type: Boolean, default: true },
      endingSoonAlerts: { type: Boolean, default: true },
      newAuctionAlerts: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
    },
    kycPending: {
      requestId: { type: String, default: '' },
      documentType: { type: String, default: '' },
      documentNumber: { type: String, default: '' },
      fullName: { type: String, default: '' },
    },
    savedVehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
