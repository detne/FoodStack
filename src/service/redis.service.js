// src/service/redis.service.js
const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      // Build Redis URL from env variables
      let redisUrl;
      if (process.env.REDIS_URL) {
        redisUrl = process.env.REDIS_URL;
      } else if (process.env.REDIS_HOST) {
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT || 6379;
        const password = process.env.REDIS_PASSWORD;
        const db = process.env.REDIS_DB || 0;
        
        if (password) {
          redisUrl = `redis://:${password}@${host}:${port}/${db}`;
        } else {
          redisUrl = `redis://${host}:${port}/${db}`;
        }
      } else {
        redisUrl = 'redis://localhost:6379';
      }

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis: Too many reconnection attempts');
              return new Error('Too many retries');
            }
            return retries * 100;
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('⚠️  Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async blacklistToken(token, expiryInSeconds) {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping blacklist');
      return false;
    }

    try {
      const key = `blacklist:${token}`;
      await this.client.setEx(key, expiryInSeconds, 'blacklisted');
      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  async isTokenBlacklisted(token) {
    if (!this.isConnected) {
      console.warn('Redis not connected, assuming token is valid');
      return false;
    }

    try {
      const key = `blacklist:${token}`;
      const result = await this.client.get(key);
      return result !== null;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      // On error, assume token is valid to not block users
      return false;
    }
  }

  async removeFromBlacklist(token) {
    if (!this.isConnected) return false;

    try {
      const key = `blacklist:${token}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      return false;
    }
  }

  async getAllBlacklistedTokens() {
    if (!this.isConnected) return [];

    try {
      const keys = await this.client.keys('blacklist:*');
      return keys;
    } catch (error) {
      console.error('Error getting blacklisted tokens:', error);
      return [];
    }
  }
}

const redisService = new RedisService();

module.exports = { redisService, RedisService };
