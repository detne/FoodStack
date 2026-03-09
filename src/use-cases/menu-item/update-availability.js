const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateMenuItemAvailabilityUseCase {
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
      throw new UnauthorizedError('Only Owner or Manager can update menu item availability');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem || menuItem.deleted_at) {
      throw new ValidationError('Menu item not found');
    }

    // 3. Update availability
    const updatedMenuItem = await this.menuItemRepository.update(dto.menuItemId, {
      available: dto.available,
    });

    return {
      menuItemId: updatedMenuItem.id,
      name: updatedMenuItem.name,
      available: updatedMenuItem.available,
      updatedAt: updatedMenuItem.updated_at,
    };
  }
}

module.exports = { UpdateMenuItemAvailabilityUseCase };