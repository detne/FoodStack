// src/routes/v1/staff.js

const express = require('express');
const { CreateStaffSchema } = require('../../dto/staff/create-staff');
const { UpdateStaffSchema } = require('../../dto/staff/update-staff');
const { UpdateStaffRoleSchema } = require('../../dto/staff/update-staff-role');
const { GetStaffListSchema } = require('../../dto/staff/get-staff-list');
const { SetStaffStatusSchema } = require('../../dto/staff/set-staff-status');

/**
 * Validation middleware
 * @param {Object} schema - Zod schema
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      console.log('Validating request body:', JSON.stringify(req.body, null, 2));
      const result = schema.parse(req.body);
      console.log('Validation passed:', JSON.stringify(result, null, 2));
      next();
    } catch (error) {
      console.error('Validation failed:', error.errors);
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
  
  // Import prisma from config
  const { prisma } = require('../../config/database.config');

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for staff routes');
  }

  /**
   * @route   GET /api/v1/staff/debug
   * @desc    Debug endpoint to check user and restaurant data
   * @access  Private
   */
  router.get(
    '/debug',
    authMiddleware,
    async (req, res) => {
      try {
        console.log('Staff debug endpoint - req.user:', req.user);
        
        // Try to find user in database
        const user = await prisma.users.findUnique({
          where: { id: req.user.id },
          select: { 
            id: true, 
            email: true, 
            role: true, 
            restaurant_id: true,
            full_name: true,
            branch_id: true
          }
        });
        
        console.log('Staff debug endpoint - user from DB:', user);
        
        // Try to find owned restaurant if user is OWNER
        let ownedRestaurant = null;
        if (req.user.role === 'OWNER') {
          ownedRestaurant = await prisma.restaurants.findFirst({
            where: { owner_id: req.user.id },
            select: { id: true, name: true }
          });
          console.log('Staff debug endpoint - owned restaurant:', ownedRestaurant);
        }
        
        res.json({
          success: true,
          data: {
            tokenUser: req.user,
            dbUser: user,
            ownedRestaurant
          }
        });
      } catch (error) {
        console.error('Staff debug endpoint error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/staff/test
   * @desc    Test endpoint
   * @access  Private
   */
  router.get(
    '/test',
    authMiddleware,
    (req, res) => {
      console.log('Staff test endpoint called with user:', req.user);
      res.json({
        success: true,
        message: 'Staff test endpoint working',
        user: req.user
      });
    }
  );

  /**
   * @route   GET /api/v1/staff
   * @desc    Get list of staff (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   * @query   branchId? - Filter by branch ID
   * @query   page? - Page number (default: 1)
   * @query   limit? - Items per page (default: 10, max: 100)
   * @query   search? - Search by name or email
   * @query   status? - Filter by status (ACTIVE/INACTIVE)
   */
  router.get(
    '/',
    authMiddleware,
    (req, res, next) => staffController.getStaffList(req, res, next)
  );

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

  /**
   * @route   PATCH /api/v1/staff/:id/role
   * @desc    Update staff role (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   */
  router.patch(
    '/:id/role',
    authMiddleware,
    validateRequest(UpdateStaffRoleSchema),
    (req, res, next) => staffController.updateStaffRole(req, res, next)
  );

  /**
   * @route   DELETE /api/v1/staff/:id
   * @desc    Delete staff (soft delete - set INACTIVE) (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   */
  router.delete(
    '/:id',
    authMiddleware,
    (req, res, next) => staffController.deleteStaff(req, res, next)
  );

  /**
   * @route   PATCH /api/v1/staff/:id/status
   * @desc    Activate/Deactivate staff account (Owner/Manager only)
   * @access  Private (OWNER, MANAGER)
   * @body    status - 'ACTIVE' or 'INACTIVE'
   */
  router.patch(
    '/:id/status',
    authMiddleware,
    validateRequest(SetStaffStatusSchema),
    (req, res, next) => staffController.setStaffStatus(req, res, next)
  );

  return router;
}

module.exports = { createStaffRoutes };
