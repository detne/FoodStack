/**
 * Database Configuration
 * Production-grade database connection management
 */

const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { logger } = require('./logger.config');

// =====================================================
// PostgreSQL Configuration (Prisma)
// =====================================================

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
    errorFormat: 'minimal',
  });
};

/** @type {PrismaClient} */
const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
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

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
});

// =====================================================
// MongoDB Configuration (Mongoose)
// =====================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_service_platform';

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });

    // MongoDB connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', { error });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected through app termination');
  process.exit(0);
});

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

// =====================================================
// Database Health Check
// =====================================================

/**
 * Check health of all databases
 * @returns {Promise<{postgres: boolean, mongodb: boolean, redis: boolean}>}
 */
const checkDatabaseHealth = async () => {
  const health = {
    postgres: false,
    mongodb: false,
    redis: false,
  };

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.postgres = true;
  } catch (error) {
    logger.error('PostgreSQL health check failed', { error });
  }

  // Check MongoDB
  try {
    await mongoose.connection.db.admin().ping();
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
    // Connect MongoDB
    await connectMongoDB();

    // Verify all connections
    const health = await checkDatabaseHealth();
    
    if (!health.postgres || !health.mongodb || !health.redis) {
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
  connectMongoDB,
  checkDatabaseHealth,
  initializeDatabases,
};
