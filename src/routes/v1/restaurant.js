// src/routes/v1/restaurant.js
const express = require('express');
const multer = require('multer');
const { requireRestaurantOwner } = require('../../middleware/restaurant-owner');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPG and PNG are allowed'));
  },
});

function createRestaurantRoutes(restaurantController, authMiddleware = null) {
  const router = express.Router();

  router.get('/:id', (req, res, next) =>
    restaurantController.getDetails(req, res, next)
  );

  router.post(
    '/:restaurantId/logo',
    ...(authMiddleware ? [authMiddleware] : []),
    ...(authMiddleware ? [requireRestaurantOwner] : []), // chỉ check owner khi có auth
    upload.single('logo'),
    (req, res, next) => restaurantController.uploadLogo(req, res, next)
  );

  return router;
}

module.exports = { createRestaurantRoutes };