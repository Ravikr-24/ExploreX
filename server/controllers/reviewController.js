const Review = require("../models/Review");
const Destination = require("../models/Destination");
const isValidObjectId = require("../utils/validateObjectId");

// Recalculate destination rating
const updateDestinationRating = async (destinationId) => {
  const result = await Review.aggregate([
    {
      $match: {
        destination: destinationId,
      },
    },
    {
      $group: {
        _id: "$destination",
        averageRating: {
          $avg: "$rating",
        },
      },
    },
  ]);

  const rating =
    result.length > 0
      ? Number(result[0].averageRating.toFixed(1))
      : 0;

  await Destination.findByIdAndUpdate(destinationId, {
    rating,
  });
};

// Add review
const addReview = async (req, res, next) => {
  try {
    const { destinationId, rating, comment } = req.body;

    // Validate destination ID
    if (!destinationId || !isValidObjectId(destinationId)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    // Validate rating
    if (
      rating === undefined ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
      });
    }

    // Validate comment
    if (
      typeof comment !== "string" ||
      comment.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({
        message: "Comment must not exceed 500 characters",
      });
    }

    // Check destination
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    // Check duplicate review
    const existingReview = await Review.findOne({
      user: req.user.id,
      destination: destinationId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this destination",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      destination: destinationId,
      rating,
      comment: comment.trim(),
    });

    // Update destination rating
    await updateDestinationRating(destinationId);

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews for a destination
const getReviews  = async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    // Validate destination ID
    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    // Check destination
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    const reviews = await Review.find({
      destination: destinationId,
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Update own review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Validate review ID
    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    // Validate rating if provided
    if (
      rating !== undefined &&
      (typeof rating !== "number" ||
        rating < 1 ||
        rating > 5)
    ) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
      });
    }

    // Validate comment if provided
    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        comment.trim().length === 0
      ) {
        return res.status(400).json({
          message: "Comment cannot be empty",
        });
      }

      if (comment.trim().length > 500) {
        return res.status(400).json({
          message: "Comment must not exceed 500 characters",
        });
      }
    }

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Ownership check
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own review",
      });
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    // Recalculate destination rating
    await updateDestinationRating(review.destination);

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Delete own review
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Validate review ID
    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Ownership check
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own review",
      });
    }

    const destinationId = review.destination;

    await Review.findByIdAndDelete(reviewId);

    // Recalculate destination rating
    await updateDestinationRating(destinationId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Admin - Get all reviews
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("destination", "name location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Admin - Delete any review
const adminDeleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Validate review ID
    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const destinationId = review.destination;

    await Review.findByIdAndDelete(reviewId);

    // Recalculate destination rating
    await updateDestinationRating(destinationId);

    res.status(200).json({
      message: "Review deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview,
};