// src/dto/staff/create-staff.js

const { z } = require('zod');

const CreateStaffSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  branch_id: z.string().min(24).max(24).optional(), // MongoDB ObjectId is 24 characters
  phone: z.string().optional(),
  password: z.string().optional(), // Remove min length validation temporarily
  role: z.enum(['STAFF', 'MANAGER'], {
    errorMap: () => ({ message: 'Role must be either STAFF or MANAGER' })
  }).optional(),
});

module.exports = { CreateStaffSchema };
