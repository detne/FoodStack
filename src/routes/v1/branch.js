/**
 * Branch Routes
 * API routes for branch management
 */

const express = require('express');

/**
 * Create branch routes
 * @param {Object} branchController - Branch controller instance
 * @param {Function} authMiddleware - Authentication middleware
 * @returns {express.Router} Express router
 */
function createBranchRoutes(branchController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for branch routes');
  }

  /**
   * @route   GET /api/v1/branches
   * @desc    Get all branches for restaurant
   * @access  Private
   */
  router.get(
    '/',
    authMiddleware,
    (req, res, next) => branchController.list(req, res, next)
  );

  /**
   * @route   GET /api/v1/branches/:id
   * @desc    Get branch details
   * @access  Private
   */
  router.get(
    '/:id',
    authMiddleware,
    (req, res, next) => branchController.getDetails(req, res, next)
  );

  /**
   * @route   POST /api/v1/branches
   * @desc    Create new branch
   * @access  Private
   */
  router.post(
    '/',
    authMiddleware,
    (req, res, next) => branchController.create(req, res, next)
  );

  /**
   * @route   PUT /api/v1/branches/:id
   * @desc    Update branch
   * @access  Private
   */
  router.put(
    '/:id',
    authMiddleware,
    (req, res, next) => branchController.update(req, res, next)
  );

  /**
   * @route   DELETE /api/v1/branches/:id
   * @desc    Delete branch (soft delete)
   * @access  Private
   */
  router.delete(
    '/:id',
    authMiddleware,
    (req, res, next) => branchController.delete(req, res, next)
  );

  return router;
}

module.exports = { createBranchRoutes };
