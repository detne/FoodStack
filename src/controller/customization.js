// src/controller/customization.js

class CustomizationController {
  constructor({ createCustomizationGroupUseCase, addCustomizationOptionUseCase }) {
    this.createCustomizationGroupUseCase = createCustomizationGroupUseCase;
    this.addCustomizationOptionUseCase = addCustomizationOptionUseCase;
  }

  // POST /api/v1/customizations/groups
  async createGroup(req, res, next) {
    try {
      const { CreateCustomizationGroupDto } = require('../dto/customization/create-customization-group');

      const dto = new CreateCustomizationGroupDto({
        menuItemId: req.body.menuItemId,
        name: req.body.name,
        description: req.body.description,
        minSelect: req.body.minSelect,
        maxSelect: req.body.maxSelect,
        isRequired: req.body.isRequired,
        options: req.body.options,
        userId: req.user?.userId,
      });

      const result = await this.createCustomizationGroupUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Customization group created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/customizations/options
  async addOption(req, res, next) {
    try {
      const { AddCustomizationOptionDto } = require('../dto/customization/add-customization-option');

      const dto = new AddCustomizationOptionDto({
        groupId: req.body.groupId,
        name: req.body.name,
        priceDelta: req.body.priceDelta,
        sortOrder: req.body.sortOrder,
        isAvailable: req.body.isAvailable,
        userId: req.user?.userId,
      });

      const result = await this.addCustomizationOptionUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Customization option added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { CustomizationController };