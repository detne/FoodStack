const { PrismaClient } = require('@prisma/client');

class BranchRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async findById(id) {
    return await this.prisma.branches.findUnique({
      where: { id },
    });
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
}

module.exports = { BranchRepository };