// src/repository/restaurant.js
class RestaurantRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.restaurants.findUnique({
      where: { id },
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
      }
    });
  }

  async update(id, data) {
    return this.prisma.restaurants.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }
}

module.exports = { RestaurantRepository };
