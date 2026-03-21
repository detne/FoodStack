/**
 * Forgot Password DTO
 * Data Transfer Object for forgot password request
 */

const { z } = require('zod');

/**
 * Forgot Password Schema
 * Validates email for password reset request
 */
const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),
});

/**
 * Forgot Password DTO Type
 * @typedef {Object} ForgotPasswordDTO
 * @property {string} email - User email address
 */

module.exports = {
  ForgotPasswordSchema,
};
