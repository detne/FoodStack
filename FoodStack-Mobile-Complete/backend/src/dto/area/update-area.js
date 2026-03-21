const { z } = require('zod');

const UpdateAreaBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((val) => val.name !== undefined || val.sortOrder !== undefined, {
    message: 'At least one field (name/sortOrder) must be provided',
  });

module.exports = { UpdateAreaBodySchema };