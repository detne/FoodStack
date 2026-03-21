/**
 * Environment Configuration
 * Type-safe environment variable access with validation
 */

const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test'
  ? '.env.test'
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// =====================================================
// Environment Schema Validation
// =====================================================

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  APP_NAME: z.string().default('QR Service Platform'),
  APP_URL: z.string().url(),
  API_VERSION: z.string().default('v1'),

  // PostgreSQL
  DATABASE_URL: z.string().url(),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().transform(Number).default('5432'),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  // MongoDB
  MONGODB_URI: z.string(),
  MONGODB_HOST: z.string().default('localhost'),
  MONGODB_PORT: z.string().transform(Number).default('27017'),
  MONGODB_DB: z.string(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(32),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('30d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // PayOS
  PAYOS_CLIENT_ID: z.string(),
  PAYOS_API_KEY: z.string(),
  PAYOS_CHECKSUM_KEY: z.string(),
  PAYOS_RETURN_URL: z.string().url(),
  PAYOS_CANCEL_URL: z.string().url(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_DIR: z.string().default('logs'),

  // CORS
  CORS_ORIGIN: z.string(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Business Configuration
  TAX_RATE: z.string().transform(Number).default('0.10'),
  SERVICE_CHARGE_RATE: z.string().transform(Number).default('0.05'),
});

/**
 * Parse and validate environment variables
 * @returns {z.infer<typeof envSchema>}
 */
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

const env = parseEnv();

/**
 * Check if running in production
 * @returns {boolean}
 */
const isProduction = () => env.NODE_ENV === 'production';

/**
 * Check if running in development
 * @returns {boolean}
 */
const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * Check if running in test
 * @returns {boolean}
 */
const isTest = () => env.NODE_ENV === 'test';

/**
 * Get CORS origins as array
 * @returns {string[]}
 */
const getCorsOrigins = () => {
  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
};

// =====================================================
// Configuration Objects
// =====================================================

const databaseConfig = {
  postgres: {
    url: env.DATABASE_URL,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
  mongodb: {
    uri: env.MONGODB_URI,
    host: env.MONGODB_HOST,
    port: env.MONGODB_PORT,
    database: env.MONGODB_DB,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
};

const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    accessTokenExpiry: env.JWT_ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: env.JWT_REFRESH_TOKEN_EXPIRY,
  },
  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },
};

const businessConfig = {
  tax: {
    rate: env.TAX_RATE,
  },
  serviceCharge: {
    rate: env.SERVICE_CHARGE_RATE,
  },
};

module.exports = {
  env,
  isProduction,
  isDevelopment,
  isTest,
  getCorsOrigins,
  databaseConfig,
  authConfig,
  businessConfig,
};
