const { z } = require('zod');

const PaymentItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
});

const CreatePaymentBodySchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['QR_PAY', 'E_WALLET', 'CASH']),
  description: z.string().min(1).max(25).optional(),
  customerName: z.string().optional(),
  items: z.array(PaymentItemSchema).default([]),
});

module.exports = {
  CreatePaymentBodySchema,
};