// src/use-cases/menu-item/update-menu-item.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateMenuItemUseCase {
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
      throw new UnauthorizedError('Only Owner or Manager can update menu items');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem || menuItem.deleted_at) {
      throw new ValidationError('Menu item not found');
    }

    // 3. Validate category if changing
    if (dto.categoryId && dto.categoryId !== menuItem.category_id) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || category.deleted_at) {
        throw new ValidationError('Category not found');
      }
    }

    // 4. Validate price if provided
    if (dto.price !== undefined && dto.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }

    // 5. Update menu item
    const updateData = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.categoryId) updateData.category_id = dto.categoryId;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.available !== undefined) updateData.available = dto.available;

    const updatedMenuItem = await this.menuItemRepository.update(dto.menuItemId, updateData);

    return {
      menuItemId: updatedMenuItem.id,
      categoryId: updatedMenuItem.category_id,
      name: updatedMenuItem.name,
      description: updatedMenuItem.description,
      price: parseFloat(updatedMenuItem.price),
      imageUrl: updatedMenuItem.image_url,
      available: updatedMenuItem.available,
      updatedAt: updatedMenuItem.updated_at,
    };
  }
}

module.exports = { UpdateMenuItemUseCase };
