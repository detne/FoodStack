const { z } = require('zod');

const CreateAreaSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

module.exports = { CreateAreaSchema };