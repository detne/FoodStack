// src/routes/v1/staff.js

const express = require('express');
const { CreateStaffSchema } = require('../../dto/staff/create-staff');
const { UpdateStaffSchema } = require('../../dto/staff/update-staff');

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
 * Create staff routes
 * @param {Object} staffController - Staff controller instance
 * @param {Function} authMiddleware - Auth middleware
 * @returns {express.Router} Express router
 */
function createStaffRoutes(staffController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for staff routes');
  }

  /**
   * @route   POST /api/v1/staff
   * @desc    Create staff account (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   */
  router.post(
    '/',
    authMiddleware,
    validateRequest(CreateStaffSchema),
    (req, res, next) => staffController.createStaff(req, res, next)
  );

  /**
   * @route   PUT /api/v1/staff/:id
   * @desc    Update staff information (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   */
  router.put(
    '/:id',
    authMiddleware,
    validateRequest(UpdateStaffSchema),
    (req, res, next) => staffController.updateStaff(req, res, next)
  );

  return router;
}

module.exports = { createStaffRoutes };
