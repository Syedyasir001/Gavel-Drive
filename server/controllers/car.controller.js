const Car = require('../models/Car');

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

const createCar = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Create car endpoint placeholder',
    });
  } catch (error) {
    next(error);
  }
};

const updateCar = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: `Update car ${req.params.id} placeholder`,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCar = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: `Delete car ${req.params.id} placeholder`,
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
