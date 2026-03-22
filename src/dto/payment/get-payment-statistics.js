const { z } = require('zod');

const GetPaymentStatisticsQuerySchema = z.object({
  restaurantId: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

module.exports = {
  GetPaymentStatisticsQuerySchema,
};