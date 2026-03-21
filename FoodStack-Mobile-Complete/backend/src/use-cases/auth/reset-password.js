/**
 * Reset Password Use Case
 * Business logic for password reset with token validation
 */

const crypto = require('crypto');
const { hashPassword } = require('../../utils/bcrypt');

class ResetPasswordUseCase {
  /**
   * @param {Object} userRepository - User repository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute reset password use case
   * @param {Object} dto - Reset password DTO
   * @param {string} dto.token - Reset token
   * @param {string} dto.newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async execute(dto) {
    const { token, newPassword } = dto;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by reset token
    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    const now = new Date();
    if (user.resetTokenExpiresAt < now) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await this.userRepository.updatePassword(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    });

    // TODO: Log password change event
    console.log(`✅ Password changed for user: ${user.email}`);

    // TODO: Send confirmation email
    // TODO: Invalidate all existing sessions/tokens

    return {
      message: 'Password has been reset successfully',
    };
  }
}

module.exports = { ResetPasswordUseCase };
