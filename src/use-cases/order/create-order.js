/**
 * ORDER-101: CreateOrderUseCase
 * - If table already has an ACTIVE order → reuse it, add items as a new round
 * - Otherwise → create a new order with round 1
 */

const { v4: uuidv4 } = require('uuid');

class CreateOrderUseCase {
  constructor(orderRepository, tableRepository, branchRepository, menuItemRepository) {
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
    this.branchRepository = branchRepository;
    this.menuItemRepository = menuItemRepository;
  }

  async execute(dto) {
    const { qr_token, items = [], customer_count = 1 } = dto;

    const table = await this.tableRepository.findByQrToken(qr_token);
    if (!table || table.deleted_at) {
      const err = new Error('Invalid QR code');
      err.status = 400;
      throw err;
    }

    const normalizedCustomerCount = Number(customer_count);
    if (!Number.isInteger(normalizedCustomerCount) || normalizedCustomerCount <= 0) {
      const err = new Error('customer_count must be a positive integer');
      err.status = 400;
      throw err;
    }

    const branch = await this.branchRepository.findById(table.areas.branch_id);
    if (!branch || branch.status !== 'ACTIVE') {
      const err = new Error('Branch is not active');
      err.status = 400;
      throw err;
    }

    // Validate items (required for first order creation)
    if (!items || items.length === 0) {
      const err = new Error('At least one item is required to start an order');
      err.status = 400;
      throw err;
    }

    const { orderItems, subtotal } = await this._validateAndPrepareItems(items);
    const tax = subtotal * 0.1;
    const service_charge = subtotal * 0.05;
    const total = subtotal + tax + service_charge;

    // Check if table already has an ACTIVE order
    const existingOrder = await this.orderRepository.findActiveOrderByTable(table.id);

    if (existingOrder) {
      // Reuse existing order — add items to appropriate round
      const { round, addedItems, updatedOrder } = await this.orderRepository.addItemsToOrderWithRound(
        existingOrder.id,
        orderItems,
        subtotal
      );

      return this._formatResponse(updatedOrder, existingOrder.tables || table, branch, round, addedItems, false);
    }

    // Create brand new order
    const orderNumber = await this._generateOrderNumber(branch.id);
    const order = await this.orderRepository.createWithRound({
      branch_id: branch.id,
      table_id: table.id,
      order_number: orderNumber,
      subtotal,
      tax,
      service_charge,
      total,
      payment_status: 'UNPAID',
      customer_count: normalizedCustomerCount,
      items: orderItems,
    });

    await this.tableRepository.updateStatus(table.id, 'OCCUPIED');

    const firstRound = order.order_rounds?.[0];
    return this._formatResponse(order, table, branch, firstRound, firstRound?.order_items || [], true);
  }

  async _validateAndPrepareItems(items) {
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findById(item.menu_item_id);
      if (!menuItem || !menuItem.available) {
        const err = new Error(`Menu item ${item.menu_item_id} not available`);
        err.status = 400;
        throw err;
      }
      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal,
        notes: item.notes || null,
        customizations: item.customizations || [],
      });
    }

    return { orderItems, subtotal };
  }

  _formatResponse(order, table, branch, round, addedItems, isNew) {
    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      service_charge: order.service_charge,
      total: order.total,
      payment_status: order.payment_status,
      is_new_order: isNew,
      table: {
        id: table.id,
        table_number: table.table_number,
        area_name: table.areas?.name,
      },
      branch: { id: branch.id, name: branch.name },
      current_round: round
        ? {
            id: round.id,
            round_number: round.round_number,
            status: round.status,
            items: addedItems,
          }
        : null,
      created_at: order.created_at,
    };
  }

  async _generateOrderNumber(branchId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.orderRepository.countOrdersToday(branchId);
    return `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
}

module.exports = { CreateOrderUseCase };
