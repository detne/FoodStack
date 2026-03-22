// src/use-cases/staff/create-staff.js

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

    // 5. Hash password from DTO or generate random if not provided
    let tempPassword = null;
    let hashedPassword;
    
    if (dto.password && dto.password.trim() !== '') {
      // Use provided password
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(dto.password, 12);
    } else {
      // Generate random password (8 characters)
      tempPassword = this.generateRandomPassword(8);
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(tempPassword, 12);
    }

    // 6. Create staff account
    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      // Create user - Let MongoDB generate ObjectId
      const user = await tx.users.create({
        data: {
          restaurant_id: currentUser.restaurantId,
          branch_id: dto.branch_id || null,
          email: dto.email,
          password_hash: hashedPassword,
          full_name: dto.full_name,
          phone: dto.phone || null,
          role: dto.role || 'STAFF',
          status: 'ACTIVE',
          created_at: now,
          updated_at: now,
        },
      });

      // 7. Send activation email with temporary password (only if auto-generated)
      if (tempPassword) {
        this.emailService
          .sendStaffActivationEmail(dto.email, dto.full_name, tempPassword, restaurant.name)
          .catch((err) => console.error('Email error:', err));
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        restaurantId: user.restaurant_id,
        status: user.status,
        message: tempPassword 
          ? 'Staff account created successfully. Activation email has been sent.'
          : 'Staff account created successfully.',
        // Include temp password in development only
        ...(process.env.NODE_ENV === 'development' && tempPassword && { tempPassword }),
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
