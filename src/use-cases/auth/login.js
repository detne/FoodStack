/**
 * Login Use Case
 * AUTH-102: User login with email/password
 */

const { comparePassword } = require('../../utils/bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

class LoginUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

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

    // 4. Check user status
    if (user.status === 'INACTIVE') {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // ✅ Normalize restaurant relation from repo (restaurants could be object or array)
    const restaurant = Array.isArray(user.restaurants)
      ? user.restaurants[0]
      : user.restaurants || null;

    // Only check email verification for OWNER role
    if (user.role === 'OWNER' && restaurant && restaurant.email_verified === false) {
      console.log('[DEBUG] BLOCK LOGIN - email=', user.email);
      console.log('[DEBUG] BLOCK LOGIN - user.restaurant_id=', user.restaurant_id);
      console.log('[DEBUG] BLOCK LOGIN - restaurant.id=', restaurant?.id);
      console.log('[DEBUG] BLOCK LOGIN - restaurant.email_verified=', restaurant?.email_verified);
      throw new Error('Restaurant email not verified. Please verify your restaurant email.');
    }

    // 6.0 Get current token version
    const tokenVersion = await this.tokenService.getTokenVersion(user.id);

    // ✅ restaurant id: prefer FK on users table, fallback to relation
    const restaurantId = user.restaurant_id ?? restaurant?.id ?? null;
    
    // ✅ branch id: for staff/manager assigned to specific branch
    const branchId = user.branch_id ?? null;

    // 6. Generate access token (15 minutes)
    const accessToken = generateAccessToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId, // ✅ now should be present
        branchId, // ✅ add branch id for staff
        tv: tokenVersion,
      },
      '15m'
    );

    // Debug
    console.log('[DEBUG] login email=', user.email);
    console.log('[DEBUG] user.restaurant_id=', user.restaurant_id);
    console.log('[DEBUG] restaurant.email_verified=', restaurant?.email_verified);
    console.log('[DEBUG] user.restaurant_id =', user.restaurant_id);
    console.log('[DEBUG] restaurant?.id =', restaurant?.id);
    console.log('[DEBUG] restaurantId used in token =', restaurantId);

    // 7. Generate refresh token (30 days)
    const refreshToken = generateRefreshToken(
      {
        userId: user.id,
        type: 'REFRESH',
        tv: tokenVersion,
      },
      '30d'
    );

    // 8. Store refresh token in Redis
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
        fullName: user.full_name, // ✅ snake_case field from repo/db
        role: user.role,
        restaurantId, // ✅ return normalized
        branchId, // ✅ return branch id for staff
        restaurant: restaurant
          ? {
            id: restaurant.id,
            name: restaurant.name,
            email_verified: restaurant.email_verified,
          }
          : null,
      },
    };
  }
}

module.exports = { LoginUseCase };