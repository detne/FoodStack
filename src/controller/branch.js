// src/controller/branch.js
const { CreateBranchSchema } = require('../dto/branch/create-branch');
const { UpdateBranchSchema } = require('../dto/branch/update-branch');
const { ListBranchesSchema } = require('../dto/branch/list-branches');
const { UpdateBrandingSchema } = require('../dto/branch/update-branding');
const { UploadBrandingImageSchema, validateFile } = require('../dto/branch/upload-branding-image');
const { DeleteBrandingImageSchema } = require('../dto/branch/delete-branding-image');

class BranchController {
  constructor({
    createBranchUseCase,
    updateBranchUseCase,
    listBranchesUseCase,
    deleteBranchUseCase,
    getBranchDetailsUseCase,
    getFullMenuByBranchUseCase,
    getBranchBrandingUseCase,
    updateBranchBrandingUseCase,
    uploadBrandingImageUseCase,
    deleteBrandingImageUseCase
  }) {
    this.createBranchUseCase = createBranchUseCase;
    this.updateBranchUseCase = updateBranchUseCase;
    this.listBranchesUseCase = listBranchesUseCase;
    this.deleteBranchUseCase = deleteBranchUseCase;
    this.getBranchDetailsUseCase = getBranchDetailsUseCase;
    this.getFullMenuByBranchUseCase = getFullMenuByBranchUseCase;
    this.getBranchBrandingUseCase = getBranchBrandingUseCase;
    this.updateBranchBrandingUseCase = updateBranchBrandingUseCase;
    this.uploadBrandingImageUseCase = uploadBrandingImageUseCase;
    this.deleteBrandingImageUseCase = deleteBrandingImageUseCase;
  }

  // POST /api/v1/branches
  async create(req, res, next) {
    try {
      const dto = CreateBranchSchema.parse(req.body);

      const result = await this.createBranchUseCase.execute(dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(201).json({
        success: true,
        message: 'Branch created',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/branches/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const dto = UpdateBranchSchema.parse(req.body);

      const result = await this.updateBranchUseCase.execute(id, dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Branch updated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches?restaurantId=...&page=1&limit=10
  async list(req, res, next) {
    try {
      const dto = ListBranchesSchema.parse(req.query);

      const result = await this.listBranchesUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Branches list',
        data: result.items, // Return items directly, not the whole result
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/v1/branches/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.deleteBranchUseCase.execute(id, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.getBranchDetailsUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Branch details',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branches/:branchId/menu
  async getMenu(req, res, next) {
    try {
      const { branchId } = req.params;
      const data = await this.getFullMenuByBranchUseCase.execute(branchId);

      res.status(200).json({
        success: true,
        message: 'Branch menu retrieved',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/owner/branches/:branchId/branding
  async getBranding(req, res, next) {
    try {
      const { branchId } = req.params;

      const result = await this.getBranchBrandingUseCase.execute(branchId, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/owner/branches/:branchId/branding
  async updateBranding(req, res, next) {
    try {
      const { branchId } = req.params;
      const dto = UpdateBrandingSchema.parse(req.body);

      const result = await this.updateBranchBrandingUseCase.execute(branchId, dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Branding updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/owner/branches/:branchId/branding/upload
  async uploadBrandingImage(req, res, next) {
    try {
      const { branchId } = req.params;
      const { imageType, caption } = req.body;
      const file = req.file;

      // Validate request body
      const dto = UploadBrandingImageSchema.parse({ imageType, caption });

      // Validate file
      const fileErrors = validateFile(file, dto.imageType);
      if (fileErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: fileErrors
        });
      }

      const result = await this.uploadBrandingImageUseCase.execute(
        branchId, 
        file, 
        dto.imageType, 
        dto.caption, 
        {
          userId: req.user?.userId,
          role: req.user?.role,
          restaurantId: req.user?.restaurantId,
        }
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/v1/owner/branches/:branchId/branding/images
  async deleteBrandingImage(req, res, next) {
    try {
      const { branchId } = req.params;
      const dto = DeleteBrandingImageSchema.parse(req.body);

      const result = await this.deleteBrandingImageUseCase.execute(
        branchId,
        dto.imageType,
        dto.imageUrl,
        {
          userId: req.user?.userId,
          role: req.user?.role,
          restaurantId: req.user?.restaurantId,
        }
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { BranchController };
