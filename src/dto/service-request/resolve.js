// src/dto/service-request/resolve.js
const { z } = require('zod');

const ResolveServiceRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID format'),
});

module.exports = {
  ResolveServiceRequestSchema,
};