/**
 * Forbidden Error
 * Thrown when user doesn't have permission to access resource
 */

const { AppError } = require('./AppError');

class ForbiddenError extends AppError {
  /**
   * @param {string} [message='Access forbidden']
   * @param {string} [resource]
   * @param {any} [details]
   */
  constructor(message = 'Access forbidden', resource = undefined, details = undefined) {
    const fullMessage = resource
      ? `Access forbidden: You don't have permission to access ${resource}`
      : message;

    super(fullMessage, 403, 'FORBIDDEN', true, details);
  }
}

module.exports = { ForbiddenError };
