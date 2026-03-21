/**
 * ORDER-104: AddItemsToOrderUseCase
 * Thêm món vào đơn đang mở
 */

class AddItemsToOrderUseCase {
  constructor(orderRepository, menuItemRepository) {
    this.orderRepository = orderRepository;
    this.menuItemRepository = menuItemRepository;
  }

  async execute(orderId, items, auth) {
    // ✅ Acceptance 1: Order tồn tại
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // ✅ Acceptance 2: Order chưa COMPLETED (cho phép thêm món khi PENDING hoặc PREPARING)
    if (['SERVED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      const err = new Error('Cannot add items to completed or cancelled order');
      err.status = 400;
      throw err;
    }

    // Authorization check for staff
    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    let totalAddedAmount = 0;
    const orderItems = [];

    // Validate and prepare items
    for (const item of items) {
      // ✅ Acceptance 3: Menu item tồn tại
      const menuItem = await this.menuItemRepository.findById(item.menu_item_id);
      if (!menuItem || menuItem.deleted_at || !menuItem.available) {
        const err = new Error(`Menu item ${item.menu_item_id} not available`);
        err.status = 400;
        throw err;
      }

      const itemSubtotal = menuItem.price * item.quantity;
      totalAddedAmount += itemSubtotal;

      orderItems.push({
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal,
        notes: item.notes || null,
        customizations: item.customizations || []
      });
    }

    // ✅ Acceptance 4-5: Thêm order item thành công, cập nhật tổng tiền
    const result = await this.orderRepository.addItemsAndUpdateTotal(orderId, orderItems, totalAddedAmount);

    return {
      order_id: orderId,
      added_items: result.addedItems.map(item => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes
      })),
      updated_totals: {
        subtotal: result.updatedOrder.subtotal,
        tax: result.updatedOrder.tax,
        service_charge: result.updatedOrder.service_charge,
        total: result.updatedOrder.total
      },
      message: `Successfully added ${orderItems.length} items to order`
    };
  }
}

module.exports = { AddItemsToOrderUseCase };