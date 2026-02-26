/**
 * Conflict Error
 * Thrown when there's a conflict with existing data
 */

const { AppError } = require('./AppError');

class ConflictError extends AppError {
  /**
   * @param {string} [message='Resource conflict']
   * @param {string} [resource]
   * @param {any} [details]
   */
  constructor(message = 'Resource conflict', resource = undefined, details = undefined) {
    const fullMessage = resource
      ? `Conflict: ${resource} already exists or conflicts with existing data`
      : message;

    super(fullMessage, 409, 'CONFLICT', true, details);
  }
}

module.exports = { ConflictError };
