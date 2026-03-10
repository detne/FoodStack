const { z } = require('zod');

const CreateAreaBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

module.exports = { CreateAreaBodySchema };