/**
 * Payment Error
 * Thrown when payment processing fails
 */

const { AppError } = require('./AppError');

class PaymentError extends AppError {
  /**
   * @param {string} [message='Payment processing failed']
   * @param {string} [code='PAYMENT_ERROR']
   * @param {any} [details]
   */
  constructor(message = 'Payment processing failed', code = 'PAYMENT_ERROR', details = undefined) {
    super(message, 402, code, true, details);
  }
}

class PaymentAlreadyProcessedError extends PaymentError {
  /**
   * @param {string} orderId
   */
  constructor(orderId) {
    super(
      `Payment for order ${orderId} has already been processed`,
      'PAYMENT_ALREADY_PROCESSED',
      { orderId }
    );
  }
}

class PaymentTimeoutError extends PaymentError {
  /**
   * @param {string} orderId
   */
  constructor(orderId) {
    super(
      `Payment timeout for order ${orderId}`,
      'PAYMENT_TIMEOUT',
      { orderId }
    );
  }
}

class InsufficientFundsError extends PaymentError {
  constructor() {
    super('Insufficient funds', 'INSUFFICIENT_FUNDS');
  }
}

module.exports = {
  PaymentError,
  PaymentAlreadyProcessedError,
  PaymentTimeoutError,
  InsufficientFundsError,
};
