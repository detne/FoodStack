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

    // 3. For Manager: validate they can only update items in their branch
    if (user.role === 'MANAGER') {
      if (!user.branch_id) {
        throw new UnauthorizedError('Manager must be assigned to a branch');
      }
      
      // Manager can only update availability for their branch
      // This will be handled via menu_item_availability table
      // For now, we prevent direct update to menu_items.available field
      throw new UnauthorizedError('Manager can only update availability through branch-specific endpoint');
    }

    // 4. Owner can update the global availability
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