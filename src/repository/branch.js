const { PrismaClient } = require('@prisma/client');

class BranchRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async findByRestaurantId(restaurantId) {
    return await this.prisma.branches.findMany({
      where: {
        restaurant_id: restaurantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    const { v4: uuidv4 } = require('uuid');

    return client.branches.create({
      data: {
        id: uuidv4(),
        restaurant_id: data.restaurantId,
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        status: data.status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async findById(id) {
    return this.prisma.branches.findUnique({
      where: { id },
    });
  }

  async update(id, data) {
    return this.prisma.branches.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async listByRestaurant(restaurantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branches.findMany({
        where: {
          restaurant_id: restaurantId,
          deleted_at: null, // nếu bạn dùng soft delete
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.branches.count({
        where: {
          restaurant_id: restaurantId,
          deleted_at: null,
        },
      }),
    ]);

    return { items, total };
  }

  async deactivate(id) {
    return this.prisma.branches.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updated_at: new Date(),
        // nếu bạn muốn soft delete theo timestamp:
        deleted_at: new Date(),
      },
    });
  }
}

module.exports = { BranchRepository };