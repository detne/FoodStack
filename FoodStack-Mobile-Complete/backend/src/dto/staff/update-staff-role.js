// src/dto/staff/update-staff-role.js

const { z } = require('zod');

const UpdateStaffRoleSchema = z.object({
  role: z.enum(['MANAGER', 'STAFF'], {
    errorMap: () => ({ message: 'Role must be MANAGER or STAFF' }),
  }),
});

module.exports = { UpdateStaffRoleSchema };
