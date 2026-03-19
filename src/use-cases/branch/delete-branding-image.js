const { NotFoundError, ForbiddenError, BadRequestError } = require('../../exception/http-errors');
const { v4: uuidv4 } = require('uuid');

class DeleteBrandingImageUseCase {
  constructor(branchRepository, restaurantRepository, uploadService, prisma) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.uploadService = uploadService;
    this.prisma = prisma;
  }

  async execute(branchId, imageType, imageUrl, context) {
    const { userId, role } = context;

    // Get branch details
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Get restaurant details to verify ownership
    const restaurant = await this.restaurantRepository.findById(branch.restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    // Verify user owns this branch
    if (restaurant.owner_id !== userId) {
      throw new ForbiddenError('You do not have permission to delete images from this branch');
    }

    // Find and remove image from the appropriate array
    const { updatedImages, imageFound } = this.removeImageFromArray(branch, imageType, imageUrl);
    
    if (!imageFound) {
      throw new NotFoundError('Image not found in the specified collection');
    }

    // Update branch with new image array
    await this.updateBranchImages(branchId, imageType, updatedImages);

    // Extract public ID from Cloudinary URL for deletion
    const publicId = this.extractPublicIdFromUrl(imageUrl);
    
    // Delete image from cloud storage (optional - don't fail if it doesn't work)
    if (publicId) {
      try {
        await this.uploadService.deleteImage(publicId);
      } catch (error) {
        console.warn('Failed to delete image from cloud storage:', error.message);
        // Continue execution - database update is more important
      }
    }

    // Log activity
    await this.logActivity({
      userId,
      restaurantId: restaurant.id,
      branchId,
      action: 'DELETE_BRANDING_IMAGE',
      entityType: 'BRANCH',
      entityId: branchId,
      oldValues: {
        imageType,
        imageUrl
      }
    });

    return {
      message: 'Image deleted successfully'
    };
  }

  removeImageFromArray(branch, imageType, imageUrl) {
    let currentImages = [];
    let imageFound = false;

    if (imageType === 'gallery') {
      currentImages = branch.gallery_images || [];
    } else if (imageType === 'slider') {
      currentImages = branch.slider_images || [];
    }

    // Find and remove the image
    const updatedImages = currentImages.filter(image => {
      if (image.url === imageUrl) {
        imageFound = true;
        return false; // Remove this image
      }
      return true; // Keep this image
    });

    return { updatedImages, imageFound };
  }

  async updateBranchImages(branchId, imageType, updatedImages) {
    let updateData = {};

    if (imageType === 'gallery') {
      updateData.gallery_images = updatedImages;
    } else if (imageType === 'slider') {
      updateData.slider_images = updatedImages;
    }

    await this.branchRepository.update(branchId, updateData);
  }

  extractPublicIdFromUrl(imageUrl) {
    try {
      // Extract public ID from Cloudinary URL
      // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
      // Public ID: folder/image
      
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        return null;
      }

      // Get everything after 'upload/v{version}/'
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      
      // Remove file extension
      const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
      
      return publicId;
    } catch (error) {
      console.warn('Failed to extract public ID from URL:', imageUrl, error.message);
      return null;
    }
  }

  async logActivity(activityData) {
    await this.prisma.activity_logs.create({
      data: {
        id: uuidv4(),
        user_id: activityData.userId,
        restaurant_id: activityData.restaurantId,
        branch_id: activityData.branchId,
        action: activityData.action,
        entity_type: activityData.entityType,
        entity_id: activityData.entityId,
        old_values: activityData.oldValues,
        created_at: new Date()
      }
    });
  }
}

module.exports = { DeleteBrandingImageUseCase };