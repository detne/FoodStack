// src/dto/service-request/get-pending.js
const { z } = require('zod');

const GetPendingServiceRequestsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  branchId: z.string().uuid().optional(), // Optional filter by specific branch
});

module.exports = {
  GetPendingServiceRequestsSchema,
};