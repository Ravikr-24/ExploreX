const express = require("express");

const {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();




// Get all destinations
router.get("/", getDestinations);

// Get single destination
router.get("/:id", getDestinationById);



// Create destination - Admin only
router.post(
  "/",
  protect,
  admin,
  createDestination,
  updateDestination,
);


// Update destination - Admin only
router.put(
  "/:id",
  protect,
  admin,
  updateDestination
);

// Delete destination - Admin only
router.delete(
  "/:id",
  protect,
  admin,
  deleteDestination
);


module.exports = router;