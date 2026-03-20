class GetPaymentDetailsUseCase {
  constructor(paymentRepository, orderRepository, userRepository) {
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  async execute(paymentId, currentUser) {
    const currentUserId = currentUser?.id || currentUser?.userId;

    if (!currentUserId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const user = await this.userRepository.findById(currentUserId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      const err = new Error('You do not have permission to view payment details');
      err.status = 403;
      throw err;
    }

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      const err = new Error('Payment not found');
      err.status = 404;
      throw err;
    }

    const order = await this.orderRepository.findById(payment.order_id);
    if (!order) {
      const err = new Error('Order not found for this payment');
      err.status = 404;
      throw err;
    }

    const restaurantId = order.branches?.restaurant_id;
    if (!restaurantId) {
      const err = new Error('Restaurant not found for this payment');
      err.status = 404;
      throw err;
    }

    if (user.role === 'OWNER') {
      const ownedRestaurantIds = (user.owned_restaurants || []).map((r) =>
        String(r.id)
      );

      if (!ownedRestaurantIds.includes(String(restaurantId))) {
        const err = new Error('You do not have permission to view this payment');
        err.status = 403;
        throw err;
      }
    }

    if (user.role === 'MANAGER') {
      const managerRestaurantId =
        user.restaurant_id || currentUser?.restaurant_id || currentUser?.restaurantId;

      if (!managerRestaurantId) {
        const err = new Error('Manager is not assigned to any restaurant');
        err.status = 403;
        throw err;
      }

      if (String(managerRestaurantId) !== String(restaurantId)) {
        const err = new Error('You do not have permission to view this payment');
        err.status = 403;
        throw err;
      }
    }

    return {
      paymentId: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
    };
  }
}

module.exports = { GetPaymentDetailsUseCase };