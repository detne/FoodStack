// src/use-cases/menu-item/import-menu-items.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');
const { PrismaClient } = require('@prisma/client');

class ImportMenuItemsUseCase {
  constructor(menuItemRepository, categoryRepository, userRepository, prisma) {
    this.menuItemRepository = menuItemRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * @param {Array} rows  - parsed rows from frontend: [{ name, description, price, category, imageUrl, available }]
   * @param {string} userId
   * @returns {{ total, succeeded, failed, errors: [{row, message}], items: [] }}
   */
  async execute(rows, userId) {
    // 1. Auth check
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    if (user.role !== 'OWNER') throw new UnauthorizedError('Only Owner can import menu items');

    const restaurantId = user.restaurantId || user.restaurant_id;
    if (!restaurantId) throw new ValidationError('User has no associated restaurant');

    // 2. Load all categories for this restaurant once (avoid N+1)
    const allCategories = await this.categoryRepository.findByRestaurantId(restaurantId);
    const categoryMap = new Map(allCategories.map(c => [c.name.trim().toLowerCase(), c]));

    const succeeded = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header row

      try {
        // Validate required fields
        if (!row.name || String(row.name).trim() === '') {
          throw new Error('name is required');
        }
        if (row.price === undefined || row.price === null || row.price === '') {
          throw new Error('price is required');
        }
        const price = Number(row.price);
        if (isNaN(price) || price <= 0) {
          throw new Error('price must be a positive number');
        }
        if (!row.category || String(row.category).trim() === '') {
          throw new Error('category is required');
        }

        // Resolve category by name
        const categoryKey = String(row.category).trim().toLowerCase();
        let category = categoryMap.get(categoryKey);

        if (!category) {
          // Auto-create category
          category = await this.categoryRepository.create({
            restaurantId,
            name: String(row.category).trim(),
            description: null,
            sortOrder: 0,
          });
          categoryMap.set(categoryKey, category);
        }

        // Determine available flag
        let available = true;
        if (row.available !== undefined && row.available !== null && row.available !== '') {
          const val = String(row.available).trim().toLowerCase();
          available = !['false', '0', 'no', 'unavailable', 'inactive'].includes(val);
        }

        const menuItem = await this.menuItemRepository.create({
          categoryId: category.id,
          name: String(row.name).trim(),
          description: row.description ? String(row.description).trim() : null,
          price,
          imageUrl: row.imageUrl ? String(row.imageUrl).trim() : null,
          available,
        });

        // Create availability records for all branches
        const branches = await this.prisma.branches.findMany({
          where: { restaurant_id: restaurantId, deleted_at: null },
          select: { id: true },
        });

        for (const branch of branches) {
          await this.prisma.menu_item_availability.create({
            data: {
              menu_item_id: menuItem.id,
              branch_id: branch.id,
              available,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }

        succeeded.push(menuItem);
      } catch (err) {
        errors.push({ row: rowNum, message: err.message });
      }
    }

    return {
      total: rows.length,
      succeeded: succeeded.length,
      failed: errors.length,
      errors,
      items: succeeded,
    };
  }
}

module.exports = { ImportMenuItemsUseCase };
