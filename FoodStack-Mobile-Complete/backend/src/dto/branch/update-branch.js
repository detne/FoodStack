const { z } = require('zod');

const UpdateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = { UpdateBranchSchema };