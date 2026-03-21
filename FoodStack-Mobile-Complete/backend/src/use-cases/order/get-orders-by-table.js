/**
 * ORDER-109: GetOrdersByTableUseCase
 * Xem lịch sử đơn theo bàn
 */

class GetOrdersByTableUseCase {
  constructor(orderRepository, tableRepository) {
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
  }

  async execute(tableId, options = {}, auth) {
    // ✅ Acceptance 1: Table tồn tại
    const table = await this.tableRepository.findById(tableId);
    if (!table) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // Authorization check for staff
    if (auth && auth.restaurantId) {
      if (table.areas.branches.restaurant_id !== auth.restaurantId) {
        const err = new Error('Forbidden: Access denied');
        err.status = 403;
        throw err;
      }
    }

    // Pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;

    // Date range filters
    const startDate = options.start_date ? new Date(options.start_date) : null;
    const endDate = options.end_date ? new Date(options.end_date) : null;
    const status = options.status; // Optional status filter

    // ✅ Acceptance 2-3: Trả danh sách order, sắp xếp theo thời gian
    const result = await this.orderRepository.findOrdersByTable(
      tableId,
      {
        limit,
        offset,
        startDate,
        endDate,
        status
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
      table: {
        id: table.id,
        table_number: table.table_number,
        capacity: table.capacity,
        area: {
          id: table.areas.id,
          name: table.areas.name
        },
        branch: {
          id: table.areas.branches.id,
          name: table.areas.branches.name,
          restaurant_id: table.areas.branches.restaurant_id
        }
      },
      summary: {
        total_orders: result.total,
        date_range: {
          start: startDate,
          end: endDate
        }
      }
    };
  }
}

module.exports = { GetOrdersByTableUseCase };