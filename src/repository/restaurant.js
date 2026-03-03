const { PrismaClient } = require('@prisma/client');

class RestaurantRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async findById(id) {
    return await this.prisma.restaurants.findUnique({
      where: { id },
    });
  }
}

module.exports = { RestaurantRepository };