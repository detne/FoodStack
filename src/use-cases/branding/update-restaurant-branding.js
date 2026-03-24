// src/use-cases/branding/update-restaurant-branding.js

class UpdateRestaurantBrandingUseCase {
  constructor({ brandingRepository }) {
    this.brandingRepository = brandingRepository;
  }

  async execute(restaurantId, data, userContext) {
    try {
      console.log('UpdateRestaurantBrandingUseCase - restaurantId:', restaurantId);
      console.log('UpdateRestaurantBrandingUseCase - userContext:', userContext);
      
      // Verify user has access to this restaurant
      // Role can be 'Owner' or 'OWNER' depending on source
      const isOwner = userContext.role === 'Owner' || userContext.role === 'OWNER';
      if (!isOwner || userContext.restaurantId !== restaurantId) {
        console.log('Access denied - isOwner:', isOwner, 'restaurantId match:', userContext.restaurantId === restaurantId);
        throw new Error('Access denied');
      }

      // Validate package features
      if (data.layoutType && data.layoutType !== 'DEFAULT') {
        const hasLayoutFeature = await this.brandingRepository.validatePackageFeatures(
          restaurantId, 
          'multiple_layouts'
        );
        if (!hasLayoutFeature) {
          throw new Error('Multiple layouts require PRO or ENTERPRISE package');
        }
      }

      if (data.sliderImages && data.sliderImages.length > 0) {
        const hasSliderFeature = await this.brandingRepository.validatePackageFeatures(
          restaurantId, 
          'slider'
        );
        if (!hasSliderFeature) {
          throw new Error('Image slider requires ENTERPRISE package');
        }
      }

      if (data.customThemeColors) {
        const hasCustomTheme = await this.brandingRepository.validatePackageFeatures(
          restaurantId, 
          'custom_theme'
        );
        if (!hasCustomTheme) {
          throw new Error('Custom theme colors require PRO or ENTERPRISE package');
        }
      }

      // Check if branding exists
      const existingBranding = await this.brandingRepository.getRestaurantBranding(restaurantId);
      
      let result;
      if (existingBranding) {
        result = await this.brandingRepository.updateRestaurantBranding(restaurantId, data);
      } else {
        result = await this.brandingRepository.createRestaurantBranding(restaurantId, data);
      }

      return {
        success: true,
        message: existingBranding ? 'Restaurant branding updated' : 'Restaurant branding created',
        branding: result,
      };
    } catch (error) {
      throw new Error(`Failed to update restaurant branding: ${error.message}`);
    }
  }
}

module.exports = { UpdateRestaurantBrandingUseCase };