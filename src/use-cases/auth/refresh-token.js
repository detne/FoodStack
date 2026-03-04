/**
 * Refresh Token Use Case
 * Implement token refresh mechanism
 *
 * Acceptance Criteria:
 * - Validate refresh token from Redis
 * - Generate new access token
 * - Handle token rotation
 * - Blacklist old tokens
 * - Return new access token
 * - Log refresh events
 */

const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

class RefreshTokenUseCase {
  /**
   * @param {Object} userRepository - User repository
   * @param {Object} tokenService - Token service (Redis)
   */
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Execute refresh token use case
   * @param {Object} dto
   * @param {string} dto.refreshToken
   * @param {string|null} ipAddress
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async execute(dto, ipAddress = null) {
    const { refreshToken } = dto;

    // 0) Check blacklist (old refresh tokens)
    const isBlacklisted = await this.tokenService.isRefreshTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new Error('Refresh token has been revoked');
    }

    // 1) Verify refresh token signature + expiry
    const payload = verifyRefreshToken(refreshToken);

    // 2) Validate payload type
    if (!payload || payload.type !== 'REFRESH' || !payload.userId) {
      throw new Error('Invalid refresh token');
    }

    const userId = payload.userId;

    // 2.5) Validate token version (invalidate-all-tokens support)
    const currentVersion = await this.tokenService.getTokenVersion(userId);
    if ((payload.tv ?? 0) !== currentVersion) {
      throw new Error('Refresh token has been revoked');
    }

    // 3) Validate refresh token against Redis (must match current active token)
    const storedToken = await this.tokenService.getRefreshToken(userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // 4) Ensure user still exists/active
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.status === 'INACTIVE') {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // 5) Generate new access token (15 minutes)
    const accessToken = generateAccessToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        tv: currentVersion,
      },
      '15m'
    );

    // 6) Token rotation: generate NEW refresh token (30 days)
    const newRefreshToken = generateRefreshToken(
      {
        userId: user.id,
        type: 'REFRESH',
        tv: currentVersion,
      },
      '30d'
    );

    // 7) Blacklist old refresh token with remaining TTL (until it would expire)
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = Number(payload.exp) || nowSec + 1;
    const remainingTtl = Math.max(1, expSec - nowSec);

    await this.tokenService.blacklistRefreshToken(refreshToken, remainingTtl);

    // 8) Save new refresh token to Redis (30 days)
    await this.tokenService.saveRefreshToken(user.id, newRefreshToken, 30 * 24 * 60 * 60);

    // 9) Log refresh event
    await this.userRepository.logAuthEvent(user.id, 'REFRESH_TOKEN', ipAddress);

    // 10) Return new tokens
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}

module.exports = { RefreshTokenUseCase };