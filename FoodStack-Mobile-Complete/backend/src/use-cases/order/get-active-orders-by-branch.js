/**
 * ORDER-108: GetActiveOrdersByBranchUseCase
 * Lấy danh sách đơn đang hoạt động trong chi nhánh
 */

class GetActiveOrdersByBranchUseCase {
  constructor(orderRepository, branchRepository) {
    this.orderRepository = orderRepository;
    this.branchRepository = branchRepository;
  }

  async execute(branchId, options = {}, auth) {
    // Authorization check
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can view orders');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 1: Branch tồn tại
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // Check restaurant access
    if (auth.restaurantId && branch.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 4: Hỗ trợ pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;

    // Additional filters
    const status = options.status; // Optional status filter
    const tableId = options.table_id; // Optional table filter

    // ✅ Acceptance 2-3: Trả danh sách order, chỉ hiển thị order chưa COMPLETED
    const result = await this.orderRepository.findActiveOrdersByBranch(
      branchId, 
      { 
        limit, 
        offset, 
        status, 
        tableId 
      }
    );

    return {
      orders: result.orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        subtotal: order.subtotal,
        tax: order.tax,
        service_charge: order.service_charge,
        total: order.total,
        customer_count: order.customer_count,
        table: {
          id: order.tables.id,
          table_number: order.tables.table_number,
          area_name: order.tables.areas.name
        },
        items_count: order._count?.order_items || 0,
        created_at: order.created_at,
        updated_at: order.updated_at
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: Math.ceil(result.total / limit),
        has_next: page < Math.ceil(result.total / limit),
        has_prev: page > 1
      },
      branch: {
        id: branch.id,
        name: branch.name,
        restaurant_id: branch.restaurant_id
      }
    };
  }
}

module.exports = { GetActiveOrdersByBranchUseCase };