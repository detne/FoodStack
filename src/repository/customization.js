// src/repository/customization.js
const { PrismaClient } = require('@prisma/client');

class CustomizationRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async createGroup(data) {
    const { v4: uuidv4 } = require('uuid');

    return await this.prisma.customization_groups.create({
      data: {
        id: uuidv4(),
        name: data.name,
        description: data.description || null,
        min_select: data.minSelect,
        max_select: data.maxSelect,
        is_required: data.isRequired,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async createOptions(groupId, options) {
    const { v4: uuidv4 } = require('uuid');

    const optionData = options.map(option => ({
      id: uuidv4(),
      customization_group_id: groupId,
      name: option.name,
      price_delta: option.priceDelta,
      sort_order: option.sortOrder,
      is_available: option.isAvailable,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    return await this.prisma.customization_options.createMany({
      data: optionData,
    });
  }

  async addOption(groupId, optionData) {
    const { v4: uuidv4 } = require('uuid');

    return await this.prisma.customization_options.create({
      data: {
        id: uuidv4(),
        customization_group_id: groupId,
        name: optionData.name,
        price_delta: optionData.priceDelta,
        sort_order: optionData.sortOrder,
        is_available: optionData.isAvailable,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async linkMenuItem(menuItemId, groupId) {
    const { v4: uuidv4 } = require('uuid');

    return await this.prisma.menu_item_customizations.create({
      data: {
        id: uuidv4(),
        menu_item_id: menuItemId,
        customization_group_id: groupId,
        created_at: new Date(),
      },
    });
  }

  async findGroupById(id) {
    return await this.prisma.customization_groups.findUnique({
      where: { id },
      include: {
        customization_options: {
          orderBy: { sort_order: 'asc' },
        },
        menu_item_customizations: true, // Chỉ lấy junction table, không include menu_items
      },
    });
  }
}

module.exports = { CustomizationRepository };