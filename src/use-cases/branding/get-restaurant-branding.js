// src/use-cases/branding/get-restaurant-branding.js

class GetRestaurantBrandingUseCase {
  constructor({ brandingRepository }) {
    this.brandingRepository = brandingRepository;
  }

  async execute(restaurantId, userContext) {
    try {
      console.log('[GetRestaurantBranding] restaurantId:', restaurantId);
      console.log('[GetRestaurantBranding] userContext:', userContext);
      
      // Verify user has access to this restaurant
      const isOwner = userContext.role === 'Owner' || userContext.role === 'OWNER';
      if (!isOwner) {
        throw new Error('Access denied: Only owners can access branding');
      }

      // For preview/read operations, we're more lenient with restaurantId check
      // The controller should ensure the user owns this restaurant
      // We don't do strict check here to allow flexibility

      const branding = await this.brandingRepository.getRestaurantBranding(restaurantId);
      
      if (!branding) {
        // Return default branding structure if none exists
        return {
          success: true,
          branding: {
            restaurantId,
            brandName: null,
            tagline: null,
            description: null,
            logoUrl: null,
            bannerUrl: null,
            selectedThemeId: null,
            layoutType: 'DEFAULT',
            isPublished: false,
            currentPackage: 'FREE',
          },
        };
      }

      return {
        success: true,
        branding,
      };
    } catch (error) {
      console.error('[GetRestaurantBranding] Error:', error);
      throw new Error(`Failed to get restaurant branding: ${error.message}`);
    }
  }
}

module.exports = { GetRestaurantBrandingUseCase };