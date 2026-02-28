/**
 * Cache Service
 * Redis-based caching with tenant isolation
 */

const { redis } = require('../../config/database.config');
const { logger } = require('../../config/logger.config');
const { CACHE_TTL } = require('../../config/constants');

class CacheService {
  /**
   * Get value from cache
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {any} value
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = CACHE_TTL.MEDIUM) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  }

  /**
   * Delete key from cache
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern
   * @returns {Promise<void>}
   */
  async deletePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
    }
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get TTL of key
   * @param {string} key
   * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error('Cache TTL error', { key, error: error.message });
      return -2;
    }
  }

  /**
   * Set expiry on key
   * @param {string} key
   * @param {number} seconds
   * @returns {Promise<void>}
   */
  async expire(key, seconds) {
    try {
      await redis.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error', { key, error: error.message });
    }
  }

  /**
   * Increment value
   * @param {string} key
   * @param {number} [amount=1]
   * @returns {Promise<number>}
   */
  async increment(key, amount = 1) {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      logger.error('Cache increment error', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Get or set (cache-aside pattern)
   * @param {string} key
   * @param {Function} fetchFunction - Function to fetch data if not in cache
   * @param {number} [ttl]
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFunction, ttl = CACHE_TTL.MEDIUM) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetchFunction();
    
    // Store in cache
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Invalidate cache for tenant
   * @param {string} restaurantId
   * @returns {Promise<void>}
   */
  async invalidateTenant(restaurantId) {
    await this.deletePattern(`*:${restaurantId}:*`);
    logger.info('Cache invalidated for tenant', { restaurantId });
  }

  /**
   * Invalidate cache for branch
   * @param {string} branchId
   * @returns {Promise<void>}
   */
  async invalidateBranch(branchId) {
    await this.deletePattern(`*:branch:${branchId}*`);
    logger.info('Cache invalidated for branch', { branchId });
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const info = await redis.info('stats');
      const keyspace = await redis.info('keyspace');
      
      return {
        info,
        keyspace,
        connected: redis.status === 'ready',
      };
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return { connected: false };
    }
  }

  /**
   * Flush all cache (use with caution!)
   * @returns {Promise<void>}
   */
  async flushAll() {
    try {
      await redis.flushdb();
      logger.warn('Cache flushed - all keys deleted');
    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
    }
  }
}

module.exports = { CacheService };
