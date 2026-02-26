/**
 * Base Application Error
 * All custom errors extend from this class
 */

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {string} [code='INTERNAL_ERROR']
   * @param {boolean} [isOperational=true]
   * @param {any} [details]
   */
  constructor(
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
    details = undefined
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    };
  }
}

module.exports = { AppError };
