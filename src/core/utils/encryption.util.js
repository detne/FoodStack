/**
 * Encryption Utilities
 * Password hashing and token generation
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { env } = require('../../config/env.config');

class EncryptionUtil {
  /**
   * Hash password using bcrypt
   * @param {string} password
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random token
   * @param {number} [length=32]
   * @returns {string}
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   * @returns {string}
   */
  static generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Generate OTP code
   * @param {number} [length=6]
   * @returns {string}
   */
  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Hash data using SHA256
   * @param {string} data
   * @returns {string}
   */
  static sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   * @param {string} data
   * @param {string} secret
   * @returns {string}
   */
  static createHMAC(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param {string} data
   * @param {string} signature
   * @param {string} secret
   * @returns {boolean}
   */
  static verifyHMAC(data, signature, secret) {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate secure random string
   * @param {number} [length=32]
   * @returns {string}
   */
  static generateSecureRandom(length = 32) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Mask sensitive data (for logging)
   * @param {string} data
   * @param {number} [visibleChars=4]
   * @returns {string}
   */
  static maskSensitiveData(data, visibleChars = 4) {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    return (
      data.substring(0, visibleChars) +
      '*'.repeat(data.length - visibleChars)
    );
  }
}

module.exports = { EncryptionUtil };
