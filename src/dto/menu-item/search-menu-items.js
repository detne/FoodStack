// src/dto/menu-item/search-menu-items.js

const { z } = require('zod');

const searchMenuItemsSchema = z.object({
  keyword: z.string().optional().default(''),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format").optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format").optional(),
  restaurantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format").optional(),
});

class SearchMenuItemsDto {
  constructor(data) {
    const validated = searchMenuItemsSchema.parse(data);
    this.keyword = validated.keyword;
    this.category = validated.category;
    this.page = validated.page;
    this.limit = validated.limit;
    this.branchId = validated.branchId;
    this.restaurantId = validated.restaurantId;
    this.offset = (this.page - 1) * this.limit;
  }

  static validate(data) {
    return searchMenuItemsSchema.parse(data);
  }
}

module.exports = { SearchMenuItemsDto };
