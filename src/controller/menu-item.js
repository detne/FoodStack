// src/controller/menu-item.js

class MenuItemController {
  constructor({ 
    createMenuItemUseCase, 
    updateMenuItemUseCase, 
    deleteMenuItemUseCase, 
    uploadMenuItemImageUseCase, 
    updateMenuItemAvailabilityUseCase,
    updateBranchAvailabilityUseCase,
    searchMenuItemsUseCase,
    importMenuItemsUseCase,
  }) {
    this.createMenuItemUseCase = createMenuItemUseCase;
    this.updateMenuItemUseCase = updateMenuItemUseCase;
    this.deleteMenuItemUseCase = deleteMenuItemUseCase;
    this.uploadMenuItemImageUseCase = uploadMenuItemImageUseCase;
    this.updateMenuItemAvailabilityUseCase = updateMenuItemAvailabilityUseCase;
    this.updateBranchAvailabilityUseCase = updateBranchAvailabilityUseCase;
    this.searchMenuItemsUseCase = searchMenuItemsUseCase;
    this.importMenuItemsUseCase = importMenuItemsUseCase;
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

  // PATCH /api/v1/menu-items/:id/branch-availability
  async updateBranchAvailability(req, res, next) {
    try {
      const { UpdateBranchAvailabilityDto } = require('../dto/menu-item/update-branch-availability');

      const dto = new UpdateBranchAvailabilityDto({
        menuItemId: req.params.id,
        available: req.body.available,
        reason: req.body.reason,
        userId: req.user?.userId,
        branchId: req.body.branchId, // Accept branchId from frontend
      });

      const result = await this.updateBranchAvailabilityUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Branch-specific availability updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/menu-items/import
  async importItems(req, res, next) {
    try {
      const rows = req.body.rows;

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'rows must be a non-empty array',
        });
      }

      if (rows.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 500 rows per import',
        });
      }

      const result = await this.importMenuItemsUseCase.execute(rows, req.user?.userId);

      const statusCode = result.failed === 0 ? 200 : result.succeeded === 0 ? 422 : 207;

      return res.status(statusCode).json({
        success: result.failed === 0,
        message: `Imported ${result.succeeded}/${result.total} items successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/menu-items/search
  async search(req, res, next) {    try {
      const { SearchMenuItemsDto } = require('../dto/menu-item/search-menu-items');

      const dto = new SearchMenuItemsDto({
        keyword: req.query.keyword,
        category: req.query.category,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        branchId: req.query.branchId,
        restaurantId: req.user?.restaurantId, // Add restaurant from user
      });

      const result = await this.searchMenuItemsUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Menu items retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { MenuItemController };
