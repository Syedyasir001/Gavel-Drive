const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/car.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/cars
// @desc    Get all car listings
router.get('/', getAllCars);

// @route   GET /api/cars/:id
// @desc    Get car details by ID
router.get('/:id', getCarById);

// @route   POST /api/cars
// @desc    Create a new car listing
router.post('/', verifyToken, createCar);

// @route   PUT /api/cars/:id
// @desc    Update car listing
router.put('/:id', optionalAuth, updateCar);

// @route   DELETE /api/cars/:id
// @desc    Delete car listing
router.delete('/:id', optionalAuth, deleteCar);

module.exports = router;
