/**
 * ORDER-105: RemoveItemFromOrderUseCase
 * Xóa món khỏi đơn
 */

class RemoveItemFromOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, orderItemId, auth) {
    // ✅ Acceptance 1: Order tồn tại
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Only allow removal from ACTIVE orders; item must be in a PENDING round
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      const err = new Error('Cannot remove items from a completed or cancelled order');
      err.status = 400;
      throw err;
    }

    // Authorization check
    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    // Find the order item
    const orderItem = await this.orderRepository.findOrderItemById(orderItemId);
    if (!orderItem || orderItem.order_id !== orderId) {
      const err = new Error('Order item not found');
      err.status = 404;
      throw err;
    }

    // Only allow removal if item is still PENDING
    if (orderItem.status !== 'PENDING') {
      const err = new Error('Cannot remove an item that is already being prepared or served');
      err.status = 400;
      throw err;
    }

    // ✅ Acceptance 3-4: Xóa order item thành công, cập nhật tổng tiền
    const removedAmount = orderItem.subtotal;
    const result = await this.orderRepository.removeItemAndUpdateTotal(orderId, orderItemId, removedAmount);

    return {
      order_id: orderId,
      removed_item: {
        id: orderItemId,
        menu_item_name: orderItem.menu_items?.name,
        quantity: orderItem.quantity,
        subtotal: orderItem.subtotal
      },
      updated_totals: {
        subtotal: result.updatedOrder.subtotal,
        tax: result.updatedOrder.tax,
        service_charge: result.updatedOrder.service_charge,
        total: result.updatedOrder.total
      },
      message: 'Item removed successfully'
    };
  }
}

module.exports = { RemoveItemFromOrderUseCase };