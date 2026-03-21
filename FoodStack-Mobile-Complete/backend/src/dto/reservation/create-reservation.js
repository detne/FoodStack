const { z } = require('zod');

const CreateReservationSchema = z.object({
  branchId: z.string().min(1, 'branchId is required'),
  tableId: z.string().min(1, 'tableId is required'),
  customerName: z.string().min(1, 'customerName is required'),
  customerPhone: z.string().min(1, 'customerPhone is required'),
  customerEmail: z.string().email().optional(),
  partySize: z.number().int().min(1, 'partySize must be at least 1'),
  reservationDate: z.string().min(1, 'reservationDate is required'),
  reservationTime: z.string().min(1, 'reservationTime is required'),
  notes: z.string().optional(),
});

module.exports = { CreateReservationSchema };
