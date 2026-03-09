const { z } = require('zod');

const CreateBranchSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1, 'name is required'),
  address: z.string().min(1, 'address is required'),
  phone: z.string().optional(),
  status: z.string().optional(), // ví dụ: ACTIVE/INACTIVE
});

module.exports = { CreateBranchSchema };