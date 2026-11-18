
const cloudinary = require("../config/cloudinary");
const Destination = require("../models/Destination");
const isValidObjectId = require("../utils/validateObjectId");

// Upload one image to Cloudinary
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(file.buffer);
  });
};

// Get Cloudinary public ID from an existing image URL
const getPublicIdFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const marker = "/upload/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    let publicId = url.pathname.slice(index + marker.length);

    // Remove version number
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return decodeURIComponent(publicId);
  } catch {
    return null;
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  const publicId = getPublicIdFromUrl(imageUrl);

  if (!publicId) {
    throw new Error("Unable to identify Cloudinary image");
  }

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary image deletion failed");
  }
};

// Find the correct image array
const getImageArray = (destination, target, itemId) => {
  if (target === "destination") {
    if (itemId) return null;
    return destination.images;
  }

  if (target === "attraction" || target === "activity") {
    if (!itemId || !isValidObjectId(itemId)) {
      return null;
    }

    const items =
      target === "attraction"
        ? destination.attractions
        : destination.activities;

    const item = items.id(itemId);

    if (!item) return null;

    return item.images;
  }

  return null;
};

// Common destination and target validation
const getDestinationAndImages = async (req, res) => {
  const { destinationId, target, itemId } = req.params;

  if (!isValidObjectId(destinationId)) {
    res.status(400).json({ message: "Invalid destination ID" });
    return null;
  }

  const allowedTargets = [
    "destination",
    "attraction",
    "activity",
  ];

  if (!allowedTargets.includes(target)) {
    res.status(400).json({ message: "Invalid image category" });
    return null;
  }

  const destination = await Destination.findById(destinationId);

  if (!destination) {
    res.status(404).json({ message: "Destination not found" });
    return null;
  }

  const images = getImageArray(destination, target, itemId);

  if (!images) {
    res.status(404).json({
      message: "Selected destination, attraction or activity not found",
    });
    return null;
  }

  return { destination, images };
};

// Existing single image upload API
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const result = await uploadToCloudinary(
      req.file,
      "explorex"
    );

    res.status(200).json({
      message: "Image uploaded successfully",
      ...result,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

// Existing multiple image upload API
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image",
      });
    }

    const uploadedImages = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file, "explorex")
      )
    );

    res.status(200).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);

    res.status(500).json({
      message: "Images upload failed",
      error: error.message,
    });
  }
};

// Upload images and automatically save in MongoDB
const uploadManagedImages = async (req, res, next) => {
  let uploadedImages = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image",
      });
    }

    const data = await getDestinationAndImages(req, res);

    if (!data) return;

    const { destination, images } = data;
    const { target } = req.params;

    const folder =
      target === "destination"
        ? "explorex/destinations"
        : target === "attraction"
          ? "explorex/attractions"
          : "explorex/activities";

    uploadedImages = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file, folder)
      )
    );

    images.push(
      ...uploadedImages.map((image) => image.imageUrl)
    );

    await destination.save();

    res.status(200).json({
      message: "Images uploaded and saved successfully",
      images,
      destination,
    });
  } catch (error) {
    // Clean up Cloudinary uploads if MongoDB saving fails
    await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    next(error);
  }
};

// Replace an existing image
const replaceManagedImage = async (req, res, next) => {
  let newImage = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a replacement image",
      });
    }

    const { destination, images } =
      (await getDestinationAndImages(req, res)) || {};

    if (!destination) return;

    const { oldImageUrl } = req.body;

    if (!oldImageUrl) {
      return res.status(400).json({
        message: "Existing image URL is required",
      });
    }

    const imageIndex = images.indexOf(oldImageUrl);

    if (imageIndex === -1) {
      return res.status(404).json({
        message: "Existing image not found",
      });
    }

    const { target } = req.params;

    const folder =
      target === "destination"
        ? "explorex/destinations"
        : target === "attraction"
          ? "explorex/attractions"
          : "explorex/activities";

    newImage = await uploadToCloudinary(req.file, folder);

    images[imageIndex] = newImage.imageUrl;

    await destination.save();

    // Remove old Cloudinary image after MongoDB save succeeds
    try {
      await deleteFromCloudinary(oldImageUrl);
    } catch (cleanupError) {
      console.error("Old image cleanup failed:", cleanupError);
    }

    res.status(200).json({
      message: "Image replaced successfully",
      newImage,
      destination,
    });
  } catch (error) {
    if (newImage) {
      await cloudinary.uploader
        .destroy(newImage.publicId)
        .catch(() => {});
    }

    next(error);
  }
};

// Delete an image
const deleteManagedImage = async (req, res, next) => {
  try {
    const { destination, images } =
      (await getDestinationAndImages(req, res)) || {};

    if (!destination) return;

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    const imageIndex = images.indexOf(imageUrl);

    if (imageIndex === -1) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    // Remove from MongoDB first
    images.splice(imageIndex, 1);
    await destination.save();

    // Then remove from Cloudinary
    try {
      await deleteFromCloudinary(imageUrl);
    } catch (cleanupError) {
      console.error("Cloudinary deletion failed:", cleanupError);

      return res.status(200).json({
        message: "Image removed from gallery, but Cloudinary cleanup failed",
        destination,
      });
    }

    res.status(200).json({
      message: "Image deleted successfully",
      destination,
    });
  } catch (error) {
    next(error);
  }
};

// Change the order of gallery images
const reorderManagedImages = async (req, res, next) => {
  try {
    const { destination, images } =
      (await getDestinationAndImages(req, res)) || {};

    if (!destination) return;

    const { imageUrls } = req.body;

    if (
      !Array.isArray(imageUrls) ||
      imageUrls.length !== images.length ||
      new Set(imageUrls).size !== imageUrls.length ||
      !imageUrls.every((url) => images.includes(url))
    ) {
      return res.status(400).json({
        message: "Invalid image order",
      });
    }

    images.splice(0, images.length, ...imageUrls);

    await destination.save();

    res.status(200).json({
      message: "Image order updated successfully",
      destination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  uploadManagedImages,
  replaceManagedImage,
  deleteManagedImage,
  reorderManagedImages,
};
