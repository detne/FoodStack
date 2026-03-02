// src/dto/auth/register.js
const { z } = require('zod');

const RegisterRestaurantSchema = z.object({
  ownerName: z.string().min(2).max(100),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8).max(100),
  ownerPhone: z.string().regex(/^[0-9]{10,11}$/),
  restaurantName: z.string().min(2).max(200),
  businessType: z.enum(['RESTAURANT', 'CAFE', 'BAR', 'FAST_FOOD']),
  taxCode: z.string().optional(),
  address: z.string().min(10).max(500),
});

module.exports = {
  RegisterRestaurantSchema,
};
