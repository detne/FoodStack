const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create', paymentController.createPayment);
router.post('/webhook/payos', paymentController.handleWebhook);
router.get('/success', paymentController.handleSuccess);
router.get('/cancel', paymentController.handleCancel);

module.exports = router;
