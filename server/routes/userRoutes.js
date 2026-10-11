const express = require("express");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");


const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all users - Admin only
router.get("/", protect, admin, getAllUsers);

// Delete user - Admin only
router.delete("/:userId", protect, admin, deleteUser);

module.exports = router;