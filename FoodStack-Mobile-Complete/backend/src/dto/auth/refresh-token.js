/**
 * Refresh Token DTO
 * Data Transfer Object for refreshing access token
 */

const { z } = require('zod');

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

module.exports = {
  RefreshTokenSchema,
};