// src/use-cases/menu-item/create-menu-item.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class CreateMenuItemUseCase {
  constructor(menuItemRepository, categoryRepository, userRepository) {
    this.menuItemRepository = menuItemRepository;
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
      throw new UnauthorizedError('Only Owner or Manager can create menu items');
    }

    // 2. Validate category exists
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.deleted_at) {
      throw new ValidationError('Category not found');
    }

    // 3. Validate price > 0
    if (dto.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }

    // 4. Create menu item
    const menuItem = await this.menuItemRepository.create({
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      available: dto.available,
    });

    return {
      menuItemId: menuItem.id,
      categoryId: menuItem.category_id,
      name: menuItem.name,
      description: menuItem.description,
      price: parseFloat(menuItem.price),
      imageUrl: menuItem.image_url,
      available: menuItem.available,
      createdAt: menuItem.created_at,
    };
  }
}

module.exports = { CreateMenuItemUseCase };
