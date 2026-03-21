/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const { LoginSchema } = require('../dto/auth/login');
const { RegisterRestaurantSchema } = require('../dto/auth/register');
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
   * @param {Object} changePasswordUseCase - Change password use case
   */
  constructor(
    loginUseCase,
    registerRestaurantUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    changePasswordUseCase,
    verifyEmailOtpUseCase
  ) {
    this.loginUseCase = loginUseCase;
    this.registerRestaurantUseCase = registerRestaurantUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.logoutUseCase = logoutUseCase;

    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;

    this.changePasswordUseCase = changePasswordUseCase;
    this.verifyEmailOtpUseCase = verifyEmailOtpUseCase;
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
    console.log(
      '[DEBUG] registerRestaurantUseCase =',
      this.registerRestaurantUseCase?.constructor?.name
    );
    console.log('[DEBUG] body keys =', Object.keys(req.body || {}));

    try {
      console.log('Request body:', req.body);
      console.log('Request headers:', req.headers);

      const dto = RegisterRestaurantSchema.parse(req.body);
      const result = await this.registerRestaurantUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: result,
      });
    } catch (error) {
      console.error('Register error:', error);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const dto = require('../dto/auth/refresh-token').RefreshTokenSchema.parse(req.body);
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.refreshTokenUseCase.execute(dto, ipAddress);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: result,
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

  async changePassword(req, res, next) {
    try {
      const { ChangePasswordSchema } = require('../dto/auth/change-password');
      const dto = ChangePasswordSchema.parse(req.body);

      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.changePasswordUseCase.execute(dto, {
        userId: req.user.userId,
        accessToken: req.accessToken,
        ipAddress,
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
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

  async verifyEmailOtp(req, res, next) {
    try {
      const { VerifyEmailOtpSchema } = require('../dto/auth/verify-email-otp');
      const dto = VerifyEmailOtpSchema.parse(req.body);

      const result = await this.verifyEmailOtpUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get current user info
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      // User info is already available from auth middleware
      const user = req.user;
      
      res.status(200).json({
        success: true,
        message: 'User info retrieved',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };