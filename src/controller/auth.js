/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

const { LoginSchema } = require('../dto/auth/login');

class AuthController {
  constructor(loginUseCase, registerRestaurantUseCase, refreshTokenUseCase, logoutUseCase, changePasswordUseCase) {
    this.loginUseCase = loginUseCase;
    this.registerRestaurantUseCase = registerRestaurantUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.logoutUseCase = logoutUseCase;
    this.changePasswordUseCase = changePasswordUseCase;
  }

  async login(req, res, next) {
    try {
      const dto = LoginSchema.parse(req.body);
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.loginUseCase.execute(dto, ipAddress);

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
}

module.exports = { AuthController };