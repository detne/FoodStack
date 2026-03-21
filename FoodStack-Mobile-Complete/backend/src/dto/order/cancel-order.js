const { z } = require('zod');

const CancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason too long')
});

module.exports = { CancelOrderSchema };