const { z } = require('zod');

const ListReservationsSchema = z.object({
  branchId: z.string().min(1, 'branchId is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { ListReservationsSchema };
