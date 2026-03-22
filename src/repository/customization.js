// src/repository/customization.js

const { prisma } = require('../config/database.config');
class CustomizationRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async createGroup(data) {
    
    return await this.prisma.customization_groups.create({
      data: {        name: data.name,
        description: data.description || null,
        min_select: data.minSelect,
        max_select: data.maxSelect,
        is_required: data.isRequired,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async createOptions(groupId, options) {
    
    const optionData = options.map((option) => ({      customization_group_id: groupId,
      name: option.name,
      price_delta: option.priceDelta,
      sort_order: option.sortOrder,
      is_available: option.isAvailable,
      created_at: new Date(),
      updated_at: new Date()
    }));

    return await this.prisma.customization_options.createMany({
      data: optionData
    });
  }

  async addOption(groupId, optionData) {
    
    return await this.prisma.customization_options.create({
      data: {        customization_group_id: groupId,
        name: optionData.name,
        price_delta: optionData.priceDelta,
        sort_order: optionData.sortOrder,
        is_available: optionData.isAvailable,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async linkMenuItem(menuItemId, groupId) {
    
    return await this.prisma.menu_item_customizations.create({
      data: {        menu_item_id: menuItemId,
        customization_group_id: groupId,
        created_at: new Date()
      }
    });
  }

  async findGroupById(id) {
    return await this.prisma.customization_groups.findUnique({
      where: { id },
      include: {
        customization_options: {
          orderBy: { sort_order: 'asc' }
        },
        menu_item_customizations: true
      }
    });
  }
}

module.exports = { CustomizationRepository };