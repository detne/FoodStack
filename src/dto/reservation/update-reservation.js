const { z } = require('zod');

const UpdateReservationSchema = z.object({
  partySize: z.number().int().min(1).optional(),
  reservationDate: z.string().optional(),
  reservationTime: z.string().optional(),
  notes: z.string().optional(),
});

module.exports = { UpdateReservationSchema };
