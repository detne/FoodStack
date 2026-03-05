// src/repository/menu-item.js
const { PrismaClient } = require('@prisma/client');

class MenuItemRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
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
}

module.exports = { MenuItemRepository };
