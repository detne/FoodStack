// src/use-cases/staff/update-staff.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UpdateStaffUseCase {
  constructor(userRepository, prisma) {
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(staffId, dto, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can update staff information');
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
      throw new UnauthorizedError('Cannot update owner account information');
    }

    // 5. If email is being changed, validate uniqueness
    if (dto.email && dto.email !== staff.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }
    }

    // 6. Validate branch if being changed
    if (dto.branchId !== undefined) {
      const branch = await this.prisma.branches.findUnique({
        where: { id: dto.branchId },
      });

      if (!branch) {
        throw new ValidationError('Branch not found');
      }

      if (branch.restaurant_id !== currentUser.restaurantId) {
        throw new UnauthorizedError('Branch does not belong to your restaurant');
      }
    }

    // 7. Build update data
    const updateData = {
      updated_at: new Date(),
    };

    if (dto.name !== undefined) updateData.full_name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.branchId !== undefined) updateData.branch_id = dto.branchId;
    if (dto.status !== undefined) updateData.status = dto.status;

    // Update in database
    const updatedStaff = await this.userRepository.update(staffId, updateData);

    return {
      userId: updatedStaff.id,
      email: updatedStaff.email,
      name: updatedStaff.full_name,
      phone: updatedStaff.phone,
      role: updatedStaff.role,
      branchId: updatedStaff.branch_id,
      restaurantId: updatedStaff.restaurant_id,
      status: updatedStaff.status,
      updatedAt: updatedStaff.updated_at,
      message: 'Staff information updated successfully',
    };
  }
}

module.exports = { UpdateStaffUseCase };
