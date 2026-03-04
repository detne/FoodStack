const express = require('express');

function createRestaurantRoutes(restaurantController) {
  const router = express.Router();
  router.get('/:id', (req, res, next) => restaurantController.getDetails(req, res, next));
  return router;
}

module.exports = { createRestaurantRoutes };