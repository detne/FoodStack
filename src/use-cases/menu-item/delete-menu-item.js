// src/use-cases/menu-item/delete-menu-item.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class DeleteMenuItemUseCase {
  constructor(menuItemRepository, userRepository) {
    this.menuItemRepository = menuItemRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Owner/Manager)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      throw new UnauthorizedError('Only Owner or Manager can delete menu items');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem || menuItem.deleted_at) {
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
