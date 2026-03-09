// src/use-cases/staff/delete-staff.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class DeleteStaffUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(staffId, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can delete staff accounts');
    }

    // 2. Validate staff exists
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new ValidationError('Staff not found');
    }

    // 3. Validate staff belongs to same restaurant
    if (staff.restaurant_id !== currentUser.restaurantId) {
      throw new UnauthorizedError('You can only delete staff in your restaurant');
    }

    // 4. Prevent deleting OWNER accounts (security)
    if (staff.role === 'OWNER') {
      throw new UnauthorizedError('Cannot delete owner account');
    }

    // 5. Check if already inactive
    if (staff.status === 'INACTIVE') {
      throw new ValidationError('Staff is already inactive');
    }

    // 6. Soft delete: Set status to INACTIVE
    const updatedStaff = await this.userRepository.update(staffId, {
      status: 'INACTIVE',
      updated_at: new Date(),
    });

    // 7. Invalidate all tokens for this staff (logout from all devices)
    await this.tokenService.bumpTokenVersion(staffId);

    // 8. Delete refresh token from Redis
    await this.tokenService.deleteRefreshToken(staffId);

    return {
      userId: updatedStaff.id,
      email: updatedStaff.email,
      name: updatedStaff.full_name,
      status: updatedStaff.status,
      message: 'Staff account has been deactivated successfully',
    };
  }
}

module.exports = { DeleteStaffUseCase };
