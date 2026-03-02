const zxcvbn = require('zxcvbn');
const { comparePassword, hashPassword } = require('../../utils/bcrypt');
const { decodeToken } = require('../../utils/jwt');

class ChangePasswordUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * dto: { oldPassword, newPassword }
   * context: { userId, accessToken, ipAddress }
   */
  async execute(dto, context) {
    const { userId, accessToken, ipAddress = null } = context;

    // 1) Must be authenticated (enforced by middleware, but double-safe)
    if (!userId) throw new Error('Unauthorized');

    // 2) Load user
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // 3) Verify old password
    const ok = await comparePassword(dto.oldPassword, user.password_hash);
    if (!ok) throw new Error('Old password is incorrect');

    // 4) Validate new password strength (zxcvbn score 0..4)
    if (dto.newPassword === dto.oldPassword) {
      throw new Error('New password must be different from old password');
    }

    const strength = zxcvbn(dto.newPassword);
    // score: 0 (weak) -> 4 (strong)
    if (strength.score < 3) {
      const hint =
        strength.feedback?.warning ||
        (strength.feedback?.suggestions || []).join(' ') ||
        'Password is too weak';
      throw new Error(`New password is too weak. ${hint}`.trim());
    }

    // 5) Hash new password with bcrypt
    const newHash = await hashPassword(dto.newPassword);

    // 6) Update password in DB
    await this.userRepository.update(userId, {
      password_hash: newHash,
      updated_at: new Date(),
    });

    // 7) Invalidate ALL existing tokens
    // - bump token version (kills all access/refresh minted earlier)
    await this.tokenService.bumpTokenVersion(userId);

    // - delete refresh token (optional but good: forces re-login on other devices)
    await this.tokenService.deleteRefreshToken(userId);

    // - blacklist current access token immediately (optional but nice)
    if (accessToken) {
      const decoded = decodeToken(accessToken);
      const now = Math.floor(Date.now() / 1000);
      const exp = Number(decoded?.exp || 0);
      const ttl = Math.max(1, exp - now);
      await this.tokenService.blacklistAccessToken(accessToken, ttl);
    }

    // 8) Log event
    await this.userRepository.logAuthEvent(userId, 'CHANGE_PASSWORD', ipAddress);

    return { success: true };
  }
}

module.exports = { ChangePasswordUseCase };