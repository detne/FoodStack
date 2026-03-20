const { z } = require('zod');

const GetPaymentHistoryQuerySchema = z.object({
  restaurantId: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

module.exports = {
  GetPaymentHistoryQuerySchema,
};