const { ValidationError } = require('../../exception/validation-error');

class VerifyEmailOtpUseCase {
  constructor(userRepository, prisma) {
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(dto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new ValidationError('User not found');

    if (!user.email_verify_otp || !user.email_verify_otp_expires_at) {
      throw new ValidationError('No OTP found. Please request a new OTP.');
    }

    if (user.email_verify_otp !== dto.otp) {
      throw new ValidationError('Invalid OTP');
    }

    if (new Date(user.email_verify_otp_expires_at).getTime() < Date.now()) {
      throw new ValidationError('OTP expired');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.restaurants.update({
        where: { id: user.restaurant_id },
        data: {
          email_verified: true,
          email_verified_at: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.users.update({
        where: { id: user.id },
        data: {
          email_verify_otp: null,
          email_verify_otp_expires_at: null,
          updated_at: new Date(),
        },
      });

      return { message: 'Email verified successfully' };
    });
  }
}

module.exports = { VerifyEmailOtpUseCase };