/**
 * User Repository
 * Data access layer for User entity
 */

const { prisma } = require('../config/database.config');

class UserRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        // restaurant user đang thuộc (Staff/Manager) - nullable
        restaurants: {
          select: { id: true, name: true, email_verified: true },
        },
      },
    });

    if (!user) return null;

    // If user is OWNER, fetch owned restaurants separately
    if (user.role === 'OWNER') {
      const ownedRestaurants = await this.prisma.restaurants.findMany({
        where: { owner_id: user.id },
        select: { id: true, name: true, email_verified: true },
      });
      
      // Add owned_restaurants to user object
      user.owned_restaurants = ownedRestaurants;
    }

    return user;
  }

  async findById(id) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        restaurants: {
          select: { id: true, name: true, email_verified: true },
        },
      },
    });

    if (!user) return null;

    // If user is OWNER, fetch owned restaurants separately
    if (user.role === 'OWNER') {
      const ownedRestaurants = await this.prisma.restaurants.findMany({
        where: { owner_id: user.id },
        select: { id: true, name: true, email_verified: true },
      });
      
      // Add owned_restaurants to user object
      user.owned_restaurants = ownedRestaurants;
    }

    return user;
  }

  /**
   * Create new user
   * @param {Object} data - User data
   * @param {Object} tx - Prisma transaction client (optional)
   * @returns {Promise<Object>} Created user
   */
  async create(data, tx) {
    const client = tx || this.prisma;
    const { v4: uuidv4 } = require('uuid');

    const role = data.role; // 'Owner' | 'Manager' | 'Staff'

    // Staff/Manager phải có restaurantId
    if ((role === 'Manager' || role === 'Staff') && !data.restaurantId) {
      throw new Error('restaurantId is required for Manager/Staff');
    }

    return client.users.create({
      data: {
        id: uuidv4(),
        email: data.email,
        password_hash: data.passwordHash,
        full_name: data.fullName,
        phone: data.phone,
        role,
        restaurant_id: data.restaurantId ?? null, // Owner => null
        status: data.status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated user
   */
  async update(id, data) {
    return await this.prisma.users.update({
      where: { id },
      data,
    });
  }

  /**
   * Log authentication event
   * @param {string} userId - User ID
   * @param {string} event - Event type (LOGIN, LOGOUT, etc.)
   * @param {string|null} ipAddress - IP address (optional)
   */
  async logAuthEvent(userId, event, ipAddress = null) {
    console.log(`[AUTH EVENT] User: ${userId}, Event: ${event}, IP: ${ipAddress}`);
  }

  /**
   * Update last login timestamp
   * @param {string} userId - User ID
   */
  async updateLastLogin(userId) {
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        last_login_at: new Date(),
      },
    });
  }

  /**
   * Save verification token
   * @param {string} userId - User ID
   * @param {string} token - Verification token
   * @param {Object} tx - Prisma transaction client (optional)
   */
  async saveVerificationToken(userId, token, tx) {
    // TODO: Implement verification token storage
    console.log(`Verification token generated for user ${userId}: ${token}`);
    return { userId, token };
  }

  /**
   * Update reset token
   * @param {string} userId - User ID
   * @param {Object} data - Reset token data
   * @param {string} data.resetToken - Hashed reset token
   * @param {Date} data.resetTokenExpiresAt - Token expiry date
   */
  async updateResetToken(userId, data) {
    return await this.prisma.users.update({
      where: { id: userId },
      data: {
        reset_token: data.resetToken,
        reset_token_expires_at: data.resetTokenExpiresAt,
      },
    });
  }

  /**
   * Find user by reset token
   * @param {string} hashedToken - Hashed reset token
   * @returns {Promise<Object|null>} User object or null
   */
  async findByResetToken(hashedToken) {
    return await this.prisma.users.findFirst({
      where: {
        reset_token: hashedToken,
        reset_token_expires_at: {
          gte: new Date(),
        },
      },
    });
  }

  /**
   * Update password
   * @param {string} userId - User ID
   * @param {Object} data - Password update data
   * @param {string} data.password - New hashed password
   * @param {null} data.resetToken - Clear reset token
   * @param {null} data.resetTokenExpiresAt - Clear token expiry
   */
  async updatePassword(userId, data) {
    return await this.prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: data.password,
        reset_token: data.resetToken,
        reset_token_expires_at: data.resetTokenExpiresAt,
        updated_at: new Date(),
      },
    });
  }

  async setActiveRestaurant(userId, restaurantId) {
    return await this.prisma.users.update({
      where: { id: userId },
      data: { restaurant_id: restaurantId, updated_at: new Date() },
    });
  }

  /**
   * Delete user (hard delete)
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async delete(id) {
    return await this.prisma.users.delete({
      where: { id },
    });
  }
}

module.exports = { UserRepository };