// src/dto/staff/get-staff-list.js

const { z } = require('zod');

const GetStaffListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  branchId: z.string().optional(), // Optional branchId from frontend
});

module.exports = { GetStaffListSchema };
