const { z } = require('zod');

const CheckAvailabilitySchema = z.object({
  branchId: z.string().min(1, 'branchId is required'),
  reservationDate: z.string().min(1, 'reservationDate is required'),
  reservationTime: z.string().min(1, 'reservationTime is required'),
  partySize: z.coerce.number().int().min(1, 'partySize must be at least 1'),
});

module.exports = { CheckAvailabilitySchema };
