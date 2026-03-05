const express = require('express');

function createRestaurantRoutes(restaurantController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required');
  }

  // GET /api/v1/restaurants/me/statistics?from=...&to=...
  router.get('/me/statistics', authMiddleware, (req, res, next) =>
    restaurantController.getMyStatistics(req, res, next)
  );

  return router;
}

module.exports = { createRestaurantRoutes };