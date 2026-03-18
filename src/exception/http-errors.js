// src/exception/http-errors.js

class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}

module.exports = { NotFoundError, ForbiddenError, BadRequestError };