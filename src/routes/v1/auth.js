/**
 * Auth Routes
 * API routes for authentication
 */

const express = require('express');
const { LoginSchema } = require('../../dto/auth/login');

/**
 * Validation middleware
 * @param {Object} schema - Zod schema
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
  };
}

/**
 * Create auth routes
 * @param {Object} authController - Auth controller instance
 * @returns {express.Router} Express router
 */
function createAuthRoutes(authController) {
  const router = express.Router();

  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register new restaurant
   * @access  Public
   */
  router.post(
    '/register',
    // validateRequest(RegisterRestaurantSchema),
    (req, res, next) => authController.registerRestaurant(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login user
   * @access  Public
   */
  router.post(
    '/login',
    validateRequest(LoginSchema),
    (req, res, next) => authController.login(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/refresh-token
   * @desc    Refresh access token
   * @access  Public
   */
  router.post(
    '/refresh-token',
    (req, res, next) => authController.refreshToken(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/logout
   * @desc    Logout user
   * @access  Private
   */
  router.post(
    '/logout',
    // authMiddleware,
    (req, res, next) => authController.logout(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/forgot-password
   * @desc    Request password reset
   * @access  Public
   */
  router.post(
    '/forgot-password',
    (req, res, next) => authController.forgotPassword(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/reset-password
   * @desc    Reset password with token
   * @access  Public
   */
  router.post(
    '/reset-password',
    (req, res, next) => authController.resetPassword(req, res, next)
  );

  /**
   * @route   POST /api/v1/auth/change-password
   * @desc    Change password (authenticated)
   * @access  Private
   */
  router.post('/change-password', (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Not implemented yet',
    });
  });

  /**
   * @route   GET /api/v1/auth/verify-email/:token
   * @desc    Verify email with token
   * @access  Public
   */
  router.get('/verify-email/:token', (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Not implemented yet',
    });
  });

  return router;
}

module.exports = { createAuthRoutes };
