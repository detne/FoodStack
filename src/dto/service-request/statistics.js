// src/dto/service-request/statistics.js
const { z } = require('zod');

const ServiceRequestStatisticsSchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
  branchId: z.string().min(1).optional(), // Optional filter by specific branch
  startDate: z.string().datetime().optional(), // ISO date string
  endDate: z.string().datetime().optional(),   // ISO date string
});

module.exports = {
  ServiceRequestStatisticsSchema,
};