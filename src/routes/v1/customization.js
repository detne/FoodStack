// src/routes/v1/customization.js
const express = require('express');

function createCustomizationRoutes(customizationController, authMiddleware) {
  const router = express.Router();

  // POST /api/v1/customizations/groups - Create customization group
  router.post(
    '/groups',
    authMiddleware,
    (req, res, next) => customizationController.createGroup(req, res, next)
  );

  return router;
}

module.exports = { createCustomizationRoutes };