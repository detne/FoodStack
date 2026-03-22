// src/use-cases/menu-item/update-branch-availability.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateBranchAvailabilityUseCase {
  constructor(menuItemAvailabilityRepository, menuItemRepository, userRepository) {
    this.menuItemAvailabilityRepository = menuItemAvailabilityRepository;
    this.menuItemRepository = menuItemRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Manager or Owner)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'MANAGER' && user.role !== 'OWNER') {
      throw new UnauthorizedError('Only Manager or Owner can update branch-specific availability');
    }

    // 2. Get branch_id: from DTO (frontend), or from user
    const branchId = dto.branchId || user.branch_id;
    
    if (!branchId) {
      throw new UnauthorizedError('Branch ID is required to update availability');
    }

    // 3. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem || menuItem.deleted_at) {
      throw new ValidationError('Menu item not found');
    }

    // 4. Update or create branch-specific availability
    const availabilityData = {
      menuItemId: dto.menuItemId,
      branchId: branchId,
      isAvailable: dto.available,
      reason: dto.reason || null,
    };

    const result = await this.menuItemAvailabilityRepository.upsert(availabilityData);

    return {
      menuItemId: result.menu_item_id,
      branchId: result.branch_id,
      isAvailable: result.is_available,
      reason: result.reason,
      updatedAt: result.updated_at,
    };
  }
}

module.exports = { UpdateBranchAvailabilityUseCase };
