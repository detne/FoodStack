// src/dto/service-request/acknowledge.js
const { z } = require('zod');

const AcknowledgeServiceRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID format'),
});

module.exports = {
  AcknowledgeServiceRequestSchema,
};