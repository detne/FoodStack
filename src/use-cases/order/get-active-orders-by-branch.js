/**
 * ORDER-108: GetActiveOrdersByBranchUseCase
 * Returns ACTIVE orders for a branch.
 * Tab filtering (Pending/Preparing/Served) is based on the latest round's status.
 */

class GetActiveOrdersByBranchUseCase {
  constructor(orderRepository, branchRepository) {
    this.orderRepository = orderRepository;
    this.branchRepository = branchRepository;
  }

  async execute(branchId, options = {}, auth) {
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can view orders');
      err.status = 403;
      throw err;
    }

    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    if (auth.restaurantId && branch.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 50;
    const offset = (page - 1) * limit;

    // roundStatus: PENDING | PREPARING | SERVED | ALL (default)
    const roundStatus = options.roundStatus && options.roundStatus !== 'all'
      ? options.roundStatus.toUpperCase()
      : null;

    const result = await this.orderRepository.findActiveOrdersByBranch(branchId, {
      limit,
      offset,
      roundStatus,
      tableId: options.table_id,
    });

    return {
      orders: result.orders.map((order) => {
        const latestRound = order.order_rounds?.[0] || null; // already sorted desc, take 1
        return {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          active_round_status: latestRound?.status || null,
          payment_status: order.payment_status,
          subtotal: order.subtotal,
          tax: order.tax,
          service_charge: order.service_charge,
          total: order.total,
          customer_count: order.customer_count,
          table: {
            id: order.tables.id,
            table_number: order.tables.table_number,
            area_name: order.tables.areas?.name,
          },
          items_count: order._count?.order_items || 0,
          pending_cash_payment: (order.payments?.status === 'PENDING' && order.payments?.method === 'CASH')
            ? order.payments
            : null,
          created_at: order.created_at,
          updated_at: order.updated_at,
        };
      }),
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: Math.ceil(result.total / limit),
        has_next: page < Math.ceil(result.total / limit),
        has_prev: page > 1,
      },
      branch: { id: branch.id, name: branch.name },
    };
  }
}

module.exports = { GetActiveOrdersByBranchUseCase };
