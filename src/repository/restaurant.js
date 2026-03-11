/**
 * Restaurant Repository
 * Data access layer for Restaurant entity
 */

const { prisma } = require('../config/database.config');

class RestaurantRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async findById(id) {
    return await this.prisma.restaurants.findUnique({
      where: { id },
    });
  }

  /**
   * Find restaurants by owner ID
   * @param {string} ownerId - Owner user ID
   * @returns {Promise<Array>} Array of restaurants
   */
  async findByOwnerId(ownerId) {
    return await this.prisma.restaurants.findMany({
      where: { 
        owner_id: ownerId,
        deleted_at: null 
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    const { v4: uuidv4 } = require('uuid');

    return client.restaurants.create({
      data: {
        id: uuidv4(),
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address,
        email_verified: false,
        updated_at: new Date(),
      },
    });
  }

  async update(id, data) {
    return await this.prisma.restaurants.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async findOwnerIdById(restaurantId, tx) {
    const client = tx || this.prisma;
    return await client.restaurants.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });
  }

  async softDelete(id) {
    return await this.prisma.restaurants.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}

module.exports = { RestaurantRepository };