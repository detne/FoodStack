// src/routes/v1/restaurant.js
const express = require('express');
const multer = require('multer');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG are allowed'));
    }
  },
});

function createRestaurantRoutes(restaurantController) {
  const router = express.Router();

  /**
   * @route   POST /api/v1/restaurants/:restaurantId/logo
   * @desc    Upload restaurant logo
   * @access  Private (Owner only)
   */
  router.post(
    '/:restaurantId/logo',
    // authMiddleware, // TODO: Add auth middleware
    upload.single('logo'),
    (req, res, next) => restaurantController.uploadLogo(req, res, next)
  );

  return router;
}

module.exports = { createRestaurantRoutes };
