// src/use-cases/auth/logout.js
const { redisService } = require('../../service/redis.service');

class LogoutUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, accessToken) {
    try {
      // 1. Validate user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Blacklist current access token in Redis
      if (process.env.REDIS_ENABLED === 'true' && accessToken) {
        // Calculate TTL from JWT expiry
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(accessToken);
        
        if (decoded && decoded.exp) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;
          
          if (ttl > 0) {
            await redisService.blacklistToken(accessToken, ttl);
            console.log(`Token blacklisted for user ${userId}, TTL: ${ttl}s`);
          }
        }
      }

      // 3. Optional: Increment token version to invalidate all tokens
      // await this.userRepository.incrementTokenVersion(userId);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = { LogoutUseCase };
