/**
 * Create Order DTO
 * Input validation for creating orders
 */

const { z } = require('zod');

/**
 * Order Item Schema
 */
const OrderItemSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Quantity cannot exceed 50'),
  notes: z.string().max(500, 'Notes too long').optional(),
  customizations: z.array(
    z.object({
      optionId: z.string().uuid('Invalid customization option ID'),
      priceDelta: z.number().min(0, 'Price delta cannot be negative'),
    })
  ).optional(),
});

/**
 * Create Order Schema
 */
const CreateOrderSchema = z.object({
  tableId: z.string().uuid('Invalid table ID'),
  items: z.array(OrderItemSchema)
    .min(1, 'Order must have at least one item')
    .max(50, 'Order cannot have more than 50 items'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  sessionId: z.string().uuid('Invalid session ID').optional(),
});

/**
 * @typedef {Object} OrderItemDto
 * @property {string} menuItemId
 * @property {number} quantity
 * @property {string} [notes]
 * @property {Array<{optionId: string, priceDelta: number}>} [customizations]
 */

/**
 * @typedef {Object} CreateOrderDto
 * @property {string} tableId
 * @property {OrderItemDto[]} items
 * @property {string} [notes]
 * @property {string} [sessionId]
 */

/**
 * Validate create order input
 * @param {any} data
 * @returns {CreateOrderDto}
 * @throws {import('zod').ZodError}
 */
function validateCreateOrder(data) {
  return CreateOrderSchema.parse(data);
}

/**
 * Safe validation (returns result object)
 * @param {any} data
 * @returns {{success: boolean, data?: CreateOrderDto, error?: import('zod').ZodError}}
 */
function safeValidateCreateOrder(data) {
  const result = CreateOrderSchema.safeParse(data);
  return result;
}

module.exports = {
  CreateOrderSchema,
  OrderItemSchema,
  validateCreateOrder,
  safeValidateCreateOrder,
};
