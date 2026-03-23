// src/dto/staff/update-staff.js

const { z } = require('zod');

const UpdateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().regex(/^[0-9+\-\s()]{8,20}$/, 'Invalid phone format').optional().nullable(),
  email: z.string().email('Invalid email format').optional(),
  branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format").optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }).optional(),
});

module.exports = { UpdateStaffSchema };
