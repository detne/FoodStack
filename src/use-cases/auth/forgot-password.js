/**
 * Forgot Password Use Case
 * Business logic for password reset request
 */

const crypto = require('crypto');

class ForgotPasswordUseCase {
  /**
   * @param {Object} userRepository - User repository
   * @param {Object} emailService - Email service (optional for now)
   */
  constructor(userRepository, emailService = null) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  /**
   * Execute forgot password use case
   * @param {Object} dto - Forgot password DTO
   * @param {string} dto.email - User email
   * @returns {Promise<Object>} Success message
   */
  async execute(dto) {
    const { email } = dto;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    // Security: Always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token in database
    await this.userRepository.updateResetToken(user.id, {
      resetToken: hashedToken,
      resetTokenExpiresAt: expiresAt,
    });

    // TODO: Send email with reset link
    // For now, we'll return the token in development mode
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Password Reset Link:', resetLink);
      console.log('🔑 Reset Token:', resetToken);
    }

    // In production, send email instead
    if (this.emailService) {
      await this.emailService.sendPasswordResetEmail(user.email, resetLink);
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && {
        resetToken,
        resetLink,
      }),
    };
  }
}

module.exports = { ForgotPasswordUseCase };
