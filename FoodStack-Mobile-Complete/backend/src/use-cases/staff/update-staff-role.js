// src/use-cases/staff/update-staff-role.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateStaffRoleUseCase {
  constructor(userRepository, prisma) {
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(staffId, dto, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can update staff role');
    }

    // 2. Validate staff exists
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new ValidationError('Staff not found');
    }

    // 3. Validate staff belongs to same restaurant
    if (staff.restaurant_id !== currentUser.restaurantId) {
      throw new UnauthorizedError('You can only update staff in your restaurant');
    }

    // 4. Prevent updating OWNER accounts (security)
    if (staff.role === 'OWNER') {
      throw new UnauthorizedError('Cannot update owner account role');
    }

    // 5. Prevent user from demoting themselves
    if (staffId === currentUser.userId) {
      throw new ValidationError('Cannot change your own role');
    }

    // 6. Validate role hierarchy (Manager cannot promote to Owner)
    if (currentUser.role === 'MANAGER' && dto.role === 'OWNER') {
      throw new UnauthorizedError('Manager cannot promote staff to Owner');
    }

    // 7. Prevent Manager demoting other Managers (only Owner can do this)
    if (currentUser.role === 'MANAGER' && staff.role === 'MANAGER') {
      throw new UnauthorizedError('Only Owner can demote other Managers');
    }

    // 8. Update role in database
    const updatedStaff = await this.userRepository.update(staffId, {
      role: dto.role,
      updated_at: new Date(),
    });

    return {
      userId: updatedStaff.id,
      email: updatedStaff.email,
      name: updatedStaff.full_name,
      role: updatedStaff.role,
      status: updatedStaff.status,
      message: 'Staff role updated successfully',
    };
  }
}

module.exports = { UpdateStaffRoleUseCase };
