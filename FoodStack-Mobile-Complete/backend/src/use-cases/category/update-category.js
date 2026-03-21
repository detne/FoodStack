// src/use-cases/category/update-category.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateCategoryUseCase {
  constructor(categoryRepository, userRepository) {
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Owner/Manager)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      throw new UnauthorizedError('Only Owner or Manager can update categories');
    }

    // 2. Validate category exists
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.deleted_at) {
      throw new ValidationError('Category not found');
    }

    // 3. Check duplicate name if name is being changed
    if (dto.name && dto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findByNameAndBranch(
        dto.name,
        category.branch_id
      );

      if (existingCategory && existingCategory.id !== dto.categoryId) {
        throw new ValidationError('Category name already exists in this branch');
      }
    }

    // 4. Update category
    const updateData = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;

    const updatedCategory = await this.categoryRepository.update(dto.categoryId, updateData);

    return {
      categoryId: updatedCategory.id,
      branchId: updatedCategory.branch_id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      sortOrder: updatedCategory.sort_order,
      updatedAt: updatedCategory.updated_at,
    };
  }
}

module.exports = { UpdateCategoryUseCase };
