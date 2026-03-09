// src/routes/v1/category.js
const express = require('express');

function createCategoryRoutes(categoryController, authMiddleware) {
  const router = express.Router();

  // GET /api/v1/categories - List categories
  router.get(
    '/',
    authMiddleware,
    (req, res, next) => categoryController.list(req, res, next)
  );

  // GET /api/v1/categories/:id - Get category details
  router.get(
    '/:id',
    authMiddleware,
    (req, res, next) => categoryController.getDetails(req, res, next)
  );

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
