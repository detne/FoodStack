// src/controller/branding.js

const { GetThemesQuerySchema } = require('../dto/branding/get-themes');
const { UpdateRestaurantBrandingSchema } = require('../dto/branding/update-restaurant-branding');
const { UpdateBranchBrandingSchema } = require('../dto/branding/update-branch-branding');

class BrandingController {
  constructor({
    getThemesUseCase,
    getRestaurantBrandingUseCase,
    updateRestaurantBrandingUseCase,
    getBranchBrandingUseCase,
    updateBranchBrandingUseCase,
    getLandingPageUseCase,
    uploadBrandingImageUseCase,
  }) {
    this.getThemesUseCase = getThemesUseCase;
    this.getRestaurantBrandingUseCase = getRestaurantBrandingUseCase;
    this.updateRestaurantBrandingUseCase = updateRestaurantBrandingUseCase;
    this.getBranchBrandingUseCase = getBranchBrandingUseCase;
    this.updateBranchBrandingUseCase = updateBranchBrandingUseCase;
    this.getLandingPageUseCase = getLandingPageUseCase;
    this.uploadBrandingImageUseCase = uploadBrandingImageUseCase;
  }

  // GET /api/v1/branding/themes
  async getThemes(req, res, next) {
    try {
      const filters = GetThemesQuerySchema.parse(req.query);
      const result = await this.getThemesUseCase.execute(filters);

      res.status(200).json({
        success: true,
        message: 'Themes retrieved',
        data: result.themes,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branding/restaurant/:restaurantId
  async getRestaurantBranding(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const result = await this.getRestaurantBrandingUseCase.execute(restaurantId, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Restaurant branding retrieved',
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/branding/restaurant/:restaurantId
  async updateRestaurantBranding(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const data = UpdateRestaurantBrandingSchema.parse(req.body);

      const result = await this.updateRestaurantBrandingUseCase.execute(restaurantId, data, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branding/branch/:branchId
  async getBranchBranding(req, res, next) {
    try {
      const { branchId } = req.params;
      const result = await this.getBranchBrandingUseCase.execute(branchId, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Branch branding retrieved',
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/branding/branch/:branchId
  async updateBranchBranding(req, res, next) {
    try {
      const { branchId } = req.params;
      const data = UpdateBranchBrandingSchema.parse(req.body);

      const result = await this.updateBranchBrandingUseCase.execute(branchId, data, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branding/landing/:slug (Public endpoint)
  async getLandingPage(req, res, next) {
    try {
      const { slug } = req.params;
      
      // Collect visitor analytics data
      const visitorData = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        pageUrl: req.originalUrl,
      };

      const result = await this.getLandingPageUseCase.execute(slug, visitorData);

      res.status(200).json({
        success: true,
        message: 'Landing page retrieved',
        data: result.landingPage,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/branding/restaurant/:restaurantId/preview (Private - Owner only)
  async getRestaurantPreview(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const userId = req.user?.userId;
      
      // Create user context for use case
      // For preview, we allow owner to view their own restaurant
      const userContext = {
        userId,
        role: req.user?.role || 'OWNER',
        restaurantId: restaurantId, // Use the restaurantId from params for preview
      };
      
      // Get restaurant branding
      const result = await this.getRestaurantBrandingUseCase.execute(restaurantId, userContext);
      
      // Get theme if selected
      let theme = null;
      if (result.branding?.selected_theme_id || result.branding?.selectedThemeId) {
        const themeId = result.branding.selected_theme_id || result.branding.selectedThemeId;
        try {
          const themeResult = await this.getThemesUseCase.brandingRepository.getThemeById(themeId);
          if (themeResult) {
            theme = {
              name: themeResult.name,
              category: themeResult.category,
              colors: themeResult.colors || {}
            };
          }
        } catch (err) {
          console.error('Error fetching theme:', err);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Restaurant preview retrieved',
        data: {
          branding: result.branding,
          theme: theme || { name: null, category: null, colors: {} }
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/branding/restaurant/:restaurantId/publish
  async publishRestaurant(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { isPublished } = req.body;

      const result = await this.updateRestaurantBrandingUseCase.execute(
        restaurantId, 
        { isPublished }, 
        {
          userId: req.user?.userId,
          role: req.user?.role,
          restaurantId: req.user?.restaurantId,
        }
      );

      res.status(200).json({
        success: true,
        message: `Restaurant ${isPublished ? 'published' : 'unpublished'}`,
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/branding/branch/:branchId/publish
  async publishBranch(req, res, next) {
    try {
      const { branchId } = req.params;
      const { isPublished } = req.body;

      const result = await this.updateBranchBrandingUseCase.execute(
        branchId, 
        { isPublished }, 
        {
          userId: req.user?.userId,
          role: req.user?.role,
          restaurantId: req.user?.restaurantId,
        }
      );

      res.status(200).json({
        success: true,
        message: `Branch ${isPublished ? 'published' : 'unpublished'}`,
        data: result.branding,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/branding/upload
  async uploadImage(req, res, next) {
    try {
      const { imageType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      if (!imageType) {
        return res.status(400).json({
          success: false,
          message: 'Image type is required',
        });
      }

      const result = await this.uploadBrandingImageUseCase.execute(file, imageType, {
        userId: req.user?.userId,
        role: req.user?.role,
        restaurantId: req.user?.restaurantId,
      });

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { BrandingController };