/**
 * Payment Service
 * High-level service for payment operations
 */

const { ProcessPaymentUseCase } = require('../use-cases/payment/ProcessPaymentUseCase');
const { logger } = require('../../config/logger.config');

class PaymentService {
  /**
   * @param {Object} dependencies
   * @param {import('../../infrastructure/repositories/postgres/PaymentRepository').PaymentRepository} dependencies.paymentRepository
   * @param {import('../../infrastructure/repositories/postgres/OrderRepository').OrderRepository} dependencies.orderRepository
   * @param {import('../../infrastructure/repositories/mongodb/OrderEventRepository').OrderEventRepository} dependencies.orderEventRepository
   * @param {Object} dependencies.eventEmitter
   * @param {Object} dependencies.cacheService
   */
  constructor(dependencies) {
    this.paymentRepository = dependencies.paymentRepository;
    this.orderRepository = dependencies.orderRepository;
    this.orderEventRepository = dependencies.orderEventRepository;
    this.eventEmitter = dependencies.eventEmitter;
    this.cacheService = dependencies.cacheService;

    // Initialize use cases
    this.processPaymentUseCase = new ProcessPaymentUseCase(dependencies);
  }

  /**
   * Process payment
   * @param {Object} paymentData
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async processPayment(paymentData, restaurantId) {
    return await this.processPaymentUseCase.execute({
      paymentData,
      restaurantId,
    });
  }

  /**
   * Get payment by order ID
   * @param {string} orderId
   * @param {string} restaurantId
   * @returns {Promise<Object|null>}
   */
  async getPaymentByOrderId(orderId, restaurantId) {
    return await this.paymentRepository.findByOrderId(orderId, restaurantId);
  }

  /**
   * Get payment by transaction reference
   * @param {string} transactionRef
   * @returns {Promise<Object|null>}
   */
  async getPaymentByTransactionRef(transactionRef) {
    return await this.paymentRepository.findByTransactionRef(transactionRef);
  }

  /**
   * Refund payment
   * @param {string} paymentId
   * @param {number} [amount]
   * @param {string} reason
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async refundPayment(paymentId, amount, reason, restaurantId) {
    const payment = await this.paymentRepository.findById(paymentId, restaurantId);
    
    if (!payment) {
      const { NotFoundError } = require('../../core/errors');
      throw new NotFoundError('Payment', paymentId);
    }

    const refundAmount = amount || payment.amount;

    const refundedPayment = await this.paymentRepository.refundPayment(
      paymentId,
      refundAmount,
      reason,
      restaurantId
    );

    // Log event
    await this.orderEventRepository.create({
      orderId: payment.orderId,
      tableId: payment.order.tableId,
      restaurantId,
      branchId: payment.order.branchId,
      action: 'PAYMENT_REFUNDED',
      performedBy: 'staff',
      details: {
        paymentId,
        refundAmount,
        reason,
      },
    });

    // Emit event
    const { EVENTS } = require('../../config/constants');
    this.eventEmitter.emit(EVENTS.PAYMENT_REFUNDED, {
      payment: refundedPayment,
      refundAmount,
      reason,
    });

    logger.info('Payment refunded', {
      paymentId,
      orderId: payment.orderId,
      refundAmount,
    });

    return refundedPayment;
  }

  /**
   * Get payment statistics
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getPaymentStatistics(restaurantId, startDate, endDate) {
    return await this.paymentRepository.getStatistics(restaurantId, startDate, endDate);
  }

  /**
   * Verify payment webhook signature
   * @param {Object} webhookData
   * @param {string} signature
   * @returns {boolean}
   */
  verifyWebhookSignature(webhookData, signature) {
    const { EncryptionUtil } = require('../../core/utils');
    const { env } = require('../../config/env.config');
    
    const data = JSON.stringify(webhookData);
    return EncryptionUtil.verifyHMAC(data, signature, env.PAYOS_CHECKSUM_KEY);
  }
}

module.exports = { PaymentService };
