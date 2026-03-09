// src/dto/menu-item/search-menu-items.js

const { z } = require('zod');

const searchMenuItemsSchema = z.object({
  keyword: z.string().optional().default(''),
  category: z.string().uuid().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  branchId: z.string().uuid().optional(),
});

class SearchMenuItemsDto {
  constructor(data) {
    const validated = searchMenuItemsSchema.parse(data);
    this.keyword = validated.keyword;
    this.category = validated.category;
    this.page = validated.page;
    this.limit = validated.limit;
    this.branchId = validated.branchId;
    this.offset = (this.page - 1) * this.limit;
  }

  static validate(data) {
    return searchMenuItemsSchema.parse(data);
  }
}

module.exports = { SearchMenuItemsDto };
