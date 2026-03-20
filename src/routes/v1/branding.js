// src/routes/v1/branding.js

const express = require('express');

function createBrandingRoutes(brandingController, authMiddleware) {
  const router = express.Router();

  // GET /api/v1/branding/:branchId - Get branch branding
  router.get(
    '/:branchId',
    authMiddleware,
    (req, res, next) => brandingController.get(req, res, next)
  );

  // PUT /api/v1/branding/:branchId - Update branch branding
  router.put(
    '/:branchId',
    authMiddleware,
    (req, res, next) => brandingController.update(req, res, next)
  );

  return router;
}

module.exports = { createBrandingRoutes };
