const { z } = require('zod');

const TableStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUTOFSERVICE']);

const UpdateTableBodySchema = z
  .object({
    capacity: z.number().int().positive().optional(), // >0
    status: TableStatusEnum.optional(),
  })
  .refine((v) => v.capacity !== undefined || v.status !== undefined, {
    message: 'At least one field (capacity/status) must be provided',
  });

module.exports = { UpdateTableBodySchema, TableStatusEnum };