/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const { LoginSchema } = require('../dto/auth/login');
const { ForgotPasswordSchema } = require('../dto/auth/forgot-password');
const { ResetPasswordSchema } = require('../dto/auth/reset-password');

class AuthController {
  /**
   * @param {Object} loginUseCase - Login use case
   * @param {Object} registerRestaurantUseCase - Register restaurant use case
   * @param {Object} refreshTokenUseCase - Refresh token use case
   * @param {Object} logoutUseCase - Logout use case
   * @param {Object} forgotPasswordUseCase - Forgot password use case
   * @param {Object} resetPasswordUseCase - Reset password use case
   */
  constructor(
    loginUseCase,
    registerRestaurantUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase
  ) {
    this.loginUseCase = loginUseCase;
    this.registerRestaurantUseCase = registerRestaurantUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.logoutUseCase = logoutUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
  }

  async login(req, res, next) {
    try {
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

  async registerRestaurant(req, res, next) {
    try {
      res.status(501).json({ success: false, message: 'Not implemented yet' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      // TODO: Implement refresh token
      res.status(501).json({
        success: false,
        message: 'Not implemented yet',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.status(501).json({ success: false, message: 'Not implemented yet' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password endpoint
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      // Validate input
      const dto = ForgotPasswordSchema.parse(req.body);
      
      // Execute use case
      const result = await this.forgotPasswordUseCase.execute(dto);
      
      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
        ...(process.env.NODE_ENV === 'development' && {
          data: {
            resetToken: result.resetToken,
            resetLink: result.resetLink,
          },
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password endpoint
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      // Validate input
      const dto = ResetPasswordSchema.parse(req.body);
      
      // Execute use case
      const result = await this.resetPasswordUseCase.execute(dto);
      
      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };