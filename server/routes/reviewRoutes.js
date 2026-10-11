const express = require("express");

const {
  addReview,
  getReviews,
  deleteReview,
  updateReview,
  adminDeleteReview,
  getAllReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");


const router = express.Router();



// Get all reviews - Admin only
router.get("/admin", protect, admin, getAllReviews);

// Admin delete review
router.delete(
  "/admin/:reviewId",
  protect,
  admin,
  adminDeleteReview
);




// Get reviews for a destination  (Public)
router.get("/:destinationId", getReviews);



// Protected user routes 
// Add review
router.post("/", protect, addReview);

// Delete review
router.delete("/:reviewId", protect, deleteReview);

// Update review
router.put("/:reviewId", protect, updateReview);



module.exports = router;