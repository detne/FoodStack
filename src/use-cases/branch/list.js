// src/use-cases/branch/list.js
class ListBranchesUseCase {
  constructor(branchRepository, restaurantRepository) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
  }

  async execute(dto) {
    const { restaurantId, page, limit } = dto;

    // ✅ Restaurant tồn tại
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      const err = new Error('Restaurant not found');
      err.status = 404;
      throw err;
    }

    // ✅ Trả danh sách + tổng
    const { items, total } = await this.branchRepository.listByRestaurant(
      restaurantId,
      page,
      limit
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = { ListBranchesUseCase };