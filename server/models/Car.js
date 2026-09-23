const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a car title'],
      trim: true,
    },
    make: {
      type: String,
      required: [true, 'Please add car make'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please add car model'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please add car year'],
    },
    mileage: {
      type: Number,
      required: [true, 'Please add car mileage'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a seller to this car'],
    },
    aiValuation: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', carSchema);
