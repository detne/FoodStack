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

  async findByBranchId(branchId) {
    return await this.prisma.categories.findMany({
      where: {
        branch_id: branchId,
        deleted_at: null,
      },
      include: {
        _count: {
          select: {
            menu_items: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });
  }

  async findByNameAndBranch(name, branchId) {
    return await this.prisma.categories.findFirst({
      where: {
        name,
        branch_id: branchId,
        deleted_at: null,
      },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    const { v4: uuidv4 } = require('uuid');

    return await client.categories.create({
      data: {
        id: uuidv4(),
        branch_id: data.branchId,
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
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
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