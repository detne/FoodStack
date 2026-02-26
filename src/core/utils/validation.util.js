/**
 * Validation Utilities
 * Common validation functions
 */

class ValidationUtil {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Vietnamese format)
   * @param {string} phone
   * @returns {boolean}
   */
  static isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate UUID format
   * @param {string} uuid
   * @returns {boolean}
   */
  static isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate password strength
   * @param {string} password
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static isStrongPassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate positive number
   * @param {number} value
   * @returns {boolean}
   */
  static isPositiveNumber(value) {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  }

  /**
   * Validate non-negative number
   * @param {number} value
   * @returns {boolean}
   */
  static isNonNegativeNumber(value) {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
  }

  /**
   * Validate string not empty
   * @param {string} str
   * @returns {boolean}
   */
  static isNonEmptyString(str) {
    return typeof str === 'string' && str.trim().length > 0;
  }

  /**
   * Sanitize string (remove HTML tags)
   * @param {string} str
   * @returns {string}
   */
  static sanitizeString(str) {
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Validate order amount
   * @param {number} amount
   * @returns {boolean}
   */
  static isValidOrderAmount(amount) {
    return this.isPositiveNumber(amount) && amount <= 100000000; // 100M VND
  }

  /**
   * Validate table capacity
   * @param {number} capacity
   * @returns {boolean}
   */
  static isValidTableCapacity(capacity) {
    return this.isPositiveNumber(capacity) && capacity <= 50;
  }
}

module.exports = { ValidationUtil };
