/**
 * Order Routes
 * Static/specific routes MUST come before /:orderId to avoid param collision.
 */

const express = require('express');

function createOrderRoutes(orderController, authMiddleware) {
  const router = express.Router();

  if (!authMiddleware) throw new Error('authMiddleware is required');

  // ── Static routes first ──────────────────────────────────────────────────

  // GET /orders/branch/:branchId/active?roundStatus=PENDING|PREPARING|SERVED|ALL
  router.get('/branch/:branchId/active', authMiddleware,
    orderController.getActiveOrdersByBranch.bind(orderController));

  // GET /orders/branch/:branchId/completed
  router.get('/branch/:branchId/completed', authMiddleware,
    orderController.getCompletedOrdersByBranch.bind(orderController));

  // GET /orders/table/:tableId/history
  router.get('/table/:tableId/history', authMiddleware,
    orderController.getOrdersByTable.bind(orderController));

  // ── Order CRUD ───────────────────────────────────────────────────────────

  // POST /orders  (QR-based, public)
  router.post('/', orderController.createOrder.bind(orderController));

  // GET /orders/:orderId
  router.get('/:orderId', orderController.getOrderDetails.bind(orderController));

  // PUT /orders/:orderId/status  (ACTIVE → COMPLETED | CANCELLED)
  router.put('/:orderId/status', authMiddleware,
    orderController.updateOrderStatus.bind(orderController));

  // PUT /orders/:orderId/cancel
  router.put('/:orderId/cancel', authMiddleware,
    orderController.cancelOrder.bind(orderController));

  // GET /orders/:orderId/lifecycle
  router.get('/:orderId/lifecycle', authMiddleware,
    orderController.getOrderLifecycle.bind(orderController));

  // ── Round status ─────────────────────────────────────────────────────────

  // PUT /orders/:orderId/rounds/:roundId/status  (PENDING→PREPARING→SERVED)
  router.put('/:orderId/rounds/:roundId/status', authMiddleware,
    orderController.updateRoundStatus.bind(orderController));

  // PUT /orders/:orderId/rounds/:roundId/items/:itemId/served
  router.put('/:orderId/rounds/:roundId/items/:itemId/served', authMiddleware,
    orderController.markItemServed.bind(orderController));

  // ── Order items ──────────────────────────────────────────────────────────

  // POST /orders/:orderId/items
  router.post('/:orderId/items', orderController.addItemsToOrder.bind(orderController));

  // DELETE /orders/:orderId/items/:orderItemId
  router.delete('/:orderId/items/:orderItemId',
    orderController.removeItemFromOrder.bind(orderController));

  // PUT /orders/:orderId/items/:orderItemId
  router.put('/:orderId/items/:orderItemId',
    orderController.updateOrderItem.bind(orderController));

  return router;
}

module.exports = { createOrderRoutes };
