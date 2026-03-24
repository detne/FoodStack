// src/use-cases/branding/update-branch-branding.js

class UpdateBranchBrandingUseCase {
  constructor({ brandingRepository, branchRepository }) {
    this.brandingRepository = brandingRepository;
    this.branchRepository = branchRepository;
  }

  async execute(branchId, data, userContext) {
    try {
      console.log('UpdateBranchBrandingUseCase - branchId:', branchId);
      console.log('UpdateBranchBrandingUseCase - userContext:', userContext);
      
      // Verify user has access to this branch
      const branch = await this.branchRepository.findById(branchId); // Changed from getBranchById to findById
      console.log('UpdateBranchBrandingUseCase - branch found:', branch);
      
      if (!branch) {
        throw new Error('Branch not found');
      }

      if (userContext.restaurantId !== branch.restaurant_id) {
        throw new Error('Access denied');
      }

      // Only Owner and Manager can update branding (case-insensitive)
      const allowedRoles = ['Owner', 'Manager', 'OWNER', 'MANAGER'];
      if (!allowedRoles.includes(userContext.role)) {
        throw new Error('Insufficient permissions');
      }

      // Validate package features
      if (data.layoutType && data.layoutType !== 'DEFAULT') {
        const hasLayoutFeature = await this.brandingRepository.validatePackageFeatures(
          branch.restaurant_id, 
          'multiple_layouts'
        );
        if (!hasLayoutFeature) {
          throw new Error('Multiple layouts require PRO or ENTERPRISE package');
        }
      }

      if (data.sliderImages && data.sliderImages.length > 0) {
        const hasSliderFeature = await this.brandingRepository.validatePackageFeatures(
          branch.restaurant_id, 
          'slider'
        );
        if (!hasSliderFeature) {
          throw new Error('Image slider requires ENTERPRISE package');
        }
      }

      if (data.customThemeColors) {
        const hasCustomTheme = await this.brandingRepository.validatePackageFeatures(
          branch.restaurant_id, 
          'custom_theme'
        );
        if (!hasCustomTheme) {
          throw new Error('Custom theme colors require PRO or ENTERPRISE package');
        }
      }

      // Check if branch branding exists
      const existingBranding = await this.brandingRepository.getBranchBranding(branchId);
      
      let result;
      if (existingBranding) {
        result = await this.brandingRepository.updateBranchBranding(branchId, data);
      } else {
        result = await this.brandingRepository.createBranchBranding(
          branchId, 
          branch.restaurant_id, 
          data
        );
      }

      return {
        success: true,
        message: existingBranding ? 'Branch branding updated' : 'Branch branding created',
        branding: result,
      };
    } catch (error) {
      throw new Error(`Failed to update branch branding: ${error.message}`);
    }
  }
}

module.exports = { UpdateBranchBrandingUseCase };