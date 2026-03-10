const { AppError } = require('../../core/errors/AppError');

class GetFullMenuByBranchUseCase {
  constructor(branchRepository, categoryRepository, menuItemRepository) {
    this.branchRepository = branchRepository;
    this.categoryRepository = categoryRepository;
    this.menuItemRepository = menuItemRepository;
  }

  /**
   * @param {string} branchId
   * @returns {Promise<Array>} categories with items
   */
  async execute(branchId) {
    if (!branchId) {
      throw new AppError('Branch ID is required', 400);
    }

    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.deleted_at) {
      throw new AppError('Branch not found', 404);
    }

    const categories = await this.categoryRepository.findByBranchId(branchId);
    const menu = [];

    for (const cat of categories) {
      let items = await this.menuItemRepository.findByCategoryId(cat.id);
      // filter out inactive / soft deleted items
      items = items.filter(
        (i) => i.available && i.deleted_at === null
      );

      // map to plain object if needed
      const formattedItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        price: parseFloat(i.price),
        imageUrl: i.image_url,
        available: i.available,
      }));

      menu.push({
        categoryId: cat.id,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sort_order,
        menuItems: formattedItems,
      });
    }

    return menu;
  }
}

module.exports = { GetFullMenuByBranchUseCase };