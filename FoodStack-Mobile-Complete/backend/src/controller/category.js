// src/controller/category.js

class CategoryController {
  constructor({ createCategoryUseCase, updateCategoryUseCase, deleteCategoryUseCase, categoryRepository }) {
    this.createCategoryUseCase = createCategoryUseCase;
    this.updateCategoryUseCase = updateCategoryUseCase;
    this.deleteCategoryUseCase = deleteCategoryUseCase;
    this.categoryRepository = categoryRepository;
  }

  // GET /api/v1/categories
  async list(req, res, next) {
    try {
      const { branch_id } = req.query;
      
      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: 'branch_id is required',
        });
      }

      const categories = await this.categoryRepository.findByBranchId(branch_id);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/categories/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;
      const category = await this.categoryRepository.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/categories
  async create(req, res, next) {
    try {
      const { CreateCategoryDto } = require('../dto/category/create-category');

      const dto = new CreateCategoryDto({
        branchId: req.body.branchId,
        name: req.body.name,
        description: req.body.description,
        sortOrder: req.body.sortOrder,
        userId: req.user?.userId,
      });

      const result = await this.createCategoryUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/categories/:id
  async update(req, res, next) {
    try {
      const { UpdateCategoryDto } = require('../dto/category/update-category');

      const dto = new UpdateCategoryDto({
        categoryId: req.params.id,
        name: req.body.name,
        description: req.body.description,
        sortOrder: req.body.sortOrder,
        userId: req.user?.userId,
      });

      const result = await this.updateCategoryUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/categories/:id
  async delete(req, res, next) {
    try {
      const { DeleteCategoryDto } = require('../dto/category/delete-category');

      const dto = new DeleteCategoryDto({
        categoryId: req.params.id,
        userId: req.user?.userId,
      });

      const result = await this.deleteCategoryUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { categoryId: result.categoryId },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { CategoryController };
