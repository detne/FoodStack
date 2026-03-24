/**
 * ORDER-109: GetCompletedOrdersByBranchUseCase
 * Returns COMPLETED orders for a branch (for the "Completed" tab in Staff portal).
 */

class GetCompletedOrdersByBranchUseCase {
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

    const result = await this.orderRepository.findCompletedOrdersByBranch(branchId, {
      limit,
      offset,
    });

    return {
      orders: result.orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        active_round_status: null,
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
        created_at: order.created_at,
        updated_at: order.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: Math.ceil(result.total / limit),
      },
      branch: { id: branch.id, name: branch.name },
    };
  }
}

module.exports = { GetCompletedOrdersByBranchUseCase };
