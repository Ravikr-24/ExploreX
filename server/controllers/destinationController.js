const Destination = require("../models/Destination");
const isValidObjectId = require("../utils/validateObjectId");
const escapeRegex = require("../utils/escapeRegex");

// Create destination - Admin only
const createDestination = async (req, res, next) => {
  try {
    const {
      name,
      description,
      location,
      category,
      images,
      attractions,
      activities,
      bestTimeToVisit,
      budget,
    } = req.body;

    // Required fields
    if (
      !name ||
      !description ||
      !location ||
      !category ||
      budget === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, description, location, category and budget are required",
      });
    }

    // Validate budget
    if (typeof budget !== "number" || budget < 0) {
      return res.status(400).json({
        message: "Budget must be a non-negative number",
      });
    }

    const destination = await Destination.create({
      name,
      description,
      location,
      category,
      images: Array.isArray(images) ? images : [],
      attractions: Array.isArray(attractions) ? attractions : [],
      activities: Array.isArray(activities) ? activities : [],
      bestTimeToVisit: bestTimeToVisit || "",
      budget,
    });

    res.status(201).json({
      message: "Destination created successfully",
      destination,
    });
  } catch (error) {
    next(error);
  }
};

// Get all destinations with search/filter
const getDestinations = async (req, res, next) => {
  try {
    const { location, category, maxBudget, minRating } = req.query;

    const filter = {};

    // Location filter
    if (location) {
      const safeLocation = escapeRegex(location);

      filter.location = {
        $regex: safeLocation,
        $options: "i",
      };
    }

    // Category filter
    if (category) {
      const safeCategory = escapeRegex(category);

      filter.category = {
        $regex: safeCategory,
        $options: "i",
      };
    }

    // Maximum budget filter
    if (maxBudget !== undefined) {
      const parsedMaxBudget = Number(maxBudget);

      if (
        !Number.isFinite(parsedMaxBudget) ||
        parsedMaxBudget < 0
      ) {
        return res.status(400).json({
          message: "maxBudget must be a non-negative number",
        });
      }

      filter.budget = {
        $lte: parsedMaxBudget,
      };
    }

    // Minimum rating filter
    if (minRating !== undefined) {
      const parsedMinRating = Number(minRating);

      if (
        !Number.isFinite(parsedMinRating) ||
        parsedMinRating < 0 ||
        parsedMinRating > 5
      ) {
        return res.status(400).json({
          message: "minRating must be between 0 and 5",
        });
      }

      filter.rating = {
        $gte: parsedMinRating,
      };
    }

    const destinations = await Destination.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Destinations fetched successfully",
      count: destinations.length,
      destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Get single destination
const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.status(200).json({
      message: "Destination fetched successfully",
      destination,
    });
  } catch (error) {
    next(error);
  }
};

// Update destination - Admin only
const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    const {
      name,
      description,
      location,
      category,
      images,
      attractions,
      activities,
      bestTimeToVisit,
      budget,
    } = req.body;

    // Validate budget if provided
    if (
      budget !== undefined &&
      (typeof budget !== "number" || budget < 0)
    ) {
      return res.status(400).json({
        message: "Budget must be a non-negative number",
      });
    }

    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    // Update only fields that are provided
    if (name !== undefined) destination.name = name;
    if (description !== undefined)
      destination.description = description;
    if (location !== undefined) destination.location = location;
    if (category !== undefined) destination.category = category;
    if (images !== undefined) destination.images = images;
    if (attractions !== undefined)
      destination.attractions = attractions;
    if (activities !== undefined)
      destination.activities = activities;
    if (bestTimeToVisit !== undefined)
      destination.bestTimeToVisit = bestTimeToVisit;
    if (budget !== undefined) destination.budget = budget;

    await destination.save();

    res.status(200).json({
      message: "Destination updated successfully",
      destination,
    });
  } catch (error) {
    next(error);
  }
};

// Delete destination - Admin only
const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    await Destination.findByIdAndDelete(id);

    res.status(200).json({
      message: "Destination deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};