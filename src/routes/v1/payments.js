const express = require('express');

function createPaymentRoutes(paymentController, authMiddleware) {
  const router = express.Router();

  router.post('/process', authMiddleware, (req, res, next) =>
    paymentController.process(req, res, next)
  );

  // webhook thường không đi qua authMiddleware
  router.post('/webhook/payos', (req, res, next) =>
    paymentController.webhook(req, res, next)
  );

  return router;
}

module.exports = { createPaymentRoutes };