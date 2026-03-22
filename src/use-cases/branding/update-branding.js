// src/use-cases/branding/update-branding.js

class UpdateBrandingUseCase {
  constructor(brandingRepository) {
    this.brandingRepository = brandingRepository;
  }

  async execute(branchId, data, context) {
    // Verify branch exists
    const existing = await this.brandingRepository.getBranchBranding(branchId);
    if (!existing) {
      const error = new Error('Branch not found');
      error.statusCode = 404;
      throw error;
    }

    // Update branding
    const updated = await this.brandingRepository.updateBranding(branchId, data);

    return updated;
  }
}

module.exports = { UpdateBrandingUseCase };
