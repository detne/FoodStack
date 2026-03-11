// src/use-cases/staff/set-staff-status.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class SetStaffStatusUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(staffId, dto, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can activate/deactivate staff');
    }

    // 2. Validate staff exists
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new ValidationError('Staff not found');
    }

    // 3. Validate staff belongs to same restaurant
    if (staff.restaurant_id !== currentUser.restaurantId) {
      throw new UnauthorizedError('You can only manage staff in your restaurant');
    }

    // 4. Prevent changing status of OWNER accounts
    if (staff.role === 'OWNER') {
      throw new UnauthorizedError('Cannot change owner account status');
    }

    // 5. Check if status is already the same
    if (staff.status === dto.status) {
      return {
        userId: staff.id,
        email: staff.email,
        name: staff.full_name,
        status: staff.status,
        message: `Staff is already ${dto.status}`,
      };
    }

    // 6. Update status
    const updatedStaff = await this.userRepository.update(staffId, {
      status: dto.status,
      updated_at: new Date(),
    });

    return {
      userId: updatedStaff.id,
      email: updatedStaff.email,
      name: updatedStaff.full_name,
      status: updatedStaff.status,
      message: dto.status === 'ACTIVE' 
        ? 'Staff account activated successfully' 
        : 'Staff account deactivated successfully',
    };
  }
}

module.exports = { SetStaffStatusUseCase };
