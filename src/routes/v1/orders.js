/**
 * Order Routes
 * API routes for order management
 */

const express = require('express');

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
 * Create order routes
 * @param {Object} orderController - Order controller instance
 * @param {Function} authMiddleware - Auth middleware for protected routes
 * @returns {express.Router} Express router
 */
function createOrderRoutes(orderController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) {
    throw new Error('authMiddleware is required for protected routes');
  }

  /**
   * @route   POST /api/v1/orders
   * @desc    Create new order (ORDER-101)
   * @access  Public (QR-based)
   */
  router.post(
    '/',
    orderController.createOrder.bind(orderController)
  );

  /**
   * @route   GET /api/v1/orders/:orderId
   * @desc    Get order details (ORDER-102)
   * @access  Public/Staff
   */
  router.get(
    '/:orderId',
    orderController.getOrderDetails.bind(orderController)
  );

  /**
   * @route   PUT /api/v1/orders/:orderId/status
   * @desc    Update order status (ORDER-103)
   * @access  Staff only
   */
  router.put(
    '/:orderId/status',
    authMiddleware,
    orderController.updateOrderStatus.bind(orderController)
  );

  /**
   * @route   POST /api/v1/orders/:orderId/items
   * @desc    Add items to order (ORDER-104)
   * @access  Public/Staff
   */
  router.post(
    '/:orderId/items',
    orderController.addItemsToOrder.bind(orderController)
  );

  /**
   * @route   DELETE /api/v1/orders/:orderId/items/:orderItemId
   * @desc    Remove item from order (ORDER-105)
   * @access  Public/Staff
   */
  router.delete(
    '/:orderId/items/:orderItemId',
    orderController.removeItemFromOrder.bind(orderController)
  );

  /**
   * @route   PUT /api/v1/orders/:orderId/items/:orderItemId
   * @desc    Update order item quantity (ORDER-106)
   * @access  Public/Staff
   */
  router.put(
    '/:orderId/items/:orderItemId',
    orderController.updateOrderItem.bind(orderController)
  );

  /**
   * @route   PUT /api/v1/orders/:orderId/cancel
   * @desc    Cancel order (ORDER-107)
   * @access  Staff only
   */
  router.put(
    '/:orderId/cancel',
    authMiddleware,
    orderController.cancelOrder.bind(orderController)
  );

  /**
   * @route   GET /api/v1/orders/branch/:branchId/active
   * @desc    Get active orders by branch (ORDER-108)
   * @access  Staff only
   */
  router.get(
    '/branch/:branchId/active',
    authMiddleware,
    orderController.getActiveOrdersByBranch.bind(orderController)
  );

  /**
   * @route   GET /api/v1/orders/table/:tableId/history
   * @desc    Get orders by table (ORDER-109)
   * @access  Staff only
   */
  router.get(
    '/table/:tableId/history',
    authMiddleware,
    orderController.getOrdersByTable.bind(orderController)
  );

  /**
   * @route   GET /api/v1/orders/:orderId/lifecycle
   * @desc    Get order lifecycle/timeline (ORDER-110)
   * @access  Staff only
   */
  router.get(
    '/:orderId/lifecycle',
    authMiddleware,
    orderController.getOrderLifecycle.bind(orderController)
  );

  return router;
}

module.exports = { createOrderRoutes };