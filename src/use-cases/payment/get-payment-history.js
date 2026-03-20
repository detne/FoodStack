class GetPaymentHistoryUseCase {
  constructor(paymentRepository, userRepository, prisma) {
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  mapPayment(item) {
    return {
      paymentId: item.id,
      orderId: item.order_id,
      orderNumber: item.orders?.order_number || null,
      amount: item.amount,
      method: item.method,
      status: item.status,
      transactionRef: item.transaction_ref,
      branch: item.orders?.branches
        ? {
            branchId: item.orders.branches.id,
            branchName: item.orders.branches.name,
          }
        : null,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  async execute(query, currentUser) {
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
      const err = new Error('You do not have permission to view payment history');
      err.status = 403;
      throw err;
    }

    let restaurantId = query.restaurantId;

    if (user.role === 'OWNER') {
      const ownedRestaurantIds = (user.owned_restaurants || []).map((r) =>
        String(r.id)
      );

      if (!restaurantId) {
        const err = new Error('restaurantId is required for OWNER');
        err.status = 400;
        throw err;
      }

      if (!ownedRestaurantIds.includes(String(restaurantId))) {
        const err = new Error('You do not have permission to view this restaurant payment history');
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

      if (restaurantId && String(restaurantId) !== String(managerRestaurantId)) {
        const err = new Error('You do not have permission to view this restaurant payment history');
        err.status = 403;
        throw err;
      }

      restaurantId = managerRestaurantId;
    }

    const restaurant = await this.prisma.restaurants.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      const err = new Error('Restaurant not found');
      err.status = 404;
      throw err;
    }

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const result = await this.paymentRepository.findPaymentHistoryByRestaurant(
      restaurantId,
      {
        page: query.page,
        limit: query.limit,
        startDate,
        endDate,
      }
    );

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      filters: {
        startDate: query.startDate || null,
        endDate: query.endDate || null,
      },
      items: result.items.map((item) => this.mapPayment(item)),
    };
  }
}

module.exports = { GetPaymentHistoryUseCase };