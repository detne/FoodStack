const express = require('express');

function createPaymentRoutes(paymentController, authMiddleware) {
  const router = express.Router();

  // ── Static routes FIRST (before /:paymentId) ────────────────────────────
  router.get('/checkout-preview', paymentController.getCheckoutPreview);
  router.get('/statistics', authMiddleware, paymentController.getStatistics);
  router.get('/success', paymentController.handleSuccess);
  router.get('/cancel', paymentController.handleCancel);
  router.get('/', authMiddleware, paymentController.getHistory);

  router.post('/process', paymentController.process);
  router.post('/webhook/payos', paymentController.webhook);

  // ── Param routes AFTER ──────────────────────────────────────────────────
  router.get('/:paymentId', authMiddleware, paymentController.getDetails);
  router.post('/:paymentId/confirm-cash', authMiddleware, paymentController.confirmCash);

  return router;
}

module.exports = { createPaymentRoutes };