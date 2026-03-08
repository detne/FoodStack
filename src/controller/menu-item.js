// src/controller/menu-item.js

class MenuItemController {
  constructor({ createMenuItemUseCase, updateMenuItemUseCase, deleteMenuItemUseCase, uploadMenuItemImageUseCase, menuItemRepository }) {
    this.createMenuItemUseCase = createMenuItemUseCase;
    this.updateMenuItemUseCase = updateMenuItemUseCase;
    this.deleteMenuItemUseCase = deleteMenuItemUseCase;
    this.uploadMenuItemImageUseCase = uploadMenuItemImageUseCase;
    this.menuItemRepository = menuItemRepository;
  }

  // GET /api/v1/menu-items?categoryId=xxx
  async list(req, res, next) {
    try {
      const { categoryId } = req.query;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'categoryId is required',
        });
      }

      const menuItems = await this.menuItemRepository.findByCategoryId(categoryId);

      res.status(200).json({
        success: true,
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/menu-items/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;

      const menuItem = await this.menuItemRepository.findById(id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found',
        });
      }

      res.status(200).json({
        success: true,
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
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
}

module.exports = { MenuItemController };
