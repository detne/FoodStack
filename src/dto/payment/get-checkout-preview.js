const { z } = require('zod');

const GetCheckoutPreviewQuerySchema = z.object({
  orderId: z.string().min(1),
  qrToken: z.string().min(1),
});

module.exports = {
  GetCheckoutPreviewQuerySchema,
};