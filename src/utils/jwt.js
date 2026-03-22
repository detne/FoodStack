/**
 * JWT Utility
 * JSON Web Token generation and verification
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-secret';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Expiration time (default: 1h)
 * @returns {string} JWT token
 */
function generateAccessToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Expiration time (default: 30d)
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode JWT without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
