/**
 * Mark a single order item as SERVED.
 * If all items in the round are now SERVED, the round auto-transitions to SERVED.
 */
class MarkItemServedUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, roundId, itemId, auth) {
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    const item = await this.orderRepository.findOrderItemById(itemId);
    if (!item) {
      const err = new Error('Order item not found');
      err.status = 404;
      throw err;
    }

    if (item.order_id !== orderId) {
      const err = new Error('Item does not belong to this order');
      err.status = 400;
      throw err;
    }

    if (item.round_id !== roundId) {
      const err = new Error('Item does not belong to this round');
      err.status = 400;
      throw err;
    }

    if (item.status === 'SERVED') {
      return { itemId, roundId, allServed: false, message: 'Item already served' };
    }

    const result = await this.orderRepository.markItemServedAndCheckRound(orderId, roundId, itemId);

    return {
      itemId,
      roundId,
      roundStatus: result.round?.status,
      allServed: result.allServed,
    };
  }
}

module.exports = { MarkItemServedUseCase };
