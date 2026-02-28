/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */

const { AppError } = require('./AppError');

class NotFoundError extends AppError {
  /**
   * @param {string} [resource='Resource']
   * @param {string|number} [identifier]
   * @param {any} [details]
   */
  constructor(resource = 'Resource', identifier = undefined, details = undefined) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, 404, 'NOT_FOUND', true, details);
  }
}

module.exports = { NotFoundError };
