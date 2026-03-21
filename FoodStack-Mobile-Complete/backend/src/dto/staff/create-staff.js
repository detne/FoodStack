// src/dto/staff/create-staff.js

const { z } = require('zod');

const CreateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  branchId: z.string().uuid('Invalid branch ID format'),
});

module.exports = { CreateStaffSchema };
