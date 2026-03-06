// src/controller/menu-item.js

class MenuItemController {
  constructor({ createMenuItemUseCase, updateMenuItemUseCase, deleteMenuItemUseCase, uploadMenuItemImageUseCase, updateMenuItemAvailabilityUseCase }) {
    this.createMenuItemUseCase = createMenuItemUseCase;
    this.updateMenuItemUseCase = updateMenuItemUseCase;
    this.deleteMenuItemUseCase = deleteMenuItemUseCase;
    this.uploadMenuItemImageUseCase = uploadMenuItemImageUseCase;
    this.updateMenuItemAvailabilityUseCase = updateMenuItemAvailabilityUseCase;
  }

  // POST /api/v1/menu-items
  async create(req, res, next) {
    try {
      const { CreateMenuItemDto } = require('../dto/menu-item/create-menu-item');

      const dto = new CreateMenuItemDto({
        categoryId: req.body.categoryId,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        available: req.body.available,
        userId: req.user?.userId,
      });

      const result = await this.createMenuItemUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/menu-items/:id
  async update(req, res, next) {
    try {
      const { UpdateMenuItemDto } = require('../dto/menu-item/update-menu-item');

      const dto = new UpdateMenuItemDto({
        menuItemId: req.params.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        categoryId: req.body.categoryId,
        imageUrl: req.body.imageUrl,
        available: req.body.available,
        userId: req.user?.userId,
      });

      const result = await this.updateMenuItemUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/menu-items/:id
  async delete(req, res, next) {
    try {
      const { DeleteMenuItemDto } = require('../dto/menu-item/delete-menu-item');

      const dto = new DeleteMenuItemDto({
        menuItemId: req.params.id,
        userId: req.user?.userId,
      });

      const result = await this.deleteMenuItemUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { menuItemId: result.menuItemId },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/menu-items/:id/image
  async uploadImage(req, res, next) {
    try {
      const { id } = req.params;
      const file = req.file;
      const userId = req.user?.userId;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const result = await this.uploadMenuItemImageUseCase.execute(id, file, userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          menuItemId: result.menuItemId,
          imageUrl: result.imageUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/menu-items/:id/availability
  async updateAvailability(req, res, next) {
    try {
      const { UpdateMenuItemAvailabilityDto } = require('../dto/menu-item/update-availability');

      const dto = new UpdateMenuItemAvailabilityDto({
        menuItemId: req.params.id,
        available: req.body.available,
        userId: req.user?.userId,
      });

      const result = await this.updateMenuItemAvailabilityUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Menu item availability updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { MenuItemController };
