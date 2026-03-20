// src/use-cases/staff/create-staff.js

const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class CreateStaffUseCase {
  constructor(userRepository, restaurantRepository, branchRepository, emailService, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.branchRepository = branchRepository;
    this.emailService = emailService;
    this.prisma = prisma;
  }

  async execute(dto, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can create staff accounts');
    }

    // 2. Validate restaurant exists
    const restaurant = await this.restaurantRepository.findById(currentUser.restaurantId);
    if (!restaurant) {
      throw new ValidationError('Restaurant not found');
    }

    // 3. Validate branch exists and belongs to restaurant (if branch_id provided)
    if (dto.branch_id && dto.branch_id.trim() !== '') {
      const branch = await this.branchRepository.findById(dto.branch_id);
      if (!branch) {
        throw new ValidationError('Branch not found');
      }

      if (branch.restaurant_id !== currentUser.restaurantId) {
        throw new UnauthorizedError('Branch does not belong to your restaurant');
      }
    }

    // 4. Validate email is unique
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // 5. Generate random password (8 characters)
    const tempPassword = this.generateRandomPassword(8);
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // 6. Create staff account
    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const userId = uuidv4();

      // Create user
      const user = await tx.users.create({
        data: {
          id: userId,
          restaurant_id: currentUser.restaurantId,
          branch_id: dto.branch_id || null, // Now we can use branch_id
          email: dto.email,
          password_hash: hashedPassword,
          full_name: dto.full_name,
          phone: dto.phone || null,
          role: dto.role || 'STAFF', // Use provided role or default to STAFF
          status: 'ACTIVE',
          created_at: now,
          updated_at: now,
        },
      });

      // 7. Send activation email with temporary password
      this.emailService
        .sendStaffActivationEmail(dto.email, dto.full_name, tempPassword, restaurant.name)
        .catch((err) => console.error('Email error:', err));

      return {
        userId: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        // branchId: user.branch_id, // Temporarily commented out until DB migration
        restaurantId: user.restaurant_id,
        status: user.status,
        message: 'Staff account created successfully. Activation email has been sent.',
        // Include temp password in development only
        ...(process.env.NODE_ENV === 'development' && { tempPassword }),
      };
    });
  }

  /**
   * Generate random password
   * @param {number} length - Password length
   * @returns {string} Random password
   */
  generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = { CreateStaffUseCase };
