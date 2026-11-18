require("dotenv").config();
require("./config/env");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const imageRoutes = require("./routes/imageRoutes");




const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");



const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const travelPlanRoutes = require("./routes/travelPlanRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");


const protect = require("./middleware/authMiddleware");
const admin = require("./middleware/adminMiddleware");

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Allow frontend to communicate with backend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);
// Parse JSON request body
app.use(express.json());

app.use(apiLimiter);



// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/travel-plans", travelPlanRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);



app.use("/api/images", imageRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ExploreX API is running successfully!",
  });
});

app.get("/api/", (req, res) => {
  res.json({
    message: "ExploreX API is running successfully!",
  });
});

// Protected test route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You have access to this protected route!",
    user: req.user,
  });
});

// Admin test route
app.get("/api/admin-test", protect, admin, (req, res) => {
  res.json({
    message: "Welcome Admin! You have access to this route.",
    user: req.user,
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Centralized error handling
app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});