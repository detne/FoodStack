// src/dto/branch/list-branches.js
const { z } = require('zod');

const ListBranchesSchema = z.object({
  restaurantId: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { ListBranchesSchema };