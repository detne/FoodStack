/**
 * ORDER-102: GetOrderDetailsUseCase
 * Returns order with all rounds and their items.
 * For legacy orders (no rounds), backfills a virtual Round 1 from flat order_items.
 */

class GetOrderDetailsUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, auth) {
    const order = await this.orderRepository.findByIdWithDetails(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    let rounds = (order.order_rounds || []).map((round) => ({
      id: round.id,
      round_number: round.round_number,
      status: round.status,
      created_at: round.created_at,
      items: (round.order_items || []).map((item) => ({
        id: item.id,
        menu_item: {
          id: item.menu_items?.id,
          name: item.menu_items?.name,
          image_url: item.menu_items?.image_url,
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes,
        status: item.status,
      })),
    }));

    // ── Normalize legacy order status ──
    // Old orders may still have PENDING/PREPARING/SERVED — treat them as ACTIVE
    const OLD_ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    if (OLD_ACTIVE_STATUSES.includes(order.status)) {
      await this.orderRepository.updateStatus(orderId, 'ACTIVE');
      order.status = 'ACTIVE';
    }

    // ── Backfill: legacy order has no rounds but has flat order_items ──
    if (rounds.length === 0 && order.order_items && order.order_items.length > 0) {
      // Create a real Round 1 in the DB and link the items
      await this.orderRepository.backfillRoundForOrder(orderId, order.order_items);

      // Re-fetch to get the newly created round
      const refreshed = await this.orderRepository.findByIdWithDetails(orderId);
      rounds = (refreshed?.order_rounds || []).map((round) => ({
        id: round.id,
        round_number: round.round_number,
        status: round.status,
        created_at: round.created_at,
        items: (round.order_items || []).map((item) => ({
          id: item.id,
          menu_item: {
            id: item.menu_items?.id,
            name: item.menu_items?.name,
            image_url: item.menu_items?.image_url,
          },
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          notes: item.notes,
          status: item.status,
        })),
      }));
    }

    const latestRound = rounds[rounds.length - 1] || null;

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      active_round_status: latestRound?.status || null,
      payment_status: order.payment_status,
      subtotal: order.subtotal,
      tax: order.tax,
      service_charge: order.service_charge,
      total: order.total,
      customer_count: order.customer_count,
      table: {
        id: order.tables.id,
        table_number: order.tables.table_number,
        area_name: order.tables.areas.name,
        qr_token: order.tables.qr_token,
      },
      branch: {
        id: order.branches.id,
        name: order.branches.name,
        restaurant_id: order.branches.restaurant_id,
      },
      rounds,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }
}

module.exports = { GetOrderDetailsUseCase };
