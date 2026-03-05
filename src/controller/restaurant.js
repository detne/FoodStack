// src/controller/restaurant.js
class RestaurantController {
  constructor({ getRestaurantDetailsUseCase, uploadRestaurantLogoUseCase, createRestaurantUseCase }) {
    this.getRestaurantDetailsUseCase = getRestaurantDetailsUseCase;
    this.uploadRestaurantLogoUseCase = uploadRestaurantLogoUseCase;
    this.createRestaurantUseCase = createRestaurantUseCase;
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

  // POST/PUT /api/v1/restaurants/:restaurantId/logo (depending on your routes)
  async uploadLogo(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const file = req.file;
      const userId = req.user?.userId; // From auth middleware

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

      console.log('DTO:', dto);
      const result = await this.createRestaurantUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Create restaurant error:', error);
      next(error);
    }
  }
}

module.exports = { RestaurantController };