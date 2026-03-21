const { z } = require('zod');

const UpdateOrderItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

module.exports = { UpdateOrderItemSchema };