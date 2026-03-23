// src/repository/category.js

const { prisma } = require('../config/database.config');

class CategoryRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async findById(id) {
    return await this.prisma.categories.findUnique({
      where: { id },
    });
  }

  async findByRestaurantId(restaurantId) {
    console.log('[CategoryRepository.findByRestaurantId] restaurantId:', restaurantId);
    
    const categories = await this.prisma.categories.findMany({
      where: {
        restaurant_id: restaurantId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            menu_items: {
              where: {
                available: true,
                deleted_at: null
              },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });
    
    console.log('[CategoryRepository.findByRestaurantId] Found categories:', categories.length);
    return categories;
  }

  // Keep for backward compatibility, but fetch by restaurant
  async findByBranchId(branchId) {
    // Get branch to find restaurant_id
    const branch = await this.prisma.branches.findUnique({
      where: { id: branchId },
      select: { restaurant_id: true }
    });

    if (!branch) return [];

    return this.findByRestaurantId(branch.restaurant_id);
  }

  async findByNameAndRestaurant(name, restaurantId) {
    return await this.prisma.categories.findFirst({
      where: {
        name,
        restaurant_id: restaurantId,
        deleted_at: null,
      },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;

    return await client.categories.create({
      data: {
        restaurant_id: data.restaurantId,
        name: data.name,
        description: data.description || null,
        sort_order: data.sortOrder || 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id, data) {
    return await this.prisma.categories.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async softDelete(id) {
    return await this.prisma.categories.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }

  async countMenuItems(categoryId) {
    return await this.prisma.menu_items.count({
      where: {
        category_id: categoryId,
        deleted_at: null,
      },
    });
  }
}

module.exports = { CategoryRepository };