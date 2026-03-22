/**
 * Database Configuration
 * Production-grade database connection management
 */

const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { logger } = require('./logger.config');

// =====================================================
// MongoDB Configuration (Primary Database via Prisma)
// =====================================================

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Use globalThis for better compatibility
const globalForPrisma = globalThis;

/** @type {PrismaClient} */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Prisma logging
prisma.$on('query', (e) => {
  if (process.env.LOG_QUERIES === 'true') {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error', { error: e });
});

// Graceful shutdown handlers
const disconnectPrisma = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  } catch (error) {
    logger.error('Error disconnecting Prisma', { error });
  }
};

process.on('beforeExit', disconnectPrisma);
process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
process.on('SIGUSR2', disconnectPrisma); // nodemon restart signal

// =====================================================
// Redis Configuration (ioredis)
// =====================================================

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

// Redis Client for general use
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

// Redis Client for Pub/Sub (separate connection)
const redisPubSub = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  db: REDIS_DB,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Redis events
redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (error) => {
  logger.error('Redis error', { error });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
  await redisPubSub.quit();
  logger.info('Redis disconnected through app termination');
});

/**
 * Check health of all databases
 * @returns {Promise<{mongodb: boolean, redis: boolean}>}
 */
const checkDatabaseHealth = async () => {
  const health = {
    mongodb: false,
    redis: false,
  };

  // Check MongoDB via Prisma
  try {
    await prisma.$connect();
    health.mongodb = true;
  } catch (error) {
    logger.error('MongoDB health check failed', { error });
  }

  // Check Redis
  try {
    await redis.ping();
    health.redis = true;
  } catch (error) {
    logger.error('Redis health check failed', { error });
  }

  return health;
};

// =====================================================
// Initialize All Databases
// =====================================================

/**
 * Initialize all database connections
 * @returns {Promise<void>}
 */
const initializeDatabases = async () => {
  try {
    // Connect to MongoDB via Prisma
    await prisma.$connect();

    // Verify all connections
    const health = await checkDatabaseHealth();
    
    if (!health.mongodb || !health.redis) {
      throw new Error('Database health check failed');
    }

    logger.info('All databases initialized successfully', health);
  } catch (error) {
    logger.error('Database initialization failed', { error });
    throw error;
  }
};

module.exports = {
  prisma,
  redis,
  redisPubSub,
  checkDatabaseHealth,
  initializeDatabases,
};
