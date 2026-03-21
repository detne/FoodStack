// src/use-cases/restaurant/delete.js
const { ValidationError } = require('../../exception/validation-error');

class DeleteRestaurantUseCase {
  constructor(restaurantRepository) {
    this.restaurantRepository = restaurantRepository;
  }

  async execute(restaurantId, userId) {
    // 1. Get restaurant
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new ValidationError('Restaurant not found');
    }

    // 2. Check if already deleted
    if (restaurant.deleted_at) {
      throw new ValidationError('Restaurant already deleted');
    }

    // 3. Soft delete - set deleted_at timestamp
    await this.restaurantRepository.softDelete(restaurantId);

    return {
      message: 'Restaurant deactivated successfully',
      restaurantId: restaurantId,
    };
  }
}

module.exports = { DeleteRestaurantUseCase };
