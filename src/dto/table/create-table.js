const { z } = require('zod');

const CreateTableBodySchema = z.object({
  tableNumber: z.string().trim().min(1).max(30),
  capacity: z.number().int().positive(),
});

module.exports = { CreateTableBodySchema };