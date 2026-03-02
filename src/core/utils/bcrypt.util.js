/**
 * Bcrypt Utility
 * Password hashing and comparison using bcryptjs
 * 
 * @module utils/bcrypt
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }
  
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  
  return bcrypt.compare(password, hash);
}

/**
 * Generate a salt
 * @param {number} rounds - Number of rounds (default: 12)
 * @returns {Promise<string>} Salt
 */
async function generateSalt(rounds = SALT_ROUNDS) {
  return bcrypt.genSalt(rounds);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateSalt,
  SALT_ROUNDS,
};
