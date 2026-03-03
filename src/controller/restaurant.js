// src/controller/restaurant.js
class RestaurantController {
  constructor(uploadRestaurantLogoUseCase) {
    this.uploadRestaurantLogoUseCase = uploadRestaurantLogoUseCase;
  }

  async uploadLogo(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const file = req.file;
      const userId = req.user?.id; // From auth middleware

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const result = await this.uploadRestaurantLogoUseCase.execute(
        restaurantId,
        file,
        userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { RestaurantController };
