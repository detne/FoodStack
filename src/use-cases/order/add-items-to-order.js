/**
 * ORDER-104: AddItemsToOrderUseCase
 * Adds items to an ACTIVE order, routing to the correct round:
 * - Latest round PENDING/PREPARING → add to it
 * - Latest round SERVED (or no rounds) → create a new round
 */

class AddItemsToOrderUseCase {
  constructor(orderRepository, menuItemRepository) {
    this.orderRepository = orderRepository;
    this.menuItemRepository = menuItemRepository;
  }

  async execute(orderId, items, auth) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      const err = new Error('Cannot add items to a completed or cancelled order');
      err.status = 400;
      throw err;
    }

    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    let totalAddedAmount = 0;
    const orderItems = [];

    for (const item of items) {
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
        customizations: item.customizations || [],
      });
    }

    const { round, addedItems, updatedOrder } = await this.orderRepository.addItemsToOrderWithRound(
      orderId,
      orderItems,
      totalAddedAmount
    );

    return {
      order_id: orderId,
      round: {
        id: round.id,
        round_number: round.round_number,
        status: round.status,
      },
      added_items: addedItems.map((item) => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes,
        status: item.status,
      })),
      updated_totals: {
        subtotal: updatedOrder.subtotal,
        tax: updatedOrder.tax,
        service_charge: updatedOrder.service_charge,
        total: updatedOrder.total,
      },
    };
  }
}

module.exports = { AddItemsToOrderUseCase };
