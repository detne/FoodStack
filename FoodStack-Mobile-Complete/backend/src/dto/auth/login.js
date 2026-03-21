/**
 * Login DTO
 * Data Transfer Object for user login
 */

const { z } = require('zod');

/**
 * Login request schema
 */
const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  
  password: z.string()
    .min(1, 'Password is required'),
});

/**
 * Login response interface
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - JWT access token (15min)
 * @property {string} refreshToken - JWT refresh token (30 days)
 * @property {Object} user - User information
 * @property {string} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.fullName - User full name
 * @property {string} user.role - User role (OWNER, MANAGER, STAFF)
 * @property {string} user.restaurantId - Restaurant ID
 */

module.exports = {
  LoginSchema,
};
