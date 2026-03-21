const { verifyAccessToken } = require('../utils/jwt');

function createAuthMiddleware(tokenService) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [type, token] = header.split(' ');

      if (type !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check blacklist (logout, etc.)
      const blacklisted = await tokenService.isTokenBlacklisted(token);
      if (blacklisted) {
        return res.status(401).json({ success: false, message: 'Token is blacklisted' });
      }

      // Verify JWT
      const payload = verifyAccessToken(token);

      // Check token version (invalidate all tokens)
      const currentVersion = await tokenService.getTokenVersion(payload.userId);
      if ((payload.tv ?? 0) !== currentVersion) {
        return res.status(401).json({ success: false, message: 'Token has been revoked' });
      }

      req.user = payload;      // { userId, email, role, restaurantId, tv, iat, exp }
      req.accessToken = token; // keep for blacklisting current token if needed
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
    }
  };
}

module.exports = { createAuthMiddleware };