// src/routes/v1/branding.js

const express = require('express');
const multer = require('multer');

// Multer configuration for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * Create branding routes
 * @param {Object} brandingController - Branding controller instance
 * @param {Function} authMiddleware - Authentication middleware
 * @returns {express.Router} Express router
 */
function createBrandingRoutes(brandingController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for private routes');
  }

  // ===== PUBLIC ROUTES =====

  /**
   * @route   GET /api/v1/branding/landing/:slug
   * @desc    Get public landing page by branch slug
   * @access  Public
   */
  router.get('/landing/:slug', (req, res, next) => 
    brandingController.getLandingPage(req, res, next)
  );

  /**
   * @route   GET /api/v1/branding/restaurant/:restaurantId/preview
   * @desc    Get restaurant branding preview (for owner to see demo)
   * @access  Private (Owner only)
   */
  router.get('/restaurant/:restaurantId/preview', authMiddleware, (req, res, next) => 
    brandingController.getRestaurantPreview(req, res, next)
  );

  // ===== PRIVATE ROUTES =====

  /**
   * @route   POST /api/v1/branding/upload
   * @desc    Upload branding image
   * @access  Private (Owner, Manager)
   */
  router.post('/upload', authMiddleware, upload.single('image'), (req, res, next) => 
    brandingController.uploadImage(req, res, next)
  );

  /**
   * @route   GET /api/v1/branding/themes
   * @desc    Get available themes with filters
   * @access  Private (Owner, Manager, Staff)
   */
  router.get('/themes', authMiddleware, (req, res, next) => 
    brandingController.getThemes(req, res, next)
  );

  /**
   * @route   GET /api/v1/branding/restaurant/:restaurantId
   * @desc    Get restaurant branding settings
   * @access  Private (Owner only)
   */
  router.get('/restaurant/:restaurantId', authMiddleware, (req, res, next) => 
    brandingController.getRestaurantBranding(req, res, next)
  );

  /**
   * @route   PUT /api/v1/branding/restaurant/:restaurantId
   * @desc    Update restaurant branding settings
   * @access  Private (Owner only)
   */
  router.put('/restaurant/:restaurantId', authMiddleware, (req, res, next) => 
    brandingController.updateRestaurantBranding(req, res, next)
  );

  /**
   * @route   POST /api/v1/branding/restaurant/:restaurantId/publish
   * @desc    Publish/unpublish restaurant landing page
   * @access  Private (Owner only)
   */
  router.post('/restaurant/:restaurantId/publish', authMiddleware, (req, res, next) => 
    brandingController.publishRestaurant(req, res, next)
  );

  /**
   * @route   GET /api/v1/branding/branch/:branchId
   * @desc    Get branch branding settings
   * @access  Private (Owner, Manager)
   */
  router.get('/branch/:branchId', authMiddleware, (req, res, next) => 
    brandingController.getBranchBranding(req, res, next)
  );

  /**
   * @route   PUT /api/v1/branding/branch/:branchId
   * @desc    Update branch branding settings
   * @access  Private (Owner, Manager)
   */
  router.put('/branch/:branchId', authMiddleware, (req, res, next) => 
    brandingController.updateBranchBranding(req, res, next)
  );

  /**
   * @route   POST /api/v1/branding/branch/:branchId/publish
   * @desc    Publish/unpublish branch landing page
   * @access  Private (Owner, Manager)
   */
  router.post('/branch/:branchId/publish', authMiddleware, (req, res, next) => 
    brandingController.publishBranch(req, res, next)
  );

  return router;
}

module.exports = { createBrandingRoutes };