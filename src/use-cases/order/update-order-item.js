/**
 * ORDER-106: UpdateOrderItemUseCase
 * Cập nhật số lượng món trong order
 */

class UpdateOrderItemUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, orderItemId, newQuantity, auth) {
    // ✅ Acceptance 2: Quantity > 0
    if (!newQuantity || newQuantity <= 0) {
      const err = new Error('Quantity must be greater than 0');
      err.status = 400;
      throw err;
    }

    // Check order exists
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Only allow updates for pending orders
    if (['PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      const err = new Error('Cannot update items in order that is being prepared or completed');
      err.status = 400;
      throw err;
    }

    // Authorization check
    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 1: Order item tồn tại
    const orderItem = await this.orderRepository.findOrderItemById(orderItemId);
    if (!orderItem || orderItem.order_id !== orderId) {
      const err = new Error('Order item not found');
      err.status = 404;
      throw err;
    }

    const oldQuantity = orderItem.quantity;
    const oldSubtotal = orderItem.subtotal;
    const newSubtotal = orderItem.price * newQuantity;
    const subtotalDifference = newSubtotal - oldSubtotal;

    // ✅ Acceptance 3-4: Cập nhật thành công, cập nhật tổng tiền
    const result = await this.orderRepository.updateOrderItemAndTotal(
      orderId, 
      orderItemId, 
      newQuantity, 
      newSubtotal, 
      subtotalDifference
    );

    return {
      order_id: orderId,
      updated_item: {
        id: orderItemId,
        menu_item_name: orderItem.menu_items?.name,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        price: orderItem.price,
        old_subtotal: oldSubtotal,
        new_subtotal: newSubtotal
      },
      updated_totals: {
        subtotal: result.updatedOrder.subtotal,
        tax: result.updatedOrder.tax,
        service_charge: result.updatedOrder.service_charge,
        total: result.updatedOrder.total
      },
      message: 'Order item updated successfully'
    };
  }
}

module.exports = { UpdateOrderItemUseCase };