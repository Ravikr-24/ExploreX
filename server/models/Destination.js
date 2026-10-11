const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Destination-level images
    images: {
      type: [String],
      default: [],
    },

    // Attractions with their own images
    attractions: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          images: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },

    // Activities with their own images
    activities: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          images: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },

    bestTimeToVisit: {
      type: String,
      default: "",
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Destination = mongoose.model(
  "Destination",
  destinationSchema
);

module.exports = Destination;