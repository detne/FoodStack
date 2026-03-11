// src/repository/menu-item.js

const { prisma } = require('../config/database.config');

const { prisma } = require('../config/database.config');

class MenuItemRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async findById(id) {
    return await this.prisma.menu_items.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });
  }

  async findByCategoryId(categoryId) {
    return await this.prisma.menu_items.findMany({
      where: {
        category_id: categoryId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data) {
    const { v4: uuidv4 } = require('uuid');

    return await this.prisma.menu_items.create({
      data: {
        id: uuidv4(),
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
    return await this.prisma.menu_items.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async search(filters) {
    const { keyword = '', categoryId, branchId, limit = 10, offset = 0 } = filters;

    // Build where clause
    const whereClause = {
      deleted_at: null,
    };

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

    // Filter by branch (through category relationship)
    if (branchId) {
      whereClause.categories = {
        branch_id: branchId,
      };
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