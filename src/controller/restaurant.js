const {
  GetRestaurantStatisticsQuerySchema,
} = require('../dto/restaurant/get-restaurant-statistics');

class RestaurantController {
  constructor(getRestaurantStatisticsUseCase) {
    this.getRestaurantStatisticsUseCase = getRestaurantStatisticsUseCase;
  }

  /**
   * GET /api/v1/restaurants/me/statistics?from=...&to=...
   */
  async getMyStatistics(req, res, next) {
    try {
      const dto = GetRestaurantStatisticsQuerySchema.parse(req.query);

      const result = await this.getRestaurantStatisticsUseCase.execute(dto, {
        userId: req.user.userId,
        role: req.user.role,
        restaurantId: req.user.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Restaurant statistics',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { RestaurantController };