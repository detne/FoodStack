// src/use-cases/category/delete-category.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class DeleteCategoryUseCase {
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
      throw new UnauthorizedError('Only Owner or Manager can delete categories');
    }

    // 2. Validate category exists
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.deleted_at) {
      throw new ValidationError('Category not found');
    }

    // 3. Check if category has menu items
    const menuItemCount = await this.categoryRepository.countMenuItems(dto.categoryId);
    if (menuItemCount > 0) {
      throw new ValidationError(
        `Cannot delete category. It has ${menuItemCount} menu item(s). Please remove or reassign them first.`
      );
    }

    // 4. Soft delete category
    await this.categoryRepository.softDelete(dto.categoryId);

    return {
      message: 'Category deleted successfully',
      categoryId: dto.categoryId,
    };
  }
}

module.exports = { DeleteCategoryUseCase };
