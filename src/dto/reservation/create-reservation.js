const { z } = require('zod');

const CreateReservationSchema = z.object({
  branchId: z.string().min(1, 'branchId is required').optional(),
  branch_id: z.string().min(1, 'branch_id is required').optional(),
  tableId: z.string().optional(),
  table_id: z.string().optional(),
  customerName: z.string().min(1, 'customerName is required').optional(),
  guest_name: z.string().min(1, 'guest_name is required').optional(),
  customerPhone: z.string().min(1, 'customerPhone is required').optional(),
  guest_phone: z.string().min(1, 'guest_phone is required').optional(),
  customerEmail: z.string().email().optional(),
  guest_email: z.string().email().optional(),
  partySize: z.number().int().min(1, 'partySize must be at least 1').optional(),
  guest_count: z.number().int().min(1, 'guest_count must be at least 1').optional(),
  reservationDate: z.string().min(1, 'reservationDate is required').optional(),
  reservation_date: z.string().min(1, 'reservation_date is required').optional(),
  reservationTime: z.string().min(1, 'reservationTime is required').optional(),
  reservation_time: z.string().min(1, 'reservation_time is required').optional(),
  notes: z.string().optional(),
  special_requests: z.string().optional(),
}).transform((data) => {
  // Normalize field names to camelCase
  return {
    branchId: data.branchId || data.branch_id,
    tableId: data.tableId || data.table_id || null,
    customerName: data.customerName || data.guest_name,
    customerPhone: data.customerPhone || data.guest_phone,
    customerEmail: data.customerEmail || data.guest_email || null,
    partySize: data.partySize || data.guest_count,
    reservationDate: data.reservationDate || data.reservation_date,
    reservationTime: data.reservationTime || data.reservation_time,
    notes: data.notes || data.special_requests || null,
  };
});

module.exports = { CreateReservationSchema };
