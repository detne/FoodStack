class RestaurantController {
  constructor(getRestaurantDetailsUseCase) {
    this.getRestaurantDetailsUseCase = getRestaurantDetailsUseCase;
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
}

module.exports = { RestaurantController };