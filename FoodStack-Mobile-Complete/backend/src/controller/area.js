const { CreateAreaBodySchema } = require('../dto/area/create-area');
const { UpdateAreaBodySchema } = require('../dto/area/update-area');

class AreaController {
  constructor(createAreaUseCase, getListAreaUseCase, updateAreaUseCase, deleteAreaUseCase) {
    this.createAreaUseCase = createAreaUseCase;
    this.getListAreaUseCase = getListAreaUseCase;
    this.updateAreaUseCase = updateAreaUseCase;
    this.deleteAreaUseCase = deleteAreaUseCase;
  }

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

  async listByBranch(req, res, next) {
    try {
      const { branchId } = req.params;

      const areas = await this.getListAreaUseCase.execute(branchId, {
        userId: req.user.userId,
        role: req.user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Areas fetched successfully',
        data: areas,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { areaId } = req.params;
      const dto = UpdateAreaBodySchema.parse(req.body);

      const result = await this.updateAreaUseCase.execute(areaId, dto, {
        userId: req.user.userId,
        role: req.user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Area updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { areaId } = req.params;

      const result = await this.deleteAreaUseCase.execute(areaId, {
        userId: req.user.userId,
        role: req.user.role,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AreaController };