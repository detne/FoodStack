// src/middleware/validation.js
const { ValidationError } = require('../exception/validation-error');

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}

module.exports = {
  validateRequest,
};
