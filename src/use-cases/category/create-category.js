// src/use-cases/category/create-category.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class CreateCategoryUseCase {
  constructor(categoryRepository, branchRepository, userRepository) {
    this.categoryRepository = categoryRepository;
    this.branchRepository = branchRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Owner/Manager)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      throw new UnauthorizedError('Only Owner or Manager can create categories');
    }

    // 2. Get restaurant_id from user or branch
    let restaurantId = user.restaurant_id;
    
    if (!restaurantId && dto.branchId) {
      const branch = await this.branchRepository.findById(dto.branchId);
      if (!branch) {
        throw new ValidationError('Branch not found');
      }
      restaurantId = branch.restaurant_id;
    }

    if (!restaurantId) {
      throw new ValidationError('Restaurant not found');
    }

    // 3. Check duplicate category name in same restaurant
    const existingCategory = await this.categoryRepository.findByNameAndRestaurant(
      dto.name,
      restaurantId
    );

    if (existingCategory) {
      throw new ValidationError('Category name already exists in this restaurant');
    }

    // 4. Create category (now at restaurant level)
    const category = await this.categoryRepository.create({
      restaurantId: restaurantId,
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder || 0,
    });

    return {
      categoryId: category.id,
      restaurantId: category.restaurant_id,
      name: category.name,
      description: category.description,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
    };
  }
}

module.exports = { CreateCategoryUseCase };
