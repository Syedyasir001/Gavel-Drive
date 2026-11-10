const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Deposit = require('../models/Deposit');

/**
 * Generate JSON Web Token
 * @param {string} id - User ID
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, hash password, and return JWT
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, profilePic } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user with unified role (can both bid and auction simultaneously)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
      profilePic: profilePic || '',
    });

    // Generate JWT token
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Verify credentials and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for user and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current authenticated user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, bio, profilePic } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profilePic !== undefined) user.profilePic = profilePic.trim();

    await user.save();

    const sanitized = await User.findById(user._id).select('-password');
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/notifications
 * @desc    Update notification alert preferences
 * @access  Private
 */
const updateNotifications = async (req, res, next) => {
  try {
    const preferences = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Document format validation rules for Indian government IDs.
 * Each entry maps a document type to its regex pattern and a
 * human-readable hint shown when the format is wrong.
 */
const DOCUMENT_VALIDATORS = {
  pan: {
    regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    hint: 'PAN must be 10 characters in the format ABCDE1234F (5 letters, 4 digits, 1 letter).',
  },
  aadhaar: {
    // 12 digits, masked formats like XXXX-XXXX-XXXX, XXXX-XXXX-1234, or [Aadhaar Redacted]
    regex: /^([0-9]{12}|[X\d]{4}[- ]?[X\d]{4}[- ]?[X\d]{4}|\[Aadhaar Redacted\]|XXXX-XXXX-XXXX)$/i,
    hint: 'Aadhaar must be 12 digits or an authorized DigiLocker masked format.',
    sanitize: (v) => v.trim(),
  },
  passport: {
    regex: /^[A-Z][0-9]{7}$/,
    hint: 'Passport must be 1 letter followed by 7 digits (e.g. A1234567).',
  },
  driving_license: {
    // Typical Indian DL: 2-letter state code, optional hyphen, 2-digit RTO,
    // optional hyphen, 4-digit year or 7-digit serial — very loose to cover
    // all state variations (e.g. MH-12-20130001234 or DL0420150001234).
    regex: /^[A-Z]{2}[- ]?\d{2}[- ]?\d{4,13}$/,
    hint: 'Driving license format: state code, RTO number, and serial (e.g. MH-12-20130001234).',
  },
};

/**
 * @route   POST /api/auth/kyc
 * @desc    Submit identity verification (KYC) with document format validation
 * @access  Private
 */
const submitKyc = async (req, res, next) => {
  try {
    const { documentType, documentNumber, legalName } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document type and document number.',
      });
    }

    if (!legalName || !legalName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full legal name as shown on the document.',
      });
    }

    // Validate the document type is one we support
    const validator = DOCUMENT_VALIDATORS[documentType];
    if (!validator) {
      return res.status(400).json({
        success: false,
        message: `Unsupported document type: ${documentType}`,
      });
    }

    // Sanitize (e.g. strip spaces from Aadhaar) and validate format
    const sanitized = validator.sanitize
      ? validator.sanitize(documentNumber.trim().toUpperCase())
      : documentNumber.trim().toUpperCase();

    if (!validator.regex.test(sanitized)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DOCUMENT_FORMAT',
        message: validator.hint,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Server decides the status — never trust the client
    user.verificationStatus = 'verified';
    user.verificationDetails = {
      documentType,
      documentNumber: sanitized,
      legalName: legalName.trim(),
      submittedAt: new Date(),
      verifiedAt: new Date(),
    };

    await user.save();

    const userResponse = await User.findById(user._id).select('-password');
    return res.status(200).json({
      success: true,
      message: 'Identity verified successfully',
      verificationStatus: user.verificationStatus,
      verificationDetails: user.verificationDetails,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/payment-methods
 * @desc    Get user's cards on file
 * @access  Private
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      data: user.paymentMethods || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/payment-methods
 * @desc    Add a payment method card on file
 * @access  Private
 */
const addPaymentMethod = async (req, res, next) => {
  try {
    const { brand, bankName, cardType, last4, expMonth, expYear, cardholderName, isDefault } = req.body;

    if (!last4 || !expMonth || !expYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid card details (last4, expMonth, expYear)',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFirstCard = !user.paymentMethods || user.paymentMethods.length === 0;
    const shouldBeDefault = isDefault || isFirstCard;

    if (shouldBeDefault && user.paymentMethods) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }

    const newPaymentMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brand: brand || 'Visa',
      bankName: bankName || 'Indian Scheduled Bank',
      cardType: cardType || 'Credit Card',
      last4: String(last4).slice(-4),
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      cardholderName: cardholderName || user.name,
      isDefault: shouldBeDefault,
      createdAt: new Date(),
    };

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: user.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/auth/payment-methods/:id
 * @desc    Remove a payment method
 * @access  Private
 */
const deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const deletedCard = user.paymentMethods.find((pm) => pm.id === id);
    user.paymentMethods = user.paymentMethods.filter((pm) => pm.id !== id);

    if (deletedCard?.isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
      data: user.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/auth/payment-methods/:id/default
 * @desc    Set a default payment method
 * @access  Private
 */
const setDefaultPaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.paymentMethods.forEach((pm) => {
      pm.isDefault = pm.id === id;
    });

    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Default payment method updated',
      data: user.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/watchlist
 * @desc    Get user saved vehicles / watchlist
 * @access  Private
 */
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedVehicles',
      populate: [
        { path: 'car' },
        { path: 'seller', select: 'name email profilePic' },
      ],
    });

    return res.status(200).json({
      success: true,
      count: user?.savedVehicles?.length || 0,
      data: user?.savedVehicles || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/watchlist/:auctionId
 * @desc    Toggle auction saved status in user's watchlist
 * @access  Private
 */
const toggleWatchlist = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existsIndex = user.savedVehicles.findIndex(
      (id) => id.toString() === auctionId.toString()
    );

    let isSaved = false;
    if (existsIndex > -1) {
      user.savedVehicles.splice(existsIndex, 1);
      isSaved = false;
    } else {
      user.savedVehicles.push(auctionId);
      isSaved = true;
    }

    await user.save();
    return res.status(200).json({
      success: true,
      isSaved,
      count: user.savedVehicles.length,
      savedVehicles: user.savedVehicles,
      message: isSaved ? 'Vehicle saved to your watchlist' : 'Vehicle removed from your watchlist',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/history
 * @desc    Get comprehensive auction ledger (won, lost, sold, active bids)
 * @access  Private
 */
const getAuctionHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Find all bids placed by user
    const userBids = await Bid.find({ bidder: userId })
      .populate({
        path: 'auction',
        populate: [
          { path: 'car' },
          { path: 'seller', select: 'name email profilePic' },
          { path: 'winner', select: 'name email profilePic' },
        ],
      })
      .sort({ createdAt: -1 });

    const bidsByAuction = {};
    userBids.forEach((bid) => {
      if (bid.auction) {
        const aId = bid.auction._id.toString();
        if (!bidsByAuction[aId]) {
          bidsByAuction[aId] = {
            auction: bid.auction,
            userMaxBid: bid.amount,
            myBids: [bid],
            latestBidTime: bid.createdAt,
          };
        } else {
          bidsByAuction[aId].myBids.push(bid);
          if (bid.amount > bidsByAuction[aId].userMaxBid) {
            bidsByAuction[aId].userMaxBid = bid.amount;
          }
        }
      }
    });

    const activeBids = [];
    const wonAuctions = [];
    const lostAuctions = [];

    Object.values(bidsByAuction).forEach((item) => {
      const auction = item.auction;
      const isEnded = auction.status === 'ended' || (auction.endTime && new Date(auction.endTime).getTime() <= Date.now());
      const isWinner = auction.winner && auction.winner._id && auction.winner._id.toString() === userId.toString();

      if (!isEnded) {
        activeBids.push({
          auction,
          userMaxBid: item.userMaxBid,
          currentBid: auction.currentBid,
          isLeading: Boolean(auction.winner && auction.winner._id && auction.winner._id.toString() === userId.toString()),
          myBidsCount: item.myBids.length,
          latestBidTime: item.latestBidTime,
        });
      } else if (isWinner) {
        wonAuctions.push({
          auction,
          finalAmount: auction.currentBid,
          userMaxBid: item.userMaxBid,
          wonDate: auction.endTime || auction.updatedAt,
        });
      } else {
        lostAuctions.push({
          auction,
          winningBid: auction.currentBid,
          userMaxBid: item.userMaxBid,
          endedDate: auction.endTime || auction.updatedAt,
        });
      }
    });

    // 2. Find auctions listed by user
    const myListings = await Auction.find({ seller: userId })
      .populate('car')
      .populate('winner', 'name email profilePic')
      .sort({ createdAt: -1 });

    const soldVehicles = myListings.filter(
      (a) => (a.status === 'ended' || (a.endTime && new Date(a.endTime).getTime() <= Date.now())) && a.winner
    );

    // 3. User's saved vehicles
    const user = await User.findById(userId).populate({
      path: 'savedVehicles',
      populate: [
        { path: 'car' },
        { path: 'seller', select: 'name email profilePic' },
      ],
    });

    // 4. User's bidding deposits (held and refunded)
    const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      summary: {
        activeBidsCount: activeBids.length,
        wonAuctionsCount: wonAuctions.length,
        lostAuctionsCount: lostAuctions.length,
        soldVehiclesCount: soldVehicles.length,
        myListingsCount: myListings.length,
        savedVehiclesCount: user?.savedVehicles?.length || 0,
        depositsCount: deposits.length,
        depositsHeldCount: deposits.filter((d) => d.status === 'held').length,
        depositsRefundedCount: deposits.filter((d) => d.status === 'refunded').length,
      },
      data: {
        activeBids,
        wonAuctions,
        lostAuctions,
        soldVehicles,
        myListings,
        savedVehicles: user?.savedVehicles || [],
        deposits,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getMe: getProfile, // Alias for backward compatibility
  updateProfile,
  updateNotifications,
  submitKyc,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getWatchlist,
  toggleWatchlist,
  getAuctionHistory,
};
