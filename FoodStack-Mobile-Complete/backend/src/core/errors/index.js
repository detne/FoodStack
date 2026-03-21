/**
 * Error Classes Export
 */

const { AppError } = require('./AppError');
const { ValidationError } = require('./ValidationError');
const { NotFoundError } = require('./NotFoundError');
const { UnauthorizedError } = require('./UnauthorizedError');
const { ForbiddenError } = require('./ForbiddenError');
const { ConflictError } = require('./ConflictError');
const { DatabaseError } = require('./DatabaseError');
const { ExternalServiceError } = require('./ExternalServiceError');
const {
  PaymentError,
  PaymentAlreadyProcessedError,
  PaymentTimeoutError,
  InsufficientFundsError,
} = require('./PaymentError');

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  PaymentError,
  PaymentAlreadyProcessedError,
  PaymentTimeoutError,
  InsufficientFundsError,
};
