// src/use-cases/auth/register-restaurant.js
const { hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/token');
const { ValidationError } = require('../../exception/validation-error');

class RegisterRestaurantUseCase {
  constructor(userRepository, restaurantRepository, emailService, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.emailService = emailService;
    this.prisma = prisma;
  }

  async execute(dto) {
    // 1. Validate unique email
    const existingUser = await this.userRepository.findByEmail(dto.ownerEmail);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // 2. Start transaction
    return await this.prisma.$transaction(async (tx) => {
      // 3. Create restaurant
      const restaurant = await this.restaurantRepository.create({
        name: dto.restaurantName,
        businessType: dto.businessType,
        taxCode: dto.taxCode,
        address: dto.address,
        status: 'PENDING_VERIFICATION',
      }, tx);

      // 4. Hash password
      const hashedPassword = await hashPassword(dto.ownerPassword);

      // 5. Create owner user
      const user = await this.userRepository.create({
        email: dto.ownerEmail,
        password: hashedPassword,
        fullName: dto.ownerName,
        phone: dto.ownerPhone,
        role: 'OWNER',
        restaurantId: restaurant.id,
        emailVerified: false,
      }, tx);

      // 6. Generate verification token
      const verificationToken = generateToken({ 
        userId: user.id, 
        type: 'EMAIL_VERIFICATION' 
      });
      
      // 7. Store token
      await this.userRepository.saveVerificationToken(
        user.id, 
        verificationToken, 
        tx
      );

      // 8. Send verification email
      this.emailService.sendVerificationEmail(
        dto.ownerEmail,
        dto.ownerName,
        verificationToken
      ).catch(err => console.error('Email error:', err));

      return {
        userId: user.id,
        restaurantId: restaurant.id,
        email: user.email,
        message: 'Registration successful. Please verify your email.',
        verificationEmailSent: true,
      };
    });
  }
}

module.exports = { RegisterRestaurantUseCase };
