const { verifyAccessToken } = require('../utils/jwt');
const { redisService } = require('../service/redis.service');

function createAuthMiddleware(tokenService) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [type, token] = header.split(' ');

      if (type !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check Redis blacklist first (faster)
      if (process.env.REDIS_ENABLED === 'true') {
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: 'Token has been revoked'
          });
        }
      }

      // Verify JWT
      const payload = verifyAccessToken(token);
      console.log('Auth middleware - JWT payload:', payload);

      // Check token version (invalidate all tokens)
      const currentVersion = await tokenService.getTokenVersion(payload.userId);
      if ((payload.tv ?? 0) !== currentVersion) {
        return res.status(401).json({ success: false, message: 'Token has been revoked' });
      }

      req.user = payload;      // { userId, email, role, restaurantId, tv, iat, exp }
      req.accessToken = token; // keep for blacklisting current token if needed
      console.log('Auth middleware - req.user set:', req.user);
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
    }
  };
}

module.exports = { createAuthMiddleware };