const { PrismaClient } = require('@prisma/client');

// Standard includes reused across queries
const ORDER_ROUND_INCLUDE = {
  order_rounds: {
    orderBy: { round_number: 'asc' },
    include: {
      order_items: {
        include: {
          menu_items: { select: { id: true, name: true, image_url: true } },
        },
      },
    },
  },
};

const ORDER_BASE_INCLUDE = {
  branches: { select: { id: true, name: true, restaurant_id: true } },
  tables: {
    include: {
      areas: { select: { id: true, name: true, branch_id: true } },
    },
  },
};

class OrderRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  getClient(tx) {
    return tx || this.prisma;
  }

  // ─── Basic finders ────────────────────────────────────────────────────────

  async findById(orderId, tx) {
    const client = this.getClient(tx);
    return client.orders.findUnique({
      where: { id: orderId },
      include: ORDER_BASE_INCLUDE,
    });
  }

  async findByIdWithDetails(orderId, tx) {
    const client = this.getClient(tx);
    return client.orders.findUnique({
      where: { id: orderId },
      include: {
        ...ORDER_BASE_INCLUDE,
        ...ORDER_ROUND_INCLUDE,
        order_items: {
          include: {
            menu_items: { select: { id: true, name: true, description: true, image_url: true } },
          },
        },
      },
    });
  }

  /** Find the current ACTIVE order for a table (at most one) */
  async findActiveOrderByTable(tableId, tx) {
    const client = this.getClient(tx);
    return client.orders.findFirst({
      where: {
        table_id: tableId,
        status: { in: ['ACTIVE', 'PENDING', 'PREPARING', 'READY', 'SERVED'] },
      },
      include: {
        ...ORDER_BASE_INCLUDE,
        ...ORDER_ROUND_INCLUDE,
      },
    });
  }

  async findOrderItemById(orderItemId, tx) {
    const client = this.getClient(tx);
    return client.order_items.findUnique({
      where: { id: orderItemId },
      include: { menu_items: { select: { id: true, name: true } } },
    });
  }

  // ─── Round finders ────────────────────────────────────────────────────────

  async findRoundById(roundId, tx) {
    const client = this.getClient(tx);
    return client.order_rounds.findUnique({
      where: { id: roundId },
      include: {
        orders: {
          select: {
            id: true,
            branch_id: true,
            branches: { select: { restaurant_id: true } },
          },
        },
        order_items: {
          include: { menu_items: { select: { id: true, name: true } } },
        },
      },
    });
  }

  /** Get the latest round for an order */
  async findLatestRound(orderId, tx) {
    const client = this.getClient(tx);
    return client.order_rounds.findFirst({
      where: { order_id: orderId },
      orderBy: { round_number: 'desc' },
      include: {
        order_items: {
          include: { menu_items: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async countRoundsByOrder(orderId, tx) {
    const client = this.getClient(tx);
    return client.order_rounds.count({ where: { order_id: orderId } });
  }

  // ─── Counters ─────────────────────────────────────────────────────────────

  async countOrdersToday(branchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.prisma.orders.count({
      where: { branch_id: branchId, created_at: { gte: today, lt: tomorrow } },
    });
  }

  async countActiveOrdersByTableId(tableId, tx) {
    const client = this.getClient(tx);
    return client.orders.count({
      where: {
        table_id: tableId,
        status: { in: ['ACTIVE', 'PENDING', 'PREPARING', 'READY', 'SERVED'] },
      },
    });
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * Create a new order + first round + items atomically.
   * orderData: { branch_id, table_id, order_number, subtotal, tax, service_charge,
   *              total, payment_status, customer_count, items[] }
   */
  async createWithRound(orderData) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          branch_id: orderData.branch_id,
          table_id: orderData.table_id,
          order_number: orderData.order_number,
          status: 'ACTIVE',
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          service_charge: orderData.service_charge,
          total: orderData.total,
          payment_status: orderData.payment_status,
          customer_count: orderData.customer_count,
        },
      });

      const round = await tx.order_rounds.create({
        data: {
          order_id: order.id,
          round_number: 1,
          status: 'PREPARING', // Khách đã confirm → gửi bếp ngay
        },
      });

      const createdItems = await this._createItemsInRound(tx, order.id, round.id, orderData.items || [], 'PREPARING');

      return { ...order, order_rounds: [{ ...round, order_items: createdItems }] };
    });
  }

  // ─── Add items to existing order (round logic) ────────────────────────────

  /**
   * Add items to an order, routing to the correct round:
   * - If latest round is PENDING or PREPARING → add to it
   * - If latest round is SERVED (or no rounds) → create a new round
   * Returns { round, addedItems, updatedOrder }
   */
  async addItemsToOrderWithRound(orderId, orderItems, addedAmount) {
    return this.prisma.$transaction(async (tx) => {
      const latestRound = await tx.order_rounds.findFirst({
        where: { order_id: orderId },
        orderBy: { round_number: 'desc' },
      });

      let round;
      if (!latestRound || latestRound.status === 'SERVED') {
        // Round cũ đã SERVED → tạo round mới, gửi bếp ngay
        const roundCount = await tx.order_rounds.count({ where: { order_id: orderId } });
        round = await tx.order_rounds.create({
          data: {
            order_id: orderId,
            round_number: roundCount + 1,
            status: 'PREPARING', // Khách confirm → gửi bếp ngay
          },
        });
      } else if (latestRound.status === 'PENDING') {
        // Round đang PENDING → chuyển lên PREPARING và thêm món vào
        round = await tx.order_rounds.update({
          where: { id: latestRound.id },
          data: { status: 'PREPARING' },
        });
      } else {
        // Round đang PREPARING → thêm món vào round hiện tại
        round = latestRound;
      }

      const addedItems = await this._createItemsInRound(tx, orderId, round.id, orderItems, 'PREPARING');

      // Recalculate order totals
      const currentOrder = await tx.orders.findUnique({ where: { id: orderId } });
      const newSubtotal = parseFloat(currentOrder.subtotal) + addedAmount;
      const newTax = newSubtotal * 0.1;
      const newServiceCharge = newSubtotal * 0.05;
      const newTotal = newSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: { subtotal: newSubtotal, tax: newTax, service_charge: newServiceCharge, total: newTotal },
      });

      return { round, addedItems, updatedOrder };
    });
  }

  // ─── Round status updates ─────────────────────────────────────────────────

  async updateRoundStatus(roundId, newStatus, tx) {
    const client = this.getClient(tx);
    return client.order_rounds.update({
      where: { id: roundId },
      data: { status: newStatus },
    });
  }

  async updateAllItemsInRound(roundId, status, tx) {
    const client = this.getClient(tx);
    // MongoDB Prisma doesn't support updateMany with a filter on non-unique fields
    // so we fetch IDs first then update each
    const items = await client.order_items.findMany({
      where: { round_id: roundId },
      select: { id: true },
    });
    await Promise.all(
      items.map((item) => client.order_items.update({ where: { id: item.id }, data: { status } }))
    );
  }

  /** Mark a single order_item as SERVED, then auto-advance round if all items served */
  async markItemServedAndCheckRound(orderId, roundId, orderItemId) {
    return this.prisma.$transaction(async (tx) => {
      await tx.order_items.update({
        where: { id: orderItemId },
        data: { status: 'SERVED' },
      });

      // Check if all items in this round are now SERVED
      const unserved = await tx.order_items.count({
        where: { round_id: roundId, status: { not: 'SERVED' } },
      });

      let round;
      if (unserved === 0) {
        round = await tx.order_rounds.update({
          where: { id: roundId },
          data: { status: 'SERVED' },
        });
      } else {
        round = await tx.order_rounds.findUnique({ where: { id: roundId } });
      }

      return { round, allServed: unserved === 0 };
    });
  }

  // ─── Order status ─────────────────────────────────────────────────────────

  async updateStatus(orderId, newStatus, tx) {
    const client = this.getClient(tx);
    return client.orders.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  async updateTableStatus(tableId, status, tx) {
    const client = this.getClient(tx);
    return client.tables.update({ where: { id: tableId }, data: { status } });
  }

  async update(orderId, data, tx) {
    const client = this.getClient(tx);
    return client.orders.update({ where: { id: orderId }, data });
  }

  async cancelOrder(orderId, reason) {
    return this.prisma.orders.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancellation_reason: reason },
    });
  }

  // ─── Remove / update items ────────────────────────────────────────────────

  async removeItemAndUpdateTotal(orderId, orderItemId, removedAmount) {
    return this.prisma.$transaction(async (tx) => {
      await tx.order_item_customizations.deleteMany({ where: { order_item_id: orderItemId } });
      await tx.order_items.delete({ where: { id: orderItemId } });

      const currentOrder = await tx.orders.findUnique({ where: { id: orderId } });
      const newSubtotal = Math.max(0, parseFloat(currentOrder.subtotal) - removedAmount);
      const newTax = newSubtotal * 0.1;
      const newServiceCharge = newSubtotal * 0.05;
      const newTotal = newSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: { subtotal: newSubtotal, tax: newTax, service_charge: newServiceCharge, total: newTotal },
      });
      return { updatedOrder };
    });
  }

  async updateOrderItemAndTotal(orderId, orderItemId, newQuantity, newSubtotal, subtotalDifference) {
    return this.prisma.$transaction(async (tx) => {
      await tx.order_items.update({
        where: { id: orderItemId },
        data: { quantity: newQuantity, subtotal: newSubtotal },
      });

      const currentOrder = await tx.orders.findUnique({ where: { id: orderId } });
      const newOrderSubtotal = parseFloat(currentOrder.subtotal) + subtotalDifference;
      const newTax = newOrderSubtotal * 0.1;
      const newServiceCharge = newOrderSubtotal * 0.05;
      const newTotal = newOrderSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: { subtotal: newOrderSubtotal, tax: newTax, service_charge: newServiceCharge, total: newTotal },
      });
      return { updatedOrder };
    });
  }

  // ─── Branch queries ───────────────────────────────────────────────────────

  /**
   * Find orders for staff list view.
   * Tab filter is based on the latest round's status (not order.status).
   * order.status is only ACTIVE / COMPLETED / CANCELLED.
   */
  async findActiveOrdersByBranch(branchId, options = {}) {
    const { limit = 50, offset = 0, roundStatus, tableId } = options;

    // Base: ACTIVE orders + legacy orders that haven't been migrated yet
    const ACTIVE_STATUSES = ['ACTIVE', 'PENDING', 'PREPARING', 'READY', 'SERVED'];
    const orderWhere = { branch_id: branchId, status: { in: ACTIVE_STATUSES } };
    if (tableId) orderWhere.table_id = tableId;

    // If filtering by round status, we need to find orders whose latest round matches
    if (roundStatus && roundStatus !== 'ALL') {
      // Get order IDs whose latest round has the requested status
      const matchingRounds = await this.prisma.order_rounds.findMany({
        where: { orders: { branch_id: branchId, status: 'ACTIVE' }, status: roundStatus },
        select: { order_id: true, round_number: true },
        orderBy: { round_number: 'desc' },
      });

      // Keep only the latest round per order
      const latestByOrder = new Map();
      for (const r of matchingRounds) {
        if (!latestByOrder.has(r.order_id) || r.round_number > latestByOrder.get(r.order_id).round_number) {
          latestByOrder.set(r.order_id, r);
        }
      }
      orderWhere.id = { in: [...latestByOrder.keys()] };
    }

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where: orderWhere,
        include: {
          tables: {
            include: { areas: { select: { id: true, name: true } } },
          },
          order_rounds: {
            orderBy: { round_number: 'desc' },
            take: 1, // only latest round for list view
          },
          payments: {
            select: { id: true, method: true, status: true },
          },
          _count: { select: { order_items: true } },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where: orderWhere }),
    ]);

    return { orders, total };
  }
  async findCompletedOrdersByBranch(branchId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const where = { branch_id: branchId, status: 'COMPLETED' };

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          tables: {
            include: { areas: { select: { id: true, name: true } } },
          },
          order_rounds: {
            orderBy: { round_number: 'desc' },
            take: 1,
          },
          _count: { select: { order_items: true } },
        },
        orderBy: { updated_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { orders, total };
  }

  async findOrdersByTable(tableId, options = {}) {
    const { limit = 20, offset = 0, startDate, endDate, status } = options;
    const where = { table_id: tableId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: { _count: { select: { order_items: true } } },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where }),
    ]);
    return { orders, total };
  }

  async findCompletedOrdersByBranch(branchId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const where = { branch_id: branchId, status: 'COMPLETED' };

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          tables: {
            include: { areas: { select: { id: true, name: true } } },
          },
          order_rounds: {
            orderBy: { round_number: 'desc' },
            take: 1,
          },
          _count: { select: { order_items: true } },
        },
        orderBy: { updated_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { orders, total };
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async sumRevenueByBranch(branchId, filters = {}) {
    const { from_date, to_date } = filters;
    const where = { branch_id: branchId, payment_status: 'PAID' };
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = from_date;
      if (to_date) where.created_at.lte = to_date;
    }
    const result = await this.prisma.orders.aggregate({ where, _sum: { total: true } });
    return Number(result._sum.total || 0);
  }

  async countByBranch(branchId, filters = {}) {
    const { from_date, to_date } = filters;
    const where = { branch_id: branchId };
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = from_date;
      if (to_date) where.created_at.lte = to_date;
    }
    return this.prisma.orders.count({ where });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Backfill: create Round 1 for a legacy order that has flat order_items but no rounds.
   * Links all existing items to the new round.
   */
  async backfillRoundForOrder(orderId, existingItems) {
    return this.prisma.$transaction(async (tx) => {
      // Guard: don't create if a round already exists
      const existing = await tx.order_rounds.findFirst({ where: { order_id: orderId } });
      if (existing) return existing;

      const round = await tx.order_rounds.create({
        data: {
          order_id: orderId,
          round_number: 1,
          status: 'PREPARING', // backfill cũng coi như đang preparing
        },
      });

      // Link all items to this round
      await Promise.all(
        existingItems.map((item) =>
          tx.order_items.update({
            where: { id: item.id },
            data: {
              round_id: round.id,
              status: item.status || 'PENDING',
            },
          })
        )
      );

      return round;
    });
  }

  async _createItemsInRound(tx, orderId, roundId, items, itemStatus = 'PREPARING') {
    return Promise.all(
      items.map(async (item) => {
        const { customizations, ...itemData } = item;
        const orderItem = await tx.order_items.create({
          data: {
            order_id: orderId,
            round_id: roundId,
            menu_item_id: itemData.menu_item_id,
            quantity: itemData.quantity,
            price: itemData.price,
            subtotal: itemData.subtotal,
            notes: itemData.notes || null,
            status: itemStatus,
          },
        });

        if (customizations && customizations.length > 0) {
          await Promise.all(
            customizations.map((c) =>
              tx.order_item_customizations.create({
                data: {
                  order_item_id: orderItem.id,
                  customization_option_id: c.customization_option_id,
                  price_delta: c.price_delta,
                },
              })
            )
          );
        }
        return orderItem;
      })
    );
  }
}

module.exports = { OrderRepository };
