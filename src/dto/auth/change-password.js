const { z } = require('zod');

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(10, 'New password must be at least 10 characters'),
});

module.exports = { ChangePasswordSchema };