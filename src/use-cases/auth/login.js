/**
 * Login Use Case
 * AUTH-102: User login with email/password
 * 
 * Business Logic:
 * 1. Find user by email
 * 2. Verify password
 * 3. Check email verified
 * 4. Generate access token (15min)
 * 5. Generate refresh token (30 days)
 * 6. Store refresh token in Redis
 * 7. Log authentication event
 * 8. Update last login timestamp
 * 9. Return tokens and user info
 */

const { comparePassword } = require('../../utils/bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

class LoginUseCase {
  /**
   * @param {Object} userRepository - User repository
   * @param {Object} tokenService - Token service (Redis)
   */
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Execute login use case
   * @param {Object} dto - Login DTO
   * @param {string} dto.email - User email
   * @param {string} dto.password - User password
   * @param {string} ipAddress - Client IP address (optional)
   * @returns {Promise<Object>} Login response with tokens and user info
   * @throws {Error} If credentials are invalid
   */
  async execute(dto, ipAddress = null) {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(dto.password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Check email verified (if field exists)
    // Note: email_verified field doesn't exist in users table
    // if (!user.emailVerified) {
    //   throw new Error('Please verify your email before logging in');
    // }

    // 4. Check user status
    if (user.status === 'INACTIVE') {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // 5. Check restaurant status (if applicable)
    if (user.restaurant && user.restaurant.email_verified === false) {
      throw new Error('Restaurant email not verified. Please verify your restaurant email.');
    }

    // 6. Generate access token (15 minutes)
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    }, '15m');

    // 7. Generate refresh token (30 days)
    const refreshToken = generateRefreshToken({
      userId: user.id,
      type: 'REFRESH',
    }, '30d');

    // 8. Store refresh token in Redis (30 days = 2592000 seconds)
    await this.tokenService.saveRefreshToken(user.id, refreshToken, 30 * 24 * 60 * 60);

    // 9. Log authentication event
    await this.userRepository.logAuthEvent(user.id, 'LOGIN', ipAddress);

    // 10. Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    // 11. Return response (exclude password)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        restaurantId: user.restaurantId,
        restaurant: user.restaurant ? {
          id: user.restaurant.id,
          name: user.restaurant.name,
          status: user.restaurant.status,
        } : null,
      },
    };
  }
}

module.exports = { LoginUseCase };
