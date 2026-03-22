// src/use-cases/auth/register-restaurant.js
const { hashPassword } = require('../../utils/bcrypt');
const { ValidationError } = require('../../exception/validation-error');

class RegisterRestaurantUseCase {
  constructor(userRepository, restaurantRepository, emailService, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.emailService = emailService;
    this.prisma = prisma;
  }

  async execute(dto) {
    // 1) Validate unique email
    const existingUser = await this.userRepository.findByEmail(dto.ownerEmail);
    if (existingUser) throw new ValidationError('Email already registered');

    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      // 2) Hash password
      const hashedPassword = await hashPassword(dto.ownerPassword);

      // 3) Create owner user FIRST (restaurant_id null) - Let MongoDB generate ObjectId
      const user = await tx.users.create({
        data: {
          restaurant_id: null,
          email: dto.ownerEmail,
          password_hash: hashedPassword,
          full_name: dto.ownerName,
          phone: dto.ownerPhone,
          role: 'OWNER',
          status: 'ACTIVE',
          updated_at: now,
        },
      });

      // 4) Create restaurant with owner_id
      const restaurant = await tx.restaurants.create({
        data: {
          owner_id: user.id,
          name: dto.restaurantName ?? 'My Restaurant',
          email: dto.ownerEmail,
          phone: dto.ownerPhone,
          address: dto.address ?? 'Default Address',
          email_verified: false,
          email_verified_at: null,
          subscription_id: null,
          updated_at: now,
        },
      });

      // 5) Optional: set active restaurant for owner (tiện cho luồng hiện tại)
      await tx.users.update({
        where: { id: user.id },
        data: {
          restaurant_id: restaurant.id,
          updated_at: now,
        },
      });

      // 6) Create default branch
      await tx.branches.create({
        data: {
          restaurant_id: restaurant.id,
          name: 'Main Branch',
          address: dto.address ?? 'Default Address',
          phone: dto.ownerPhone,
          status: 'ACTIVE',
          updated_at: now,
        },
      });

      // 7) Generate OTP + expiry
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // 8) Store OTP
      await tx.users.update({
        where: { id: user.id },
        data: {
          email_verify_otp: otp,
          email_verify_otp_expires_at: expiresAt,
          updated_at: new Date(),
        },
      });

      // 9) Send OTP email (async)
      this.emailService
        .sendOtpEmail(dto.ownerEmail, dto.ownerName, otp)
        .catch((err) => console.error('Email error:', err));

      return {
        userId: user.id,
        restaurantId: restaurant.id,
        email: user.email,
        message: 'Registration successful. OTP has been sent to your email.',
        otpSent: true,
      };
    });
  }
}

module.exports = { RegisterRestaurantUseCase };
