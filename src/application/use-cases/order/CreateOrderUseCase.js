/**
 * Create Order Use Case
 * Orchestrates order creation with all side effects
 */

const { validateCreateOrder } = require('../../dtos/order/CreateOrderDto');
const { ValidationError, NotFoundError } = require('../../../core/errors');
const { EVENTS } = require('../../../config/constants');
const { logger } = require('../../../config/logger.config');

class CreateOrderUseCase {
  /**
   * @param {Object} dependencies
   * @param {import('../../../infrastructure/repositories/postgres/OrderRepository').OrderRepository} dependencies.orderRepository
   * @param {import('../../../infrastructure/repositories/postgres/TableRepository').TableRepository} dependencies.tableRepository
   * @param {import('../../../infrastructure/repositories/postgres/MenuRepository').MenuRepository} dependencies.menuRepository
   * @param {import('../../../infrastructure/repositories/mongodb/OrderEventRepository').OrderEventRepository} dependencies.orderEventRepository
   * @param {Object} dependencies.eventEmitter
   * @param {Object} dependencies.cacheService
   */
  constructor({
    orderRepository,
    tableRepository,
    menuRepository,
    orderEventRepository,
    eventEmitter,
    cacheService,
  }) {
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
    this.menuRepository = menuRepository;
    this.orderEventRepository = orderEventRepository;
    this.eventEmitter = eventEmitter;
    this.cacheService = cacheService;
  }

  /**
   * Execute use case
   * @param {Object} input
   * @param {import('../../dtos/order/CreateOrderDto').CreateOrderDto} input.orderData
   * @param {string} input.restaurantId
   * @param {string} input.branchId
   * @param {string} [input.customerId]
   * @returns {Promise<Object>}
   */
  async execute({ orderData, restaurantId, branchId, customerId }) {
    // 1. Validate input
    const validatedData = validateCreateOrder(orderData);

    logger.info('Creating order', {
      restaurantId,
      branchId,
      tableId: validatedData.tableId,
      itemsCount: validatedData.items.length,
    });

    // 2. Verify table exists and belongs to restaurant
    const table = await this.tableRepository.findById(validatedData.tableId, restaurantId);
    if (!table) {
      throw new NotFoundError('Table', validatedData.tableId);
    }

    if (table.branchId !== branchId) {
      throw new ValidationError('Table does not belong to this branch');
    }

    // 3. Verify all menu items exist and are available
    await this._verifyMenuItems(validatedData.items, branchId, restaurantId);

    // 4. Calculate order totals
    const orderTotals = await this._calculateOrderTotals(validatedData.items, restaurantId);

    // 5. Create order with items in transaction
    const order = await this.orderRepository.createWithItems(
      {
        restaurantId,
        branchId,
        tableId: validatedData.tableId,
        sessionId: validatedData.sessionId,
        status: 'Pending',
        subTotal: orderTotals.subTotal,
        taxAmount: orderTotals.taxAmount,
        serviceChargeAmount: orderTotals.serviceChargeAmount,
        discountAmount: 0,
        totalAmount: orderTotals.totalAmount,
        paymentStatus: 'Pending',
        notes: validatedData.notes,
      },
      validatedData.items,
      restaurantId
    );

    // 6. Log event to MongoDB
    await this.orderEventRepository.create({
      orderId: order.id,
      tableId: validatedData.tableId,
      restaurantId,
      branchId,
      action: 'ORDER_CREATED',
      performedBy: customerId || 'customer',
      details: {
        itemsCount: validatedData.items.length,
        totalAmount: orderTotals.totalAmount,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // 7. Invalidate cache
    await this._invalidateCache(branchId, validatedData.tableId);

    // 8. Emit real-time event
    this.eventEmitter.emit(EVENTS.ORDER_CREATED, {
      order,
      restaurantId,
      branchId,
      tableId: validatedData.tableId,
    });

    logger.info('Order created successfully', {
      orderId: order.id,
      restaurantId,
      totalAmount: order.totalAmount,
    });

    return order;
  }

  /**
   * Verify menu items exist and are available
   * @private
   * @param {Array} items
   * @param {string} branchId
   * @param {string} restaurantId
   */
  async _verifyMenuItems(items, branchId, restaurantId) {
    for (const item of items) {
      const menuItem = await this.menuRepository.findById(item.menuItemId, restaurantId);
      
      if (!menuItem) {
        throw new NotFoundError('Menu Item', item.menuItemId);
      }

      const isAvailable = await this.menuRepository.checkAvailability(
        item.menuItemId,
        branchId,
        restaurantId
      );

      if (!isAvailable) {
        throw new ValidationError(`Menu item '${menuItem.name}' is not available`);
      }
    }
  }

  /**
   * Calculate order totals
   * @private
   * @param {Array} items
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async _calculateOrderTotals(items, restaurantId) {
    let subTotal = 0;

    for (const item of items) {
      const menuItem = await this.menuRepository.findById(item.menuItemId, restaurantId);
      let itemTotal = menuItem.price * item.quantity;

      // Add customization costs
      if (item.customizations && item.customizations.length > 0) {
        const customizationTotal = item.customizations.reduce(
          (sum, custom) => sum + custom.priceDelta,
          0
        );
        itemTotal += customizationTotal * item.quantity;
      }

      subTotal += itemTotal;
    }

    // Calculate tax and service charge
    const taxRate = parseFloat(process.env.TAX_RATE || '0.10');
    const serviceChargeRate = parseFloat(process.env.SERVICE_CHARGE_RATE || '0.05');

    const taxAmount = subTotal * taxRate;
    const serviceChargeAmount = subTotal * serviceChargeRate;
    const totalAmount = subTotal + taxAmount + serviceChargeAmount;

    return {
      subTotal,
      taxAmount,
      serviceChargeAmount,
      totalAmount,
    };
  }

  /**
   * Invalidate related cache
   * @private
   * @param {string} branchId
   * @param {string} tableId
   */
  async _invalidateCache(branchId, tableId) {
    if (!this.cacheService) return;

    try {
      const { CACHE_KEYS } = require('../../../config/constants');
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS.ACTIVE_ORDERS(branchId)),
        this.cacheService.delete(CACHE_KEYS.TABLE(tableId)),
        this.cacheService.delete(CACHE_KEYS.TABLE_STATUS(tableId)),
      ]);
    } catch (error) {
      logger.warn('Failed to invalidate cache', { error: error.message });
    }
  }
}

module.exports = { CreateOrderUseCase };
