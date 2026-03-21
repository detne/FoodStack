/**
 * Reset Password DTO
 * Data Transfer Object for password reset with token
 */

const { z } = require('zod');

/**
 * Reset Password Schema
 * Validates token and new password
 */
const ResetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .max(500, 'Invalid token'),
  
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Reset Password DTO Type
 * @typedef {Object} ResetPasswordDTO
 * @property {string} token - Password reset token
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Password confirmation
 */

module.exports = {
  ResetPasswordSchema,
};
