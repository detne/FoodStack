const express = require('express');
const router = express.Router();
const mockPaymentController = require('../../controller/mock-payment');

// Tạo payment link mock
router.post('/create-payment-link', mockPaymentController.createPaymentLink);

// Kiểm tra thông tin payment
router.get('/payment-info/:orderCode', mockPaymentController.getPaymentInfo);

// Mô phỏng thanh toán (success/cancel)
router.post('/simulate-payment', mockPaymentController.simulatePayment);

// Mock webhook endpoint
router.post('/webhook', mockPaymentController.mockWebhook);

module.exports = router;