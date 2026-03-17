const { z } = require('zod');

const OrderItemSchema = z.object({
  menu_item_id: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
  customizations: z.array(z.object({
    customization_option_id: z.string(),
    price_delta: z.number()
  })).optional()
});

const CreateOrderSchema = z.object({
  qr_token: z.string().min(1, 'QR token is required'),
  customer_count: z.number().int().min(1).optional().default(1),
  items: z.array(OrderItemSchema).optional().default([])
});

module.exports = { CreateOrderSchema };