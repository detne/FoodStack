/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const { LoginSchema } = require('../dto/auth/login');

class AuthController {
  /**
   * @param {Object} loginUseCase - Login use case
   * @param {Object} registerRestaurantUseCase - Register restaurant use case
   * @param {Object} refreshTokenUseCase - Refresh token use case
   * @param {Object} logoutUseCase - Logout use case
   */
  constructor(loginUseCase, registerRestaurantUseCase, refreshTokenUseCase, logoutUseCase) {
    this.loginUseCase = loginUseCase;
    this.registerRestaurantUseCase = registerRestaurantUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.logoutUseCase = logoutUseCase;
  }

  /**
   * Login endpoint
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      // Validate input
      const dto = LoginSchema.parse(req.body);

      // Get client IP
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Execute use case
      const result = await this.loginUseCase.execute(dto, ipAddress);

      // Return response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register restaurant endpoint
   * POST /api/v1/auth/register
   */
  async registerRestaurant(req, res, next) {
    try {
      console.log('Request body:', req.body);
      console.log('Request headers:', req.headers);
      
      const { RegisterRestaurantSchema } = require('../dto/auth/register');
      const dto = RegisterRestaurantSchema.parse(req.body);
      const result = await this.registerRestaurantUseCase.execute(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Register error:', error);
      next(error);
    }
  }

  /**
 * Refresh token endpoint
 * POST /api/v1/auth/refresh-token
 */
  async refreshToken(req, res, next) {
    try {
      // Validate input
      const dto = require('../dto/auth/refresh-token').RefreshTokenSchema.parse(req.body);

      // Get client IP
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Execute use case
      const result = await this.refreshTokenUseCase.execute(dto, ipAddress);

      // Return response
      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout endpoint
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      // TODO: Implement logout
      res.status(501).json({
        success: false,
        message: 'Not implemented yet',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
