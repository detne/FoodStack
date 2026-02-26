/**
 * Validation Error
 * Thrown when input validation fails
 */

const { AppError } = require('./AppError');

class ValidationError extends AppError {
  /**
   * @param {string} [message='Validation failed']
   * @param {any} [details]
   */
  constructor(message = 'Validation failed', details = undefined) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }

  /**
   * Create ValidationError from Zod error
   * @param {import('zod').ZodError} error
   * @returns {ValidationError}
   */
  static fromZodError(error) {
    const details = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new ValidationError('Validation failed', details);
  }
}

module.exports = { ValidationError };
