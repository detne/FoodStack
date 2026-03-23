// src/repository/menu-item-availability.js

class MenuItemAvailabilityRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async upsert({ menuItemId, branchId, isAvailable, reason }) {
    const result = await this.prisma.menu_item_availability.upsert({
      where: {
        menu_item_id_branch_id: {
          menu_item_id: menuItemId,
          branch_id: branchId,
        },
      },
      update: {
        is_available: isAvailable,
        reason: reason,
        updated_at: new Date(),
      },
      create: {
        menu_item_id: menuItemId,
        branch_id: branchId,
        is_available: isAvailable,
        reason: reason,
      },
    });

    return result;
  }

  async findByBranchAndMenuItem(branchId, menuItemId) {
    return await this.prisma.menu_item_availability.findUnique({
      where: {
        menu_item_id_branch_id: {
          menu_item_id: menuItemId,
          branch_id: branchId,
        },
      },
    });
  }

  async findByBranch(branchId) {
    return await this.prisma.menu_item_availability.findMany({
      where: {
        branch_id: branchId,
      },
    });
  }

  async delete(menuItemId, branchId) {
    return await this.prisma.menu_item_availability.delete({
      where: {
        menu_item_id_branch_id: {
          menu_item_id: menuItemId,
          branch_id: branchId,
        },
      },
    });
  }
}

module.exports = { MenuItemAvailabilityRepository };
