// src/dto/service-request/assign.js
const { z } = require('zod');

const AssignServiceRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID format'),
  staffId: z.string().uuid('Invalid staff ID format'),
});

module.exports = {
  AssignServiceRequestSchema,
};