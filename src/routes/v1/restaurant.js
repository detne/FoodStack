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

  if (!authMiddleware) {
    throw new Error('authMiddleware is required');
  }

  // GET /api/v1/restaurants/:id - Get restaurant details (public)
  router.get('/:id', (req, res, next) =>
    restaurantController.getDetails(req, res, next)
  );

  // POST /api/v1/restaurants - Create new restaurant (requires auth)
  router.post(
    '/',
    authMiddleware,
    (req, res, next) => restaurantController.create(req, res, next)
  );

  // POST /api/v1/restaurants/:restaurantId/logo - Upload restaurant logo
  router.post(
    '/:restaurantId/logo',
    authMiddleware,
    requireRestaurantOwner,
    upload.single('logo'),
    (req, res, next) => restaurantController.uploadLogo(req, res, next)
  );

  // PUT /api/v1/restaurants/:restaurantId - Update restaurant
  router.put(
    '/:restaurantId',
    authMiddleware,
    requireRestaurantOwner,
    (req, res, next) => restaurantController.updateRestaurant(req, res, next)
  );

  // DELETE /api/v1/restaurants/:id - Delete restaurant
  router.delete(
    '/:id',
    authMiddleware,
    (req, res, next) => restaurantController.deleteRestaurant(req, res, next)
  );

  // GET /api/v1/restaurants/me/statistics?from=...&to=... - Get restaurant statistics
  router.get('/me/statistics', authMiddleware, (req, res, next) =>
    restaurantController.getMyStatistics(req, res, next)
  );

  return router;
}

module.exports = { createRestaurantRoutes };