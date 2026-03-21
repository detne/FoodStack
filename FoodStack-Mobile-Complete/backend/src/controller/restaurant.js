const {
  GetRestaurantStatisticsQuerySchema,
} = require('../dto/restaurant/get-restaurant-statistics');
const {
  UpdateRestaurantSchema,
} = require('../dto/restaurant/update-restaurant');

class RestaurantController {
  constructor({
    getRestaurantDetailsUseCase,
    uploadRestaurantLogoUseCase,
    createRestaurantUseCase,
    updateRestaurantUseCase,
    getRestaurantStatisticsUseCase,
    deleteRestaurantUseCase,
  }) {
    this.getRestaurantDetailsUseCase = getRestaurantDetailsUseCase;
    this.uploadRestaurantLogoUseCase = uploadRestaurantLogoUseCase;
    this.createRestaurantUseCase = createRestaurantUseCase;
    this.updateRestaurantUseCase = updateRestaurantUseCase;
    this.getRestaurantStatisticsUseCase = getRestaurantStatisticsUseCase;
    this.deleteRestaurantUseCase = deleteRestaurantUseCase;
  }

  // GET /api/v1/restaurants/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await this.getRestaurantDetailsUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Restaurant details',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/restaurants/:restaurantId/logo
  async uploadLogo(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const file = req.file;
      const userId = req.user?.userId;

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

  // POST /api/v1/restaurants
  async create(req, res, next) {
    try {
      const { CreateRestaurantDto } = require('../dto/restaurant/create-restaurant');

      const dto = new CreateRestaurantDto({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        logoUrl: req.body.logoUrl,
        ownerId: req.user?.userId, // From auth middleware
      });

      const result = await this.createRestaurantUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/restaurants/:restaurantId
  async updateRestaurant(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const dto = UpdateRestaurantSchema.parse(req.body);

      const result = await this.updateRestaurantUseCase.execute(dto, restaurantId, {
        userId: req.user.userId,
        role: req.user.role,
        restaurantId: req.user.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.restaurant,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/v1/restaurants/:id
  async deleteRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const result = await this.deleteRestaurantUseCase.execute(id, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
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

  /**
   * GET /api/v1/restaurants/me
   * Get current user's restaurant(s)
   */
  async getMyRestaurants(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = req.user.role;

      let restaurants = [];

      if (role === 'OWNER') {
        // For owners, get all owned restaurants
        restaurants = await this.getRestaurantDetailsUseCase.getOwnedRestaurants(userId);
      } else if (req.user.restaurantId) {
        // For staff/managers, get their assigned restaurant
        const restaurant = await this.getRestaurantDetailsUseCase.execute(req.user.restaurantId);
        restaurants = restaurant ? [restaurant] : [];
      }

      res.status(200).json({
        success: true,
        message: 'User restaurants',
        data: restaurants,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { RestaurantController };
