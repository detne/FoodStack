/**
 * Unauthorized Error
 * Thrown when authentication fails or token is invalid
 */

const { AppError } = require('./AppError');

class UnauthorizedError extends AppError {
  /**
   * @param {string} [message='Unauthorized access']
   * @param {any} [details]
   */
  constructor(message = 'Unauthorized access', details = undefined) {
    super(message, 401, 'UNAUTHORIZED', true, details);
  }
}

module.exports = { UnauthorizedError };
