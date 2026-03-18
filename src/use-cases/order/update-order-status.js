/**
 * ORDER-103: UpdateOrderStatusUseCase
 * Cập nhật trạng thái đơn hàng
 */

class UpdateOrderStatusUseCase {
  constructor(orderRepository, activityLogRepository) {
    this.orderRepository = orderRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async execute(orderId, newStatus, auth) {
    // ✅ Acceptance 2: Chỉ staff có quyền cập nhật
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can update order status');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 1: Order tồn tại
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Check restaurant access
    if (auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 3: Không cho chuyển trạng thái sai logic
    const validTransitions = {
      'PENDING': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['SERVED', 'CANCELLED'],
      'SERVED': ['COMPLETED'],
      'COMPLETED': [], // Cannot change from completed
      'CANCELLED': [] // Cannot change from cancelled
    };

    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      const err = new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      err.status = 400;
      throw err;
    }

    const oldStatus = order.status;

    // Update order status
    const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus);

    // ✅ Acceptance 4: Lưu lịch sử thay đổi
    await this.activityLogRepository.create({
      user_id: auth.userId,
      restaurant_id: auth.restaurantId,
      branch_id: order.branch_id,
      action: 'UPDATE_ORDER_STATUS',
      entity_type: 'ORDER',
      entity_id: orderId,
      old_values: { status: oldStatus },
      new_values: { status: newStatus },
      ip_address: auth.ipAddress,
      user_agent: auth.userAgent
    });

    // If order is completed, free up the table
    if (newStatus === 'COMPLETED') {
      await this.orderRepository.updateTableStatus(order.tables.id, 'AVAILABLE');
    }

    return {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      status: updatedOrder.status,
      previous_status: oldStatus,
      updated_at: updatedOrder.updated_at
    };
  }
}

module.exports = { UpdateOrderStatusUseCase };