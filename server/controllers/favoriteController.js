const Favorite = require("../models/Favorite");
const Destination = require("../models/Destination");
const isValidObjectId = require("../utils/validateObjectId");

// Add favorite
const addFavorite = async (req, res, next) => {
  try {
    const { destinationId } = req.body;

    // Validate destination ID
    if (!destinationId || !isValidObjectId(destinationId)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    // Check duplicate favorite
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      destination: destinationId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: "Destination is already in favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      destination: destinationId,
    });

    res.status(201).json({
      message: "Destination added to favorites",
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.id,
    })
      .populate("destination")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Favorites fetched successfully",
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Remove favorite
const removeFavorite = async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    // Validate destination ID
    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    // Find favorite belonging to current user
    const favorite = await Favorite.findOne({
      user: req.user.id,
      destination: destinationId,
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    res.status(200).json({
      message: "Destination removed from favorites",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};