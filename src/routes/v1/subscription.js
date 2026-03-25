const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controller/subscription');
const { authenticate } = require('../../middleware/auth');

// Get all subscription plans (public)
router.get('/plans', subscriptionController.getPlans);

// Get current subscription (requires auth)
router.get('/current', authenticate, subscriptionController.getCurrentSubscription);

// Create subscription payment (requires auth)
router.post('/payment', authenticate, subscriptionController.createPayment);

// Get payment history (requires auth)
router.get('/payment-history', authenticate, subscriptionController.getPaymentHistory);

// Webhook endpoint (no auth - verified by signature)
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
