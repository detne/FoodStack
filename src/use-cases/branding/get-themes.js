// src/use-cases/branding/get-themes.js

class GetThemesUseCase {
  constructor({ brandingRepository }) {
    this.brandingRepository = brandingRepository;
  }

  async execute(filters = {}) {
    try {
      const result = await this.brandingRepository.getThemes(filters);
      
      return {
        success: true,
        themes: result.themes,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(`Failed to get themes: ${error.message}`);
    }
  }
}

module.exports = { GetThemesUseCase };