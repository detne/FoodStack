/**
 * External Service Error
 * Thrown when external API calls fail
 */

const { AppError } = require('./AppError');

class ExternalServiceError extends AppError {
  /**
   * @param {string} service
   * @param {string} [message='External service error']
   * @param {any} [details]
   */
  constructor(service, message = 'External service error', details = undefined) {
    const fullMessage = `${service} service error: ${message}`;
    super(fullMessage, 502, 'EXTERNAL_SERVICE_ERROR', false, details);
  }
}

module.exports = { ExternalServiceError };
