const { z } = require('zod');

const CreatePaymentBodySchema = z.object({
  orderId: z.string().min(1),
  qrToken: z.string().min(1),
  method: z.enum(['QR_PAY', 'E_WALLET', 'CASH']),
});

module.exports = {
  CreatePaymentBodySchema,
};