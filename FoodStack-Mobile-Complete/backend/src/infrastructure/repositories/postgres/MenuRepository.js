/**
 * Menu Repository
 * Data access layer for menu items and categories (PostgreSQL)
 */

const { prisma } = require('../../../config/database.config');
const { BaseRepository } = require('../BaseRepository');
const { NotFoundError, DatabaseError } = require('../../../core/errors');

class MenuRepository extends BaseRepository {
  constructor() {
    super(prisma.menuItem);
  }

  /**
   * Get full menu by branch with categories and customizations
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async getFullMenuByBranch(branchId, restaurantId) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          restaurantId,
          OR: [
            { branchId },
            { branchId: null }, // Global categories
          ],
          deletedAt: null,
        },
        include: {
          menuItems: {
            where: {
              OR: [
                { branchId },
                { branchId: null },
              ],
              deletedAt: null,
            },
            include: {
              itemCustomizations: {
                include: {
                  customizationGroup: {
                    include: {
                      customizationOptions: {
                        where: {
                          deletedAt: null,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      return categories;
    } catch (error) {
      throw new DatabaseError(error.message, 'getFullMenuByBranch');
    }
  }

  /**
   * Get menu item with full details
   * @param {string} itemId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async getItemWithDetails(itemId, restaurantId) {
    try {
      const item = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          restaurantId,
          deletedAt: null,
        },
        include: {
          category: true,
          itemCustomizations: {
            include: {
              customizationGroup: {
                include: {
                  customizationOptions: {
                    where: {
                      deletedAt: null,
                    },
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundError('Menu Item', itemId);
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'getItemWithDetails');
    }
  }

  /**
   * Check menu item availability
   * @param {string} itemId
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<boolean>}
   */
  async checkAvailability(itemId, branchId, restaurantId) {
    try {
      // Check item exists and not deleted
      const item = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          restaurantId,
          deletedAt: null,
        },
      });

      if (!item) {
        return false;
      }

      // Check branch-specific availability
      const availability = await prisma.menuItemAvailability.findUnique({
        where: {
          menuItemId_branchId: {
            menuItemId: itemId,
            branchId,
          },
        },
      });

      // If no specific availability record, item is available
      if (!availability) {
        return true;
      }

      return availability.isAvailable;
    } catch (error) {
      throw new DatabaseError(error.message, 'checkAvailability');
    }
  }

  /**
   * Update menu item availability
   * @param {string} itemId
   * @param {string} branchId
   * @param {boolean} isAvailable
   * @param {string} reason
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async updateAvailability(itemId, branchId, isAvailable, reason, restaurantId) {
    try {
      // Verify item exists
      const item = await prisma.menuItem.findFirst({
        where: { id: itemId, restaurantId },
      });

      if (!item) {
        throw new NotFoundError('Menu Item', itemId);
      }

      return await prisma.menuItemAvailability.upsert({
        where: {
          menuItemId_branchId: {
            menuItemId: itemId,
            branchId,
          },
        },
        update: {
          isAvailable,
          reason,
          updatedAt: new Date(),
        },
        create: {
          menuItemId: itemId,
          branchId,
          isAvailable,
          reason,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'updateAvailability');
    }
  }

  /**
   * Search menu items
   * @param {string} query
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async searchItems(query, branchId, restaurantId) {
    try {
      return await prisma.menuItem.findMany({
        where: {
          restaurantId,
          OR: [
            { branchId },
            { branchId: null },
          ],
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
          deletedAt: null,
        },
        include: {
          category: true,
        },
        take: 20,
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'searchItems');
    }
  }

  /**
   * Get popular menu items by branch
   * @param {string} branchId
   * @param {string} restaurantId
   * @param {number} limit
   * @returns {Promise<Object[]>}
   */
  async getPopularItems(branchId, restaurantId, limit = 10) {
    try {
      // Get items ordered most frequently in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const popularItems = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            branchId,
            restaurantId,
            status: 'Completed',
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
        _count: {
          menuItemId: true,
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: limit,
      });

      // Get full item details
      const itemIds = popularItems.map((item) => item.menuItemId);
      const items = await prisma.menuItem.findMany({
        where: {
          id: { in: itemIds },
          deletedAt: null,
        },
        include: {
          category: true,
        },
      });

      // Combine with order statistics
      return items.map((item) => {
        const stats = popularItems.find((p) => p.menuItemId === item.id);
        return {
          ...item,
          orderCount: stats?._count.menuItemId || 0,
          totalQuantity: stats?._sum.quantity || 0,
        };
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'getPopularItems');
    }
  }

  /**
   * Create menu item with customizations
   * @param {Object} itemData
   * @param {string[]} customizationGroupIds
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async createWithCustomizations(itemData, customizationGroupIds, restaurantId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create menu item
        const item = await tx.menuItem.create({
          data: {
            ...itemData,
            restaurantId,
          },
        });

        // Link customization groups
        if (customizationGroupIds && customizationGroupIds.length > 0) {
          await Promise.all(
            customizationGroupIds.map((groupId) =>
              tx.itemCustomization.create({
                data: {
                  menuItemId: item.id,
                  groupId,
                },
              })
            )
          );
        }

        // Return item with customizations
        return await tx.menuItem.findUnique({
          where: { id: item.id },
          include: {
            category: true,
            itemCustomizations: {
              include: {
                customizationGroup: {
                  include: {
                    customizationOptions: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'createWithCustomizations');
    }
  }

  /**
   * Get menu statistics
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async getStatistics(restaurantId) {
    try {
      const [totalItems, byCategory, avgPrice] = await Promise.all([
        prisma.menuItem.count({
          where: {
            restaurantId,
            deletedAt: null,
          },
        }),
        prisma.menuItem.groupBy({
          by: ['categoryId'],
          where: {
            restaurantId,
            deletedAt: null,
          },
          _count: true,
        }),
        prisma.menuItem.aggregate({
          where: {
            restaurantId,
            deletedAt: null,
          },
          _avg: {
            price: true,
          },
        }),
      ]);

      return {
        totalItems,
        categoriesCount: byCategory.length,
        avgPrice: avgPrice._avg.price || 0,
      };
    } catch (error) {
      throw new DatabaseError(error.message, 'getStatistics');
    }
  }
}

module.exports = { MenuRepository };
