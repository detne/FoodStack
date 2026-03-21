const { z } = require('zod');

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value'
  })
});

module.exports = { UpdateOrderStatusSchema };