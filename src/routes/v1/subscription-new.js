const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');

// Lazy load controller to avoid initialization errors
let subscriptionController;
function getController() {
  if (!subscriptionController) {
    subscriptionController = require('../../controller/subscription');
  }
  return subscriptionController;
}

// Get all subscription plans (public)
router.get('/plans', (req, res, next) => {
  const controller = getController();
  return controller.getPlans(req, res, next);
});

// Get current subscription (requires auth)
router.get('/current', authenticate, (req, res, next) => {
  const controller = getController();
  return controller.getCurrentSubscription(req, res, next);
});

// Create subscription payment (requires auth)
router.post('/payment', authenticate, (req, res, next) => {
  const controller = getController();
  return controller.createPayment(req, res, next);
});

// Get payment history (requires auth)
router.get('/payment-history', authenticate, (req, res, next) => {
  const controller = getController();
  return controller.getPaymentHistory(req, res, next);
});

// Get subscription limits (requires auth)
router.get('/limits', authenticate, (req, res, next) => {
  const controller = getController();
  return controller.getLimits(req, res, next);
});

// Webhook endpoint (no auth - verified by signature)
router.post('/webhook', (req, res, next) => {
  const controller = getController();
  return controller.handleWebhook(req, res, next);
});

module.exports = router;
