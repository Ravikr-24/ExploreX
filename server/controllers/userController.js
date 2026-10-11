const User = require("../models/User");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");
const TravelPlan = require("../models/TravelPlan");

const isValidObjectId = require("../utils/validateObjectId");

// Get all users - Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user - Admin only
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate User ID
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    // Delete user's reviews
    await Review.deleteMany({
      user: userId,
    });

    // Delete user's favorites
    await Favorite.deleteMany({
      user: userId,
    });

    // Delete user's travel plans
    await TravelPlan.deleteMany({
      user: userId,
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};