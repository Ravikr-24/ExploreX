const express = require("express");

const {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  addAttractionImages,
} = require("../controllers/destinationController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();




// Get all destinations
router.get("/", getDestinations);
router.post(
  "/:id/attractions/:attractionId/images",
  protect,
  admin,
  upload.array("images", 5),
  addAttractionImages
);

// Get single destination
router.get("/:id", getDestinationById);



// Create destination - Admin only
router.post(
  "/",
  protect,
  admin,
  createDestination,

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