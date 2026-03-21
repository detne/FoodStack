// src/use-cases/restaurant/upload-logo.js
const { ValidationError } = require('../../exception/validation-error');

class UploadRestaurantLogoUseCase {
  constructor(restaurantRepository, uploadService) {
    this.restaurantRepository = restaurantRepository;
    this.uploadService = uploadService;
  }

  async execute(restaurantId, file, userId) {
    // 1. Validate file exists
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // 2. Validate file type (jpg, png)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPG and PNG are allowed');
    }

    // 3. Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      throw new ValidationError('File size exceeds 2MB limit');
    }

    // 4. Get restaurant and verify ownership
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new ValidationError('Restaurant not found');
    }

    // 5. Upload file to cloud storage (Cloudinary)
    const uploadResult = await this.uploadService.uploadImage(file, {
      folder: 'restaurant-logos',
      transformation: {
        width: 512,
        height: 512,
        crop: 'limit',
      },
    });

    // 6. Update restaurant logo URL in database
    const updatedRestaurant = await this.restaurantRepository.update(restaurantId, {
      logo_url: uploadResult.url,
    });

    // 7. Return success response
    return {
      logoUrl: uploadResult.url,
      message: 'Logo uploaded successfully',
    };
  }
}

module.exports = { UploadRestaurantLogoUseCase };
