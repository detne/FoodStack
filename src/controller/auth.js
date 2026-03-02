// src/controller/auth.js
const { RegisterRestaurantSchema } = require('../dto/auth/register');

class AuthController {
  constructor(registerRestaurantUseCase) {
    this.registerRestaurantUseCase = registerRestaurantUseCase;
  }

  async registerRestaurant(req, res, next) {
    try {
      const dto = RegisterRestaurantSchema.parse(req.body);
      const result = await this.registerRestaurantUseCase.execute(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
