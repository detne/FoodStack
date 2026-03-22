// src/use-cases/branding/get-branding.js

class GetBrandingUseCase {
  constructor(brandingRepository) {
    this.brandingRepository = brandingRepository;
  }

  async execute(branchId) {
    const branding = await this.brandingRepository.getBranchBranding(branchId);
    
    if (!branding) {
      const error = new Error('Branch not found');
      error.statusCode = 404;
      throw error;
    }

    return branding;
  }
}

module.exports = { GetBrandingUseCase };
