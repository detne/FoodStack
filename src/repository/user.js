/**
 * User Repository
 * Data access layer for User entity
 */

const { PrismaClient } = require('@prisma/client');

class UserRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    return await this.prisma.users.findUnique({
      where: { email },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            email_verified: true,
          },
        },
      },
    });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    return await this.prisma.users.findUnique({
      where: { id },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            email_verified: true,
          },
        },
      },
    });
  }

  /**
   * Create new user
   * @param {Object} data - User data
   * @param {Object} tx - Prisma transaction client (optional)
   * @returns {Promise<Object>} Created user
   */
  async create(data, tx) {
    const client = tx || this.prisma;
    return await client.users.create({
      data,
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
   * @param {string} ipAddress - IP address (optional)
   */
  async logAuthEvent(userId, event, ipAddress = null) {
    // This would typically log to MongoDB or a separate auth_logs table
    // For now, we'll just console.log
    console.log(`[AUTH EVENT] User: ${userId}, Event: ${event}, IP: ${ipAddress}`);
    
    // TODO: Implement actual logging to MongoDB
    // await this.mongoClient.collection('auth_logs').insertOne({
    //   userId,
    //   event,
    //   ipAddress,
    //   timestamp: new Date(),
    // });
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
}

module.exports = { UserRepository };
