// src/dto/staff/create-staff.js

const { z } = require('zod');

const CreateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  role: z.enum(['WAITER', 'CHEF', 'CASHIER', 'MANAGER'], {
    errorMap: () => ({ message: 'Role must be WAITER, CHEF, CASHIER, or MANAGER' }),
  }),
  branchId: z.string().uuid('Invalid branch ID format'),
});

module.exports = { CreateStaffSchema };
