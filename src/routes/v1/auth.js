// src/routes/v1/auth.js
const express = require('express');
const { validateRequest } = require('../../middleware/validation');
const { RegisterRestaurantSchema } = require('../../dto/auth/register');

function createAuthRoutes(authController) {
  const router = express.Router();

  // POST /api/v1/auth/register
  router.post(
    '/register',
    validateRequest(RegisterRestaurantSchema),
    (req, res, next) => authController.registerRestaurant(req, res, next)
  );

  return router;
}

module.exports = { createAuthRoutes };
