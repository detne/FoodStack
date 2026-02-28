/**
 * Database Error
 * Thrown when database operations fail
 */

const { AppError } = require('./AppError');

class DatabaseError extends AppError {
  /**
   * @param {string} [message='Database operation failed']
   * @param {string} [operation]
   * @param {any} [details]
   */
  constructor(message = 'Database operation failed', operation = undefined, details = undefined) {
    const fullMessage = operation
      ? `Database error during ${operation}: ${message}`
      : message;

    super(fullMessage, 500, 'DATABASE_ERROR', false, details);
  }
}

module.exports = { DatabaseError };
