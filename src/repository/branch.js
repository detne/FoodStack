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
        // Remove deleted_at filter since we're using hard delete now
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;

    // Generate unique slug from branch name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Ensure slug is unique by adding timestamp if needed
    let slug = baseSlug;
    const existingBranch = await client.branches.findUnique({
      where: { slug: slug }
    });
    
    if (existingBranch) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    return client.branches.create({
      data: {
        restaurant_id: data.restaurantId,
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        status: data.status || 'ACTIVE',
        slug: slug,
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

    // First, let's check if any branches exist for this restaurant
    const allBranches = await this.prisma.branches.findMany({
      where: {
        restaurant_id: restaurantId,
      },
    });
    console.log('All branches for restaurant:', allBranches);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branches.findMany({
        where: {
          restaurant_id: restaurantId,
          // Remove deleted_at filter since MongoDB doesn't have this field by default
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.branches.count({
        where: {
          restaurant_id: restaurantId,
          // Remove deleted_at filter
        },
      }),
    ]);

    console.log('BranchRepository.listByRestaurant result:', { items: items.length, total });
    console.log('Filtered branches:', items);

    return { items, total };
  }

  async delete(id) {
    // For MongoDB, use hard delete instead of soft delete
    return await this.prisma.branches.delete({
      where: { id }
    });
  }

  async deactivate(id) {
    // Just set status to INACTIVE, don't delete
    return this.prisma.branches.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updated_at: new Date(),
      },
    });
  }
}

module.exports = { BranchRepository };
