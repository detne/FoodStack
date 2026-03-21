// src/dto/staff/set-staff-status.js

const { z } = require('zod');

const SetStaffStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

module.exports = { SetStaffStatusSchema };
