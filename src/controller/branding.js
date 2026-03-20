// src/controller/branding.js

const { UpdateBrandingSchema } = require('../dto/branding/update-branding');

class BrandingController {
  constructor({ getBrandingUseCase, updateBrandingUseCase }) {
    this.getBrandingUseCase = getBrandingUseCase;
    this.updateBrandingUseCase = updateBrandingUseCase;
  }

  // GET /api/v1/branding/:branchId
  async get(req, res, next) {
    try {
      const { branchId } = req.params;
      const result = await this.getBrandingUseCase.execute(branchId);

      res.status(200).json({
        success: true,
        message: 'Branding retrieved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/branding/:branchId
  async update(req, res, next) {
    try {
      const { branchId } = req.params;
      const dto = UpdateBrandingSchema.parse(req.body);

      const result = await this.updateBrandingUseCase.execute(branchId, dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Branding updated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { BrandingController };
