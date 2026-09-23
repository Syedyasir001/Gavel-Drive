const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/car.controller');

// @route   GET /api/cars
// @desc    Get all car listings
router.get('/', getAllCars);

// @route   GET /api/cars/:id
// @desc    Get car details by ID
router.get('/:id', getCarById);

// @route   POST /api/cars
// @desc    Create a new car listing
router.post('/', createCar);

// @route   PUT /api/cars/:id
// @desc    Update car listing
router.put('/:id', updateCar);

// @route   DELETE /api/cars/:id
// @desc    Delete car listing
router.delete('/:id', deleteCar);

module.exports = router;
