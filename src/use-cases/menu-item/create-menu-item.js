// src/use-cases/menu-item/create-menu-item.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');
const { PrismaClient } = require('@prisma/client');

class CreateMenuItemUseCase {
  constructor(menuItemRepository, categoryRepository, userRepository, prisma) {
    this.menuItemRepository = menuItemRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
    this.prisma = prisma || new PrismaClient();
  }

  async execute(dto) {
    // 1. Validate user role (Only Owner can create menu items)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'OWNER') {
      throw new UnauthorizedError('Only Owner can create menu items');
    }

    // 2. Validate category exists
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.deleted_at) {
      throw new ValidationError('Category not found');
    }

    // 3. Validate price > 0
    if (dto.price <= 0) {
      throw new ValidationError('Price must be greater than 0');
    }

    // 4. Create menu item (now at restaurant level, automatically available for all branches)
    const menuItem = await this.menuItemRepository.create({
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      available: dto.available,
    });

    // 5. Create availability records for all branches of this restaurant
    const branches = await this.prisma.branches.findMany({
      where: {
        restaurant_id: category.restaurant_id,
        deleted_at: null
      },
      select: { id: true }
    });

    console.log(`Creating availability for ${branches.length} branches`);

    for (const branch of branches) {
      await this.prisma.menu_item_availability.create({
        data: {
          menu_item_id: menuItem.id,
          branch_id: branch.id,
          is_available: true
        }
      });
    }

    return {
      id: menuItem.id,
      menuItemId: menuItem.id,
      categoryId: menuItem.category_id,
      name: menuItem.name,
      description: menuItem.description,
      price: parseFloat(menuItem.price),
      imageUrl: menuItem.image_url,
      available: menuItem.available,
      createdAt: menuItem.created_at,
      availableInBranches: branches.length
    };
  }
}

module.exports = { CreateMenuItemUseCase };
