// src/use-cases/menu-item/delete-menu-item.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class DeleteMenuItemUseCase {
  constructor(menuItemRepository, userRepository) {
    this.menuItemRepository = menuItemRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Only Owner can delete menu items)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'OWNER') {
      throw new UnauthorizedError('Only Owner can delete menu items');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem) {
      throw new ValidationError('Menu item not found');
    }

    // 3. Soft delete menu item
    await this.menuItemRepository.softDelete(dto.menuItemId);

    return {
      message: 'Menu item deleted successfully',
      menuItemId: dto.menuItemId,
    };
  }
}

module.exports = { DeleteMenuItemUseCase };
