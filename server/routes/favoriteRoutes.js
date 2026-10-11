const express = require("express");

const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add destination to favorites
router.post("/", protect, addFavorite);


// Get user's favorites
router.get("/", protect, getFavorites);

// Remove destination from favorites
router.delete("/:destinationId", protect, removeFavorite);


module.exports = router;