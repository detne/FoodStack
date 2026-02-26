/**
 * Logger Configuration
 * Production-grade structured logging with Winston
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// Custom Log Format
// =====================================================

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label'],
  }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    let metaStr = '';
    if (metadata && Object.keys(metadata).length > 0) {
      metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// =====================================================
// Transport Configuration
// =====================================================

/** @type {winston.transport[]} */
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: NODE_ENV === 'production' ? customFormat : consoleFormat,
  })
);

// File transports (production only)
if (NODE_ENV === 'production') {
  // All logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: customFormat,
    })
  );

  // Error logs
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat,
    })
  );
}

// =====================================================
// Logger Instance
// =====================================================

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  transports,
  exitOnError: false,
});

// =====================================================
// HTTP Request Logger
// =====================================================

/**
 * Log HTTP request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} responseTime - Response time in ms
 */
const httpLogger = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    restaurantId: req.tenantContext?.restaurantId,
    userId: req.user?.id,
  };

  if (res.statusCode >= 500) {
    logger.error('HTTP Request Error', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request Warning', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

// =====================================================
// Business Event Logger
// =====================================================

const eventLogger = {
  /**
   * @param {string} orderId
   * @param {string} restaurantId
   * @param {number} amount
   */
  orderCreated: (orderId, restaurantId, amount) => {
    logger.info('Order Created', {
      event: 'ORDER_CREATED',
      orderId,
      restaurantId,
      amount,
    });
  },

  /**
   * @param {string} orderId
   * @param {string} paymentId
   * @param {number} amount
   * @param {string} method
   * @param {string} status
   */
  paymentProcessed: (orderId, paymentId, amount, method, status) => {
    logger.info('Payment Processed', {
      event: 'PAYMENT_PROCESSED',
      orderId,
      paymentId,
      amount,
      method,
      status,
    });
  },

  /**
   * @param {string} tableId
   * @param {string} requestType
   * @param {string} restaurantId
   */
  serviceRequest: (tableId, requestType, restaurantId) => {
    logger.info('Service Request', {
      event: 'SERVICE_REQUEST',
      tableId,
      requestType,
      restaurantId,
    });
  },
};

// =====================================================
// Security Event Logger
// =====================================================

const securityLogger = {
  /**
   * @param {string} email
   * @param {string} ip
   * @param {string} reason
   */
  authenticationFailed: (email, ip, reason) => {
    logger.warn('Authentication Failed', {
      event: 'AUTH_FAILED',
      email,
      ip,
      reason,
    });
  },

  /**
   * @param {string} userId
   * @param {string} email
   * @param {string} ip
   */
  authenticationSuccess: (userId, email, ip) => {
    logger.info('Authentication Success', {
      event: 'AUTH_SUCCESS',
      userId,
      email,
      ip,
    });
  },
};

// =====================================================
// Error Logger with Context
// =====================================================

/**
 * Log error with context
 * @param {Error} error
 * @param {Object} [context]
 */
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  });
};

module.exports = {
  logger,
  httpLogger,
  eventLogger,
  securityLogger,
  logError,
};
