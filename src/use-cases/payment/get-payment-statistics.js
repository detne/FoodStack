class GetPaymentStatisticsUseCase {
  constructor(paymentRepository, userRepository, prisma) {
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
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
      const err = new Error('You do not have permission to view payment statistics');
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
        const err = new Error('You do not have permission to view this restaurant payment statistics');
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
        const err = new Error('You do not have permission to view this restaurant payment statistics');
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

    const stats = await this.paymentRepository.getPaymentStatisticsByRestaurant(
      restaurantId,
      {
        startDate,
        endDate,
      }
    );

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      filters: {
        startDate: query.startDate || null,
        endDate: query.endDate || null,
      },
      totalRevenue: stats.totalRevenue,
      transactionCount: stats.transactionCount,
    };
  }
}

module.exports = { GetPaymentStatisticsUseCase };