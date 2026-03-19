// src/use-cases/menu-item/search-menu-items.js

const { SearchMenuItemsDto } = require('../../dto/menu-item/search-menu-items');

class SearchMenuItemsUseCase {
  constructor(menuItemRepository) {
    this.menuItemRepository = menuItemRepository;
  }

  async execute(dto) {
    // Validate DTO
    if (!(dto instanceof SearchMenuItemsDto)) {
      throw new Error('Invalid DTO provided');
    }

    // Prepare filter object
    const filters = {
      keyword: dto.keyword,
      categoryId: dto.category,
      branchId: dto.branchId,
      limit: dto.limit,
      offset: dto.offset,
    };

    // Search menu items
    const result = await this.menuItemRepository.search(filters);

    // Format response
    return {
      data: result.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url, // Keep consistent with frontend
        available: item.available,
        category_id: item.categories?.id || item.category_id, // Frontend expects category_id
        category: item.categories ? {
          id: item.categories.id,
          name: item.categories.name,
        } : null,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
    };
  }
}

module.exports = { SearchMenuItemsUseCase };
