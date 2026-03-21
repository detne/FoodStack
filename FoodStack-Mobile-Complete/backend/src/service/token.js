/**
 * Token Service
 * Manages refresh tokens in Redis
 */

const Redis = require('ioredis');

class TokenService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected for TokenService');
    });
  }

  /**
   * Save refresh token to Redis
   * @param {string} userId - User ID
   * @param {string} token - Refresh token
   * @param {number} ttl - Time to live in seconds (default: 30 days)
   */
  async saveRefreshToken(userId, token, ttl = 30 * 24 * 60 * 60) {
    const key = `refresh_token:${userId}`;
    await this.redis.setex(key, ttl, token);
  }

  /**
   * Get refresh token from Redis
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Refresh token or null
   */
  async getRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    return await this.redis.get(key);
  }

  /**
   * Delete refresh token from Redis
   * @param {string} userId - User ID
   */
  async deleteRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Blacklist access token (for logout / immediate invalidation)
   * @param {string} token - Access token
   * @param {number} expiresIn - Expiration time in seconds
   */
  async blacklistAccessToken(token, expiresIn) {
    const ttl = Math.max(1, Number(expiresIn) || 1);
    const key = `blacklist:${token}`;
    await this.redis.setex(key, ttl, '1');
  }

  /**
   * Check if access token is blacklisted
   * @param {string} token - Access token
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  /**
   * Blacklist refresh token (token rotation)
   * @param {string} token - Refresh token
   * @param {number} expiresIn - Expiration time in seconds
   */
  async blacklistRefreshToken(token, expiresIn) {
    const ttl = Math.max(1, Number(expiresIn) || 1);
    const key = `refresh_blacklist:${token}`;
    await this.redis.setex(key, ttl, '1');
  }

  /**
   * Check if refresh token is blacklisted
   * @param {string} token - Refresh token
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isRefreshTokenBlacklisted(token) {
    const key = `refresh_blacklist:${token}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  // =====================================================
  // ✅ NEW: Token Versioning (invalidate all tokens)
  // Key: token_version:<userId>
  // =====================================================

  /**
   * Get token version for a user (default 0)
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getTokenVersion(userId) {
    const key = `token_version:${userId}`;
    const v = await this.redis.get(key);
    return v ? Number(v) : 0;
  }

  /**
   * Set token version explicitly (optional utility)
   * @param {string} userId
   * @param {number} version
   */
  async setTokenVersion(userId, version) {
    const key = `token_version:${userId}`;
    await this.redis.set(key, String(Number(version) || 0));
  }

  /**
   * Bump token version to invalidate all existing tokens
   * Returns new version
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async bumpTokenVersion(userId) {
    const key = `token_version:${userId}`;
    const newV = await this.redis.incr(key);
    return Number(newV);
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
  }
}

module.exports = { TokenService };