// src/repository/restaurant.js
class RestaurantRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.restaurant.findUnique({
      where: { id },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return client.restaurant.create({ data });
  }

  async update(id, data) {
    return this.prisma.restaurant.update({
      where: { id },
      data,
    });
  }
}

module.exports = { RestaurantRepository };
