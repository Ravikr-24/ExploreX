const express = require("express");

const {
  createTravelPlan,
  getTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,

} = require("../controllers/travelPlanController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create travel plan
router.post("/", protect, createTravelPlan);

// Get my travel plans
router.get("/", protect, getTravelPlans);

// Update travel plan
router.put("/:planId", protect, updateTravelPlan);

// Delete travel plan
router.delete("/:planId", protect, deleteTravelPlan);

module.exports = router;