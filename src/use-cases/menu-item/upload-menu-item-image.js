// src/use-cases/menu-item/upload-menu-item-image.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class UploadMenuItemImageUseCase {
  constructor(menuItemRepository, uploadService, userRepository) {
    this.menuItemRepository = menuItemRepository;
    this.uploadService = uploadService;
    this.userRepository = userRepository;
  }

  async execute(menuItemId, file, userId) {
    // 1. Validate user role (Owner/Manager)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      throw new UnauthorizedError('Only Owner or Manager can upload menu item images');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(menuItemId);
    if (!menuItem) {
      throw new ValidationError('Menu item not found');
    }

    // 3. Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPG and PNG are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ValidationError('File size exceeds 5MB limit');
    }

    // 4. Upload to Cloudinary
    const uploadResult = await this.uploadService.uploadImage(file, { folder: 'menu-items' });
    const imageUrl = uploadResult.url;

    // 5. Update menu item with new image URL
    await this.menuItemRepository.update(menuItemId, {
      image_url: imageUrl,
    });

    return {
      menuItemId,
      imageUrl,
      message: 'Image uploaded successfully',
    };
  }
}

module.exports = { UploadMenuItemImageUseCase };
