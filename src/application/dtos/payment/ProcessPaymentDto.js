/**
 * Process Payment DTO
 * Input validation for payment processing
 */

const { z } = require('zod');

/**
 * Process Payment Schema
 */
const ProcessPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  method: z.enum(['PayOS', 'Cash', 'CreditCard', 'DebitCard', 'BankTransfer', 'Momo', 'ZaloPay'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  amount: z.number()
    .positive('Amount must be positive')
    .min(10000, 'Minimum payment amount is 10,000 VND')
    .max(100000000, 'Maximum payment amount is 100,000,000 VND'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
  returnUrl: z.string().url('Invalid return URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Payment Webhook Schema
 */
const PaymentWebhookSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  transactionRef: z.string().min(1, 'Transaction reference is required'),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['Success', 'Failed', 'Pending'], {
    errorMap: () => ({ message: 'Invalid payment status' }),
  }),
  signature: z.string().min(1, 'Signature is required'),
  payosData: z.record(z.any()).optional(),
});

/**
 * Refund Payment Schema
 */
const RefundPaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason too long'),
});

/**
 * @typedef {Object} ProcessPaymentDto
 * @property {string} orderId
 * @property {string} method
 * @property {number} amount
 * @property {string} idempotencyKey
 * @property {string} [returnUrl]
 * @property {string} [cancelUrl]
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} PaymentWebhookDto
 * @property {string} orderId
 * @property {string} transactionRef
 * @property {number} amount
 * @property {string} status
 * @property {string} signature
 * @property {Object} [payosData]
 */

/**
 * @typedef {Object} RefundPaymentDto
 * @property {string} paymentId
 * @property {number} [amount]
 * @property {string} reason
 */

/**
 * Validate process payment input
 * @param {any} data
 * @returns {ProcessPaymentDto}
 */
function validateProcessPayment(data) {
  return ProcessPaymentSchema.parse(data);
}

/**
 * Validate payment webhook
 * @param {any} data
 * @returns {PaymentWebhookDto}
 */
function validatePaymentWebhook(data) {
  return PaymentWebhookSchema.parse(data);
}

/**
 * Validate refund payment
 * @param {any} data
 * @returns {RefundPaymentDto}
 */
function validateRefundPayment(data) {
  return RefundPaymentSchema.parse(data);
}

module.exports = {
  ProcessPaymentSchema,
  PaymentWebhookSchema,
  RefundPaymentSchema,
  validateProcessPayment,
  validatePaymentWebhook,
  validateRefundPayment,
};
