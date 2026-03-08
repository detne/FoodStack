// src/routes/v1/menu-item.js
const express = require('express');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPG and PNG are allowed'));
  },
});

function createMenuItemRoutes(menuItemController, authMiddleware) {
  const router = express.Router();

  // GET /api/v1/menu-items - List menu items by category
  router.get(
    '/',
    authMiddleware,
    (req, res, next) => menuItemController.list(req, res, next)
  );

  // GET /api/v1/menu-items/:id - Get menu item details
  router.get(
    '/:id',
    authMiddleware,
    (req, res, next) => menuItemController.getDetails(req, res, next)
  );

  // POST /api/v1/menu-items - Create menu item
  router.post(
    '/',
    authMiddleware,
    (req, res, next) => menuItemController.create(req, res, next)
  );

  // PUT /api/v1/menu-items/:id - Update menu item
  router.put(
    '/:id',
    authMiddleware,
    (req, res, next) => menuItemController.update(req, res, next)
  );

  // DELETE /api/v1/menu-items/:id - Delete menu item
  router.delete(
    '/:id',
    authMiddleware,
    (req, res, next) => menuItemController.delete(req, res, next)
  );

  // POST /api/v1/menu-items/:id/image - Upload image
  router.post(
    '/:id/image',
    authMiddleware,
    upload.single('image'),
    (req, res, next) => menuItemController.uploadImage(req, res, next)
  );

  return router;
}

module.exports = { createMenuItemRoutes };
