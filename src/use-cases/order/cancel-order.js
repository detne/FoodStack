/**
 * ORDER-107: CancelOrderUseCase
 * Hủy đơn hàng
 */

class CancelOrderUseCase {
  constructor(orderRepository, activityLogRepository) {
    this.orderRepository = orderRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async execute(orderId, reason, auth) {
    // Authorization - only manager or staff can cancel
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can cancel orders');
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

    // ✅ Acceptance 2: Order chưa PREPARING
    if (['PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      const err = new Error('Cannot cancel order that is being prepared or already completed');
      err.status = 400;
      throw err;
    }

    const oldStatus = order.status;

    // ✅ Acceptance 3-4: Cập nhật status = CANCELLED, lưu lý do hủy
    const cancelledOrder = await this.orderRepository.cancelOrder(orderId, reason);

    // Log the cancellation
    await this.activityLogRepository.create({
      user_id: auth.userId,
      restaurant_id: auth.restaurantId,
      branch_id: order.branch_id,
      action: 'CANCEL_ORDER',
      entity_type: 'ORDER',
      entity_id: orderId,
      old_values: { status: oldStatus },
      new_values: { 
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_by: auth.userId,
        cancelled_at: new Date()
      },
      ip_address: auth.ipAddress,
      user_agent: auth.userAgent
    });

    // Free up the table
    await this.orderRepository.updateTableStatus(order.tables.id, 'AVAILABLE');

    return {
      id: cancelledOrder.id,
      order_number: cancelledOrder.order_number,
      status: cancelledOrder.status,
      previous_status: oldStatus,
      cancellation_reason: reason,
      cancelled_by: auth.userId,
      cancelled_at: cancelledOrder.updated_at,
      message: 'Order cancelled successfully'
    };
  }
}

module.exports = { CancelOrderUseCase };