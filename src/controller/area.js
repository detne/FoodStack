const { CreateAreaBodySchema } = require('../dto/area/create-area');

class AreaController {
  constructor(createAreaUseCase) {
    this.createAreaUseCase = createAreaUseCase;
  }

  // POST /api/v1/branches/:branchId/areas
  async create(req, res, next) {
    try {
      const { branchId } = req.params;
      const dto = CreateAreaBodySchema.parse(req.body);

      const area = await this.createAreaUseCase.execute(branchId, dto, {
        userId: req.user.userId,
        role: req.user.role,
      });

      res.status(201).json({
        success: true,
        message: 'Area created successfully',
        data: area,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AreaController };