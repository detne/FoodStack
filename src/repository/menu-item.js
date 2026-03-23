// src/repository/menu-item.js

const { prisma } = require('../config/database.config');
class MenuItemRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async findById(id) {
    return await this.prisma.menu_items.findUnique({
      where: { 
        id
        // Remove deleted_at filter since MongoDB doesn't have this field by default
      }
    });
  }

  async findByCategoryId(categoryId) {
    return await this.prisma.menu_items.findMany({
      where: {
        category_id: categoryId,
        // Remove deleted_at filter
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data) {

    return await this.prisma.menu_items.create({
      data: {
        category_id: data.categoryId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: data.imageUrl || null,
        available: data.available !== undefined ? data.available : true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id, data) {
    return await this.prisma.menu_items.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async softDelete(id) {
    // For MongoDB, use hard delete instead of soft delete
    return await this.prisma.menu_items.delete({
      where: { id }
    });
  }

  async search(filters) {
    const { keyword = '', categoryId, branchId, restaurantId, limit = 10, offset = 0 } = filters;

    // Build where clause
    const whereClause = {};

    // Search by keyword (name or description)
    if (keyword.trim()) {
      whereClause.OR = [
        {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filter by category
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Filter by restaurant (through category relationship)
    if (restaurantId) {
      whereClause.categories = {
        restaurant_id: restaurantId,
      };
    } else if (branchId) {
      // If branchId provided, get restaurant_id from branch
      const branch = await this.prisma.branches.findUnique({
        where: { id: branchId },
        select: { restaurant_id: true }
      });
      
      if (branch) {
        whereClause.categories = {
          restaurant_id: branch.restaurant_id,
        };
      }
    }

    // Get total count
    const total = await this.prisma.menu_items.count({
      where: whereClause,
    });

    // Get paginated results
    const items = await this.prisma.menu_items.findMany({
      where: whereClause,
      include: {
        categories: true,
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return {
      items,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = { MenuItemRepository };