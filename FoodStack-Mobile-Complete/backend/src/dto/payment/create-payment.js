const { z } = require('zod');

const PaymentMethodEnum = z.enum(['QR_PAY', 'E_WALLET', 'CASH']);

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1),
  method: PaymentMethodEnum,
  // optional: nếu bạn muốn cho client gửi amount (thường lấy từ order.total tốt hơn)
  amount: z.number().positive().optional(),
});

module.exports = { CreatePaymentSchema, PaymentMethodEnum };