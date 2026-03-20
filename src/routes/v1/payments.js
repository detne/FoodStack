const express = require('express');

function createPaymentRoutes(paymentController, authMiddleware) {
  const router = express.Router();

  router.get('/checkout-preview', (req, res, next) =>
    paymentController.getCheckoutPreview(req, res, next)
  );

  router.get('/statistics', authMiddleware, (req, res, next) =>
    paymentController.getStatistics(req, res, next)
  );

  router.get('/:paymentId', authMiddleware, (req, res, next) =>
    paymentController.getDetails(req, res, next)
  );

  router.get('/', authMiddleware, (req, res, next) =>
    paymentController.getHistory(req, res, next)
  );

  router.post('/process', (req, res, next) =>
    paymentController.process(req, res, next)
  );

  router.post('/webhook/payos', (req, res, next) =>
    paymentController.webhook(req, res, next)
  );

  return router;
}

module.exports = { createPaymentRoutes };