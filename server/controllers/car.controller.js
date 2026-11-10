const Car = require('../models/Car');
const User = require('../models/User');

/**
 * @route   GET /api/cars
 * @desc    Get all cars, populate seller name
 * @access  Public
 */
const getAllCars = async (req, res, next) => {
  try {
    const cars = await Car.find().populate('seller', 'name email profilePic');
    return res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/cars/:id
 * @desc    Get single car with full seller info (no password)
 * @access  Public
 */
const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('seller', '-password');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car not found with id ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/cars
 * @desc    Create a new car listing and persist to MongoDB
 * @access  Private / Optional Auth
 */
const createCar = async (req, res, next) => {
  try {
    const {
      title,
      make,
      model,
      year,
      mileage,
      description,
      images,
      specs,
      aiValuation,
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a car title',
      });
    }

    if (!make || !make.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a car make',
      });
    }

    if (!model || !model.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a car model',
      });
    }

    if (year === undefined || year === null || isNaN(Number(year))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid car year',
      });
    }

    if (mileage === undefined || mileage === null || isNaN(Number(mileage))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid car mileage',
      });
    }

    // Resolve seller: authenticated user -> body seller -> fallback user in DB
    let seller = req.user?._id || req.body.seller;
    if (!seller) {
      const defaultUser = await User.findOne();
      if (defaultUser) {
        seller = defaultUser._id;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to list a car.',
        });
      }
    }

    // Default image if none provided
    const carImages =
      Array.isArray(images) && images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'];

    const formattedSpecs =
      specs && specs.trim()
        ? specs.trim()
        : `${year} • ${make.trim()} • ${model.trim()}`;

    const car = await Car.create({
      title: title.trim(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      mileage: Number(mileage),
      description: description ? description.trim() : '',
      images: carImages,
      specs: formattedSpecs,
      seller,
      aiValuation: aiValuation !== undefined ? Number(aiValuation) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Car listing created successfully',
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/cars/:id
 * @desc    Update an existing car listing
 * @access  Private / Optional Auth
 */
const updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car not found with id ${req.params.id}`,
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: `Car ${req.params.id} updated successfully`,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/cars/:id
 * @desc    Delete a car listing
 * @access  Private / Optional Auth
 */
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car not found with id ${req.params.id}`,
      });
    }

    await car.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Car ${req.params.id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
