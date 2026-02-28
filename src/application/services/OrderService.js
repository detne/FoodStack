/**
 * Order Service
 * High-level service for order operations
 */

const { CreateOrderUseCase } = require('../use-cases/order/CreateOrderUseCase');
const { logger } = require('../../config/logger.config');

class OrderService {
  /**
   * @param {Object} dependencies
   * @param {import('../../infrastructure/repositories/postgres/OrderRepository').OrderRepository} dependencies.orderRepository
   * @param {import('../../infrastructure/repositories/postgres/TableRepository').TableRepository} dependencies.tableRepository
   * @param {import('../../infrastructure/repositories/postgres/MenuRepository').MenuRepository} dependencies.menuRepository
   * @param {import('../../infrastructure/repositories/mongodb/OrderEventRepository').OrderEventRepository} dependencies.orderEventRepository
   * @param {Object} dependencies.eventEmitter
   * @param {Object} dependencies.cacheService
   */
  constructor(dependencies) {
    this.orderRepository = dependencies.orderRepository;
    this.tableRepository = dependencies.tableRepository;
    this.menuRepository = dependencies.menuRepository;
    this.orderEventRepository = dependencies.orderEventRepository;
    this.eventEmitter = dependencies.eventEmitter;
    this.cacheService = dependencies.cacheService;

    // Initialize use cases
    this.createOrderUseCase = new CreateOrderUseCase(dependencies);
  }

  /**
   * Create new order
   * @param {Object} orderData
   * @param {string} restaurantId
   * @param {string} branchId
   * @param {string} [customerId]
   * @returns {Promise<Object>}
   */
  async createOrder(orderData, restaurantId, branchId, customerId) {
    return await this.createOrderUseCase.execute({
      orderData,
      restaurantId,
      branchId,
      customerId,
    });
  }

  /**
   * Get order by ID with details
   * @param {string} orderId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async getOrderById(orderId, restaurantId) {
    // Try cache first
    if (this.cacheService) {
      const { CACHE_KEYS, CACHE_TTL } = require('../../config/constants');
      const cached = await this.cacheService.get(CACHE_KEYS.ORDER(orderId));
      if (cached) {
        return cached;
      }
    }

    const order = await this.orderRepository.findByIdWithDetails(orderId, restaurantId);

    // Cache the result
    if (this.cacheService && order) {
      const { CACHE_KEYS, CACHE_TTL } = require('../../config/constants');
      await this.cacheService.set(CACHE_KEYS.ORDER(orderId), order, CACHE_TTL.SHORT);
    }

    return order;
  }

  /**
   * Get active orders by branch
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async getActiveOrdersByBranch(branchId, restaurantId) {
    // Try cache first
    if (this.cacheService) {
      const { CACHE_KEYS, CACHE_TTL } = require('../../config/constants');
      const cached = await this.cacheService.get(CACHE_KEYS.ACTIVE_ORDERS(branchId));
      if (cached) {
        return cached;
      }
    }

    const orders = await this.orderRepository.findActiveByBranch(branchId, restaurantId);

    // Cache the result
    if (this.cacheService) {
      const { CACHE_KEYS, CACHE_TTL } = require('../../config/constants');
      await this.cacheService.set(
        CACHE_KEYS.ACTIVE_ORDERS(branchId),
        orders,
        CACHE_TTL.SHORT
      );
    }

    return orders;
  }

  /**
   * Update order status
   * @param {string} orderId
   * @param {string} status
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, status, restaurantId) {
    const order = await this.orderRepository.updateStatus(orderId, status, restaurantId);

    // Log event
    await this.orderEventRepository.create({
      orderId,
      tableId: order.tableId,
      restaurantId,
      branchId: order.branchId,
      action: 'STATUS_CHANGED',
      performedBy: 'staff',
      details: {
        oldStatus: order.status,
        newStatus: status,
      },
    });

    // Invalidate cache
    if (this.cacheService) {
      const { CACHE_KEYS } = require('../../config/constants');
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS.ORDER(orderId)),
        this.cacheService.delete(CACHE_KEYS.ACTIVE_ORDERS(order.branchId)),
      ]);
    }

    // Emit event
    const { EVENTS } = require('../../config/constants');
    this.eventEmitter.emit(EVENTS.ORDER_STATUS_CHANGED, {
      order,
      oldStatus: order.status,
      newStatus: status,
    });

    return order;
  }

  /**
   * Get order statistics
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getOrderStatistics(restaurantId, startDate, endDate) {
    return await this.orderRepository.getStatistics(restaurantId, startDate, endDate);
  }

  /**
   * Get order lifecycle events
   * @param {string} orderId
   * @returns {Promise<Object[]>}
   */
  async getOrderLifecycle(orderId) {
    return await this.orderEventRepository.getOrderLifecycle(orderId);
  }
}

module.exports = { OrderService };
