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

    // 2. Validate branch exists
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new ValidationError('Branch not found');
    }

    // 3. Check duplicate category name in same branch
    const existingCategory = await this.categoryRepository.findByNameAndBranch(
      dto.name,
      dto.branchId
    );

    if (existingCategory) {
      throw new ValidationError('Category name already exists in this branch');
    }

    // 4. Create category
    const category = await this.categoryRepository.create({
      branchId: dto.branchId,
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder || 0,
    });

    return {
      categoryId: category.id,
      branchId: category.branch_id,
      name: category.name,
      description: category.description,
      sortOrder: category.sort_order,
      createdAt: category.created_at,
    };
  }
}

module.exports = { CreateCategoryUseCase };
