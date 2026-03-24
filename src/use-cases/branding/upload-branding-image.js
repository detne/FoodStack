// src/use-cases/branding/upload-branding-image.js

const { ValidationError } = require('../../exception/validation-error');

class UploadBrandingImageUseCase {
  constructor({ uploadService, brandingRepository }) {
    this.uploadService = uploadService;
    this.brandingRepository = brandingRepository;
  }

  async execute(file, imageType, userContext) {
    try {
      // Validate file
      if (!file) {
        throw new ValidationError('No file provided');
      }

      // Validate image type
      const allowedTypes = ['logo', 'banner', 'favicon', 'gallery', 'slider', 'about'];
      if (!allowedTypes.includes(imageType)) {
        throw new ValidationError('Invalid image type');
      }

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new ValidationError('File must be an image');
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new ValidationError('File size must be less than 5MB');
      }

      // Upload to cloud storage
      const uploadResult = await this.uploadService.uploadImage(file, {
        folder: `branding/${userContext.restaurantId}`,
        transformation: this._getImageTransformation(imageType),
      });

      return {
        success: true,
        imageUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        imageType,
      };
    } catch (error) {
      throw new Error(`Failed to upload branding image: ${error.message}`);
    }
  }

  _getImageTransformation(imageType) {
    const transformations = {
      logo: { width: 400, height: 400, crop: 'fit', quality: 'auto' },
      banner: { width: 1200, height: 400, crop: 'fill', quality: 'auto' },
      favicon: { width: 64, height: 64, crop: 'fill', quality: 'auto' },
      gallery: { width: 800, height: 600, crop: 'fill', quality: 'auto' },
      slider: { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
      about: { width: 600, height: 400, crop: 'fill', quality: 'auto' },
    };

    return transformations[imageType] || { quality: 'auto' };
  }
}

module.exports = { UploadBrandingImageUseCase };