const { z } = require('zod');

const PaymentMethodSchema = z.enum(['CASH', 'QRPAY', 'EWALLET']);

const ProcessPaymentBodySchema = z.object({
  orderId: z.string().min(1),
  method: PaymentMethodSchema,
});

module.exports = { ProcessPaymentBodySchema, PaymentMethodSchema };