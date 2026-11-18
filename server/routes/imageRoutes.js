
const express = require("express");

const {
  uploadImage,
  uploadMultipleImages,
  uploadManagedImages,
  replaceManagedImage,
  deleteManagedImage,
  reorderManagedImages,
} = require("../controllers/imageController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Existing single image upload
router.post(
  "/upload",
  protect,
  admin,
  upload.single("image"),
  uploadImage
);

// Existing multiple image upload
router.post(
  "/upload-multiple",
  protect,
  admin,
  upload.array("images", 5),
  uploadMultipleImages
);

// Upload images
router.post(
  "/:destinationId/:target",
  protect,
  admin,
  upload.array("images", 5),
  uploadManagedImages
);

// Upload attraction/activity images
router.post(
  "/:destinationId/:target/:itemId",
  protect,
  admin,
  upload.array("images", 5),
  uploadManagedImages
);

// Replace image
router.put(
  "/:destinationId/:target",
  protect,
  admin,
  upload.single("image"),
  replaceManagedImage
);

// Replace attraction/activity image
router.put(
  "/:destinationId/:target/:itemId",
  protect,
  admin,
  upload.single("image"),
  replaceManagedImage
);

// Delete image
router.delete(
  "/:destinationId/:target",
  protect,
  admin,
  deleteManagedImage
);

// Delete attraction/activity image
router.delete(
  "/:destinationId/:target/:itemId",
  protect,
  admin,
  deleteManagedImage
);

// Reorder images
router.patch(
  "/:destinationId/:target/reorder",
  protect,
  admin,
  reorderManagedImages
);

// Reorder attraction/activity images
router.patch(
  "/:destinationId/:target/:itemId/reorder",
  protect,
  admin,
  reorderManagedImages
);

module.exports = router;
