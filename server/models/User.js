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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
