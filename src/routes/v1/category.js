// src/routes/v1/category.js
const express = require('express');

function createCategoryRoutes(categoryController, authMiddleware) {
  const router = express.Router();

  // POST /api/v1/categories - Create category
  router.post(
    '/',
    authMiddleware,
    (req, res, next) => categoryController.create(req, res, next)
  );

  // PUT /api/v1/categories/:id - Update category
  router.put(
    '/:id',
    authMiddleware,
    (req, res, next) => categoryController.update(req, res, next)
  );

  // DELETE /api/v1/categories/:id - Delete category
  router.delete(
    '/:id',
    authMiddleware,
    (req, res, next) => categoryController.delete(req, res, next)
  );

  return router;
}

module.exports = { createCategoryRoutes };
