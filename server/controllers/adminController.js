const User = require("../models/User");
const Destination = require("../models/Destination");
const Review = require("../models/Review");
const TravelPlan = require("../models/TravelPlan");

// Get dashboard statistics - Admin only
const getDashboardStats = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const destinations = await Destination.countDocuments();
    const reviews = await Review.countDocuments();
    const travelPlans = await TravelPlan.countDocuments();

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats: {
        users,
        destinations,
        reviews,
        travelPlans,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};