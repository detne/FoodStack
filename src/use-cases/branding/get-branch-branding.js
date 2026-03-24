// src/use-cases/branding/get-branch-branding.js

class GetBranchBrandingUseCase {
  constructor({ brandingRepository, branchRepository }) {
    this.brandingRepository = brandingRepository;
    this.branchRepository = branchRepository;
  }

  async execute(branchId, userContext) {
    try {
      // Verify user has access to this branch
      const branch = await this.branchRepository.findById(branchId); // Changed from getBranchById to findById
      if (!branch) {
        throw new Error('Branch not found');
      }

      if (userContext.restaurantId !== branch.restaurant_id) {
        throw new Error('Access denied');
      }

      const branding = await this.brandingRepository.getBranchBranding(branchId);
      
      if (!branding) {
        // Return default branding structure if none exists
        return {
          success: true,
          branding: {
            branchId,
            restaurantId: branch.restaurant_id,
            brandName: null,
            tagline: null,
            description: null,
            logoUrl: null,
            bannerUrl: null,
            selectedThemeId: null,
            layoutType: null, // Will inherit from restaurant
            isPublished: false,
          },
        };
      }

      return {
        success: true,
        branding,
      };
    } catch (error) {
      throw new Error(`Failed to get branch branding: ${error.message}`);
    }
  }
}

module.exports = { GetBranchBrandingUseCase };