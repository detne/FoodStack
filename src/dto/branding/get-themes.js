// src/dto/branding/get-themes.js

const { z } = require('zod');

const GetThemesQuerySchema = z.object({
  category: z.enum(['LIGHT', 'DARK', 'COLORFUL', 'MINIMAL']).optional(),
  package: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { GetThemesQuerySchema };