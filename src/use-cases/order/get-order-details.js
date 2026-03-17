/**
 * ORDER-102: GetOrderDetailsUseCase
 * Xem chi tiết đơn hàng
 */

class GetOrderDetailsUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, auth) {
    // ✅ Acceptance 1: Order tồn tại
    const order = await this.orderRepository.findByIdWithDetails(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Authorization check - only staff of the same restaurant can view
    if (auth && auth.restaurantId) {
      if (order.branches.restaurant_id !== auth.restaurantId) {
        const err = new Error('Forbidden: Access denied');
        err.status = 403;
        throw err;
      }
    }

    // ✅ Acceptance 2-4: Trả danh sách order items, tổng tiền, status order
    return {
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
      branch: {
        id: order.branches.id,
        name: order.branches.name,
        restaurant_id: order.branches.restaurant_id
      },
      items: order.order_items.map(item => ({
        id: item.id,
        menu_item: {
          id: item.menu_items.id,
          name: item.menu_items.name,
          description: item.menu_items.description,
          image_url: item.menu_items.image_url
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes,
        customizations: [] // Tạm thời để trống vì chưa có relationship
      })),
      created_at: order.created_at,
      updated_at: order.updated_at
    };
  }
}

module.exports = { GetOrderDetailsUseCase };