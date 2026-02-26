/**
 * Process Payment Use Case
 * Handles payment processing with financial safety (ACID transactions)
 */

const { validateProcessPayment } = require('../../dtos/payment/ProcessPaymentDto');
const { NotFoundError, PaymentAlreadyProcessedError } = require('../../../core/errors');
const { EVENTS } = require('../../../config/constants');
const { logger, eventLogger } = require('../../../config/logger.config');

class ProcessPaymentUseCase {
  /**
   * @param {Object} dependencies
   * @param {import('../../../infrastructure/repositories/postgres/PaymentRepository').PaymentRepository} dependencies.paymentRepository
   * @param {import('../../../infrastructure/repositories/postgres/OrderRepository').OrderRepository} dependencies.orderRepository
   * @param {import('../../../infrastructure/repositories/mongodb/OrderEventRepository').OrderEventRepository} dependencies.orderEventRepository
   * @param {Object} dependencies.eventEmitter
   * @param {Object} dependencies.cacheService
   */
  constructor({
    paymentRepository,
    orderRepository,
    orderEventRepository,
    eventEmitter,
    cacheService,
  }) {
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.orderEventRepository = orderEventRepository;
    this.eventEmitter = eventEmitter;
    this.cacheService = cacheService;
  }

  /**
   * Execute use case
   * @param {Object} input
   * @param {import('../../dtos/payment/ProcessPaymentDto').ProcessPaymentDto} input.paymentData
   * @param {string} input.restaurantId
   * @returns {Promise<Object>}
   */
  async execute({ paymentData, restaurantId }) {
    // 1. Validate input
    const validatedData = validateProcessPayment(paymentData);

    logger.info('Processing payment', {
      orderId: validatedData.orderId,
      amount: validatedData.amount,
      method: validatedData.method,
      idempotencyKey: validatedData.idempotencyKey,
    });

    // 2. Check idempotency - prevent double payment
    const existingPayment = await this.paymentRepository.findByIdempotencyKey(
      validatedData.idempotencyKey
    );

    if (existingPayment) {
      logger.warn('Duplicate payment request detected', {
        orderId: validatedData.orderId,
        idempotencyKey: validatedData.idempotencyKey,
      });
      return existingPayment;
    }

    // 3. Verify order exists and belongs to restaurant
    const order = await this.orderRepository.findById(validatedData.orderId, restaurantId);
    if (!order) {
      throw new NotFoundError('Order', validatedData.orderId);
    }

    // 4. Verify payment amount matches order total
    if (Math.abs(validatedData.amount - order.totalAmount) > 0.01) {
      throw new Error(
        `Payment amount (${validatedData.amount}) does not match order total (${order.totalAmount})`
      );
    }

    // 5. Process payment with transaction lock (SELECT FOR UPDATE)
    const payment = await this.paymentRepository.processPaymentWithLock(
      {
        amount: validatedData.amount,
        method: validatedData.method,
        status: 'Success', // In real scenario, this comes from payment gateway
        transactionRef: this._generateTransactionRef(),
        payosData: {
          idempotencyKey: validatedData.idempotencyKey,
          returnUrl: validatedData.returnUrl,
          cancelUrl: validatedData.cancelUrl,
          metadata: validatedData.metadata,
          processedAt: new Date().toISOString(),
        },
      },
      validatedData.orderId,
      restaurantId
    );

    // 6. Log payment event to MongoDB
    await this.orderEventRepository.create({
      orderId: validatedData.orderId,
      tableId: order.tableId,
      restaurantId,
      branchId: order.branchId,
      action: 'PAYMENT_COMPLETED',
      performedBy: 'system',
      details: {
        paymentId: payment.id,
        amount: validatedData.amount,
        method: validatedData.method,
        transactionRef: payment.transactionRef,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // 7. Invalidate cache
    await this._invalidateCache(order.branchId, order.tableId, validatedData.orderId);

    // 8. Emit real-time event
    this.eventEmitter.emit(EVENTS.PAYMENT_SUCCESS, {
      payment,
      order,
      restaurantId,
      branchId: order.branchId,
    });

    // 9. Log business event
    eventLogger.paymentProcessed(
      validatedData.orderId,
      payment.id,
      validatedData.amount,
      validatedData.method,
      'Success'
    );

    logger.info('Payment processed successfully', {
      paymentId: payment.id,
      orderId: validatedData.orderId,
      amount: validatedData.amount,
    });

    return payment;
  }

  /**
   * Generate unique transaction reference
   * @private
   * @returns {string}
   */
  _generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Invalidate related cache
   * @private
   * @param {string} branchId
   * @param {string} tableId
   * @param {string} orderId
   */
  async _invalidateCache(branchId, tableId, orderId) {
    if (!this.cacheService) return;

    try {
      const { CACHE_KEYS } = require('../../../config/constants');
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS.ORDER(orderId)),
        this.cacheService.delete(CACHE_KEYS.ACTIVE_ORDERS(branchId)),
        this.cacheService.delete(CACHE_KEYS.TABLE(tableId)),
        this.cacheService.delete(CACHE_KEYS.TABLE_STATUS(tableId)),
      ]);
    } catch (error) {
      logger.warn('Failed to invalidate cache', { error: error.message });
    }
  }
}

module.exports = { ProcessPaymentUseCase };
