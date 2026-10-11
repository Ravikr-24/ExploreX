const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required ")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required (Phle email bhariye)")
    .isEmail()
    .withMessage("Please provide a valid email(Kripya Sahi Email Bhariye)")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required (Ye To Bhut Jaruri H)")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];


const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  registerValidation,
  loginValidation,
};