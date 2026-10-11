const express = require("express");
const {
     registerUser,
     loginUser,  
}= require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimitMiddleware");



const {
  registerValidation,
  loginValidation
} = require("../validators/authValidator");

const validateRequest = require("../middleware/validationMiddleware");


     
const router = express.Router();

// Register new user
router.post(
  "/register",
  authLimiter,
  registerValidation,
  validateRequest,
  registerUser
);

// Login user
router.post(
  "/login",
  authLimiter,
  loginValidation,
  validateRequest,
  loginUser
);

module.exports = router;