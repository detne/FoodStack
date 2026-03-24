/**
 * UpdateRoundStatusUseCase
 * Staff transitions a round: PENDING → PREPARING → SERVED
 */

class UpdateRoundStatusUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, roundId, newStatus, auth) {
    if (!auth || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Forbidden: Only staff can update round status');
      err.status = 403;
      throw err;
    }

    const round = await this.orderRepository.findRoundById(roundId);
    if (!round || round.order_id !== orderId) {
      const err = new Error('Round not found');
      err.status = 404;
      throw err;
    }

    if (auth.restaurantId && round.orders.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    const validTransitions = {
      // PENDING không còn dùng trong flow mới, nhưng giữ lại để tương thích
      PENDING: ['PREPARING', 'SERVED'],
      PREPARING: ['SERVED'],
      SERVED: [],
    };

    const allowed = validTransitions[round.status] || [];
    if (!allowed.includes(newStatus)) {
      const err = new Error(`Invalid round status transition from ${round.status} to ${newStatus}`);
      err.status = 400;
      throw err;
    }

    const updatedRound = await this.orderRepository.updateRoundStatus(roundId, newStatus);

    // Sync all items in the round to the same status
    await this.orderRepository.updateAllItemsInRound(roundId, newStatus);

    return {
      round_id: updatedRound.id,
      round_number: updatedRound.round_number,
      status: updatedRound.status,
      order_id: orderId,
    };
  }
}

module.exports = { UpdateRoundStatusUseCase };
