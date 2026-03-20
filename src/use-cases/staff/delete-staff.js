// src/use-cases/staff/delete-staff.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class DeleteStaffUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(staffId, currentUser) {
    console.log('DeleteStaffUseCase - Input:', { staffId, currentUser: { id: currentUser.userId || currentUser.id, role: currentUser.role } });
    
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can delete staff accounts');
    }

    // 2. Validate staff exists
    const staff = await this.userRepository.findById(staffId);
    console.log('DeleteStaffUseCase - Found staff:', staff ? { id: staff.id, role: staff.role, status: staff.status } : null);
    
    if (!staff) {
      throw new ValidationError('Staff not found');
    }

    // 3. Validate staff belongs to same restaurant
    if (staff.restaurant_id !== currentUser.restaurantId) {
      console.log('DeleteStaffUseCase - Restaurant mismatch:', { staffRestaurant: staff.restaurant_id, userRestaurant: currentUser.restaurantId });
      throw new UnauthorizedError('You can only delete staff in your restaurant');
    }

    // 4. Prevent deleting OWNER accounts (security)
    if (staff.role === 'OWNER') {
      throw new UnauthorizedError('Cannot delete owner account');
    }

    // 5. Check if staff is still active (should deactivate first)
    if (staff.status === 'ACTIVE') {
      console.log('DeleteStaffUseCase - Staff is still active, cannot delete');
      throw new ValidationError('Please deactivate staff before deleting. Active staff cannot be deleted.');
    }

    console.log('DeleteStaffUseCase - Proceeding with deletion...');

    try {
      // 6. Hard delete: Actually remove from database
      await this.userRepository.delete(staffId);
      console.log('DeleteStaffUseCase - Staff deleted from database');

      // 7. Invalidate all tokens for this staff (logout from all devices)
      await this.tokenService.bumpTokenVersion(staffId);

      // 8. Delete refresh token from Redis
      await this.tokenService.deleteRefreshToken(staffId);

      console.log('DeleteStaffUseCase - Deletion completed successfully');

      return {
        userId: staffId,
        email: staff.email,
        name: staff.full_name,
        status: 'DELETED',
        message: 'Staff account has been permanently deleted',
      };
    } catch (error) {
      console.error('DeleteStaffUseCase - Error during deletion:', error);
      throw error;
    }
  }
}

module.exports = { DeleteStaffUseCase };
