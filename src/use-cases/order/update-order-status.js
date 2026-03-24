/**
 * ORDER-103: UpdateOrderStatusUseCase
 * Order-level status: ACTIVE → COMPLETED | CANCELLED
 * Round-level status is managed separately via UpdateRoundStatusUseCase.
 */

class UpdateOrderStatusUseCase {
  constructor(orderRepository, activityLogRepository) {
    this.orderRepository = orderRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async execute(orderId, newStatus, auth) {
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can update order status');
      err.status = 403;
      throw err;
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    const validTransitions = {
      // New model
      ACTIVE: ['COMPLETED', 'CANCELLED'],
      // Legacy statuses — treat as ACTIVE, allow completing/cancelling
      PENDING: ['COMPLETED', 'CANCELLED'],
      PREPARING: ['COMPLETED', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      SERVED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      const err = new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      err.status = 400;
      throw err;
    }

    const oldStatus = order.status;
    const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus);

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
      user_agent: auth.userAgent,
    });

    // Free the table when order is completed or cancelled
    if (['COMPLETED', 'CANCELLED'].includes(newStatus)) {
      await this.orderRepository.updateTableStatus(order.tables.id, 'AVAILABLE');
    }

    return {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      status: updatedOrder.status,
      previous_status: oldStatus,
      updated_at: updatedOrder.updated_at,
    };
  }
}

module.exports = { UpdateOrderStatusUseCase };
