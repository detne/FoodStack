class BranchRepository {
  constructor(prisma) {
    if (!prisma) throw new Error('BranchRepository requires prisma instance');
    this.prisma = prisma;
  }

  async findById(id, tx) {
    const client = tx || this.prisma;
    return await client.branches.findUnique({ where: { id } });
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

    console.log('BranchRepository.listByRestaurant called with:', { restaurantId, page, limit });

    // First, let's check if any branches exist for this restaurant (without deleted_at filter)
    const allBranches = await this.prisma.branches.findMany({
      where: {
        restaurant_id: restaurantId,
      },
    });
    console.log('All branches for restaurant (including deleted):', allBranches);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branches.findMany({
        where: {
          restaurant_id: restaurantId,
          deleted_at: null,
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

    console.log('BranchRepository.listByRestaurant result:', { items: items.length, total });
    console.log('Filtered branches:', items);

    return { items, total };
  }

  async delete(id) {
    return await this.prisma.branches.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async deactivate(id) {
    return this.prisma.branches.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }
}

module.exports = { BranchRepository };
