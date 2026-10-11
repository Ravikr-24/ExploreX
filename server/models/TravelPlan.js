const mongoose = require("mongoose");

const travelPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
        required: true,
      },
    ],

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const TravelPlan = mongoose.model(
  "TravelPlan",
  travelPlanSchema
);

module.exports = TravelPlan;