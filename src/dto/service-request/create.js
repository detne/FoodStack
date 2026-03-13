// src/dto/service-request/create.js
const { z } = require('zod');

const CreateServiceRequestSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
  requestType: z.enum([
    'CALL_STAFF',
    'REQUEST_WATER',
    'REQUEST_NAPKIN',
    'REQUEST_UTENSILS',
    'REQUEST_BILL',
    'REQUEST_MENU',
    'COMPLAINT',
    'OTHER'
  ]),
  message: z.string().max(500).optional(),
});

module.exports = {
  CreateServiceRequestSchema,
};