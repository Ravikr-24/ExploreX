const TravelPlan = require("../models/TravelPlan");
const Destination = require("../models/Destination");
const isValidObjectId = require("../utils/validateObjectId");

// Create travel plan
const createTravelPlan = async (req, res, next) => {
  try {
    const {
      title,
      destinations,
      startDate,
      endDate,
      budget,
      notes,
    } = req.body;

    // Validate title
    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    // Validate destinations array
    if (
      !Array.isArray(destinations) ||
      destinations.length === 0
    ) {
      return res.status(400).json({
        message: "At least one destination is required",
      });
    }

    // Validate destination IDs
    for (const destinationId of destinations) {
      if (!isValidObjectId(destinationId)) {
        return res.status(400).json({
          message: "Invalid destination ID",
        });
      }
    }

    // Check destinations exist
    const destinationCount = await Destination.countDocuments({
      _id: { $in: destinations },
    });

    if (destinationCount !== destinations.length) {
      return res.status(404).json({
        message: "One or more destinations not found",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      !startDate ||
      !endDate ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Valid start date and end date are required",
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    // Validate budget
    if (
      typeof budget !== "number" ||
      !Number.isFinite(budget) ||
      budget < 0
    ) {
      return res.status(400).json({
        message: "Budget must be a non-negative number",
      });
    }

    const travelPlan = await TravelPlan.create({
      user: req.user.id,
      title: title.trim(),
      destinations,
      startDate: start,
      endDate: end,
      budget,
      notes:
        typeof notes === "string"
          ? notes.trim()
          : "",
    });

    res.status(201).json({
      message: "Travel plan created successfully",
      travelPlan,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's travel plans
const getTravelPlans = async (req, res, next) => {
  try {
    const travelPlans = await TravelPlan.find({
      user: req.user.id,
    })
      .populate("destinations")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Travel plans fetched successfully",
      count: travelPlans.length,
      travelPlans,
    });
  } catch (error) {
    next(error);
  }
};

// Update own travel plan
const updateTravelPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // Validate plan ID
    if (!isValidObjectId(planId)) {
      return res.status(400).json({
        message: "Invalid travel plan ID",
      });
    }

    const {
      title,
      destinations,
      startDate,
      endDate,
      budget,
      notes,
    } = req.body;

    const travelPlan = await TravelPlan.findById(planId);

    if (!travelPlan) {
      return res.status(404).json({
        message: "Travel plan not found",
      });
    }

    // Ownership check
    if (travelPlan.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own travel plan",
      });
    }

    // Validate title
    if (
      title !== undefined &&
      (typeof title !== "string" ||
        title.trim().length === 0)
    ) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    // Validate destinations
    if (destinations !== undefined) {
      if (
        !Array.isArray(destinations) ||
        destinations.length === 0
      ) {
        return res.status(400).json({
          message: "At least one destination is required",
        });
      }

      for (const destinationId of destinations) {
        if (!isValidObjectId(destinationId)) {
          return res.status(400).json({
            message: "Invalid destination ID",
          });
        }
      }

      const destinationCount =
        await Destination.countDocuments({
          _id: { $in: destinations },
        });

      if (destinationCount !== destinations.length) {
        return res.status(404).json({
          message: "One or more destinations not found",
        });
      }

      travelPlan.destinations = destinations;
    }

    // Validate dates
    const newStartDate =
      startDate !== undefined
        ? new Date(startDate)
        : travelPlan.startDate;

    const newEndDate =
      endDate !== undefined
        ? new Date(endDate)
        : travelPlan.endDate;

    if (
      Number.isNaN(newStartDate.getTime()) ||
      Number.isNaN(newEndDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid start date or end date",
      });
    }

    if (newStartDate > newEndDate) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    // Validate budget
    if (
      budget !== undefined &&
      (typeof budget !== "number" ||
        !Number.isFinite(budget) ||
        budget < 0)
    ) {
      return res.status(400).json({
        message: "Budget must be a non-negative number",
      });
    }

    if (title !== undefined) {
      travelPlan.title = title.trim();
    }

    if (startDate !== undefined) {
      travelPlan.startDate = newStartDate;
    }

    if (endDate !== undefined) {
      travelPlan.endDate = newEndDate;
    }

    if (budget !== undefined) {
      travelPlan.budget = budget;
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          message: "Notes must be a string",
        });
      }

      travelPlan.notes = notes.trim();
    }

    await travelPlan.save();

    res.status(200).json({
      message: "Travel plan updated successfully",
      travelPlan,
    });
  } catch (error) {
    next(error);
  }
};

// Delete own travel plan
const deleteTravelPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // Validate plan ID
    if (!isValidObjectId(planId)) {
      return res.status(400).json({
        message: "Invalid travel plan ID",
      });
    }

    const travelPlan = await TravelPlan.findById(planId);

    if (!travelPlan) {
      return res.status(404).json({
        message: "Travel plan not found",
      });
    }

    // Ownership check
    if (travelPlan.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own travel plan",
      });
    }

    await TravelPlan.findByIdAndDelete(planId);

    res.status(200).json({
      message: "Travel plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTravelPlan,
  getTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};