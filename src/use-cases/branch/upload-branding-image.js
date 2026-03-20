const { NotFoundError, ForbiddenError, BadRequestError } = require('../../exception/http-errors');
const { v4: uuidv4 } = require('uuid');

class UploadBrandingImageUseCase {
  constructor(branchRepository, restaurantRepository, uploadService, prisma) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.uploadService = uploadService;
    this.prisma = prisma;
  }

  async execute(branchId, file, imageType, caption, context) {
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
      throw new ForbiddenError('You do not have permission to upload images for this branch');
    }

    // Get subscription plan to validate features
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { restaurant_id: restaurant.id }
    });

    let allowedFeatures = {
      logo: true,
      banner: true,
      gallery: true,
      slider: true,
      maxGalleryImages: 5,
      maxSliderImages: 3
    };

    // Get subscription plan features
    if (subscription) {
      const subscriptionPlan = await this.prisma.subscription_plans.findUnique({
        where: { name: subscription.plan_type }
      });
      
      if (subscriptionPlan && subscriptionPlan.branding_features) {
        allowedFeatures = {
          ...allowedFeatures,
          ...subscriptionPlan.branding_features
        };
      }
    }

    // Validate subscription allows this image type
    await this.validateSubscriptionFeatures(imageType, allowedFeatures);

    // Check current image limits for gallery/slider
    if (imageType === 'gallery' || imageType === 'slider') {
      await this.validateImageLimits(branch, imageType, allowedFeatures);
    }

    // Upload image to cloud storage
    const uploadResult = await this.uploadService.uploadImage(file, {
      folder: `branches/${branchId}/${imageType}`,
      transformation: this.getImageTransformation(imageType)
    });

    // Update branch with new image URL
    await this.updateBranchWithImage(branchId, imageType, uploadResult.url, caption);

    // Log activity
    await this.logActivity({
      userId,
      restaurantId: restaurant.id,
      branchId,
      action: 'UPLOAD_BRANDING_IMAGE',
      entityType: 'BRANCH',
      entityId: branchId,
      newValues: {
        imageType,
        url: uploadResult.url,
        caption
      }
    });

    return {
      url: uploadResult.url,
      imageType,
      caption: caption || null,
      width: uploadResult.width,
      height: uploadResult.height
    };
  }

  async validateSubscriptionFeatures(imageType, allowedFeatures) {
    switch (imageType) {
      case 'logo':
        if (!allowedFeatures.logo) {
          throw new BadRequestError('Logo upload is not available in your subscription plan');
        }
        break;
      case 'banner':
        if (!allowedFeatures.banner) {
          throw new BadRequestError('Banner upload is not available in your subscription plan');
        }
        break;
      case 'gallery':
        if (!allowedFeatures.gallery) {
          throw new BadRequestError('Gallery upload is not available in your subscription plan');
        }
        break;
      case 'slider':
        if (!allowedFeatures.slider) {
          throw new BadRequestError('Slider upload is not available in your subscription plan');
        }
        break;
    }
  }

  async validateImageLimits(branch, imageType, allowedFeatures) {
    if (imageType === 'gallery') {
      const currentGalleryImages = branch.gallery_images || [];
      if (currentGalleryImages.length >= allowedFeatures.maxGalleryImages) {
        throw new BadRequestError(`Gallery images limit exceeded. Maximum allowed: ${allowedFeatures.maxGalleryImages}`);
      }
    }

    if (imageType === 'slider') {
      const currentSliderImages = branch.slider_images || [];
      const maxSliderImages = allowedFeatures.maxSliderImages || 3;
      if (currentSliderImages.length >= maxSliderImages) {
        throw new BadRequestError(`Slider images limit exceeded. Maximum allowed: ${maxSliderImages}`);
      }
    }
  }

  async updateBranchWithImage(branchId, imageType, imageUrl, caption) {
    const branch = await this.branchRepository.findById(branchId);
    let updateData = {};

    switch (imageType) {
      case 'logo':
        updateData.logo_url = imageUrl;
        break;
      case 'banner':
        updateData.banner_url = imageUrl;
        break;
      case 'gallery':
        const currentGallery = branch.gallery_images || [];
        updateData.gallery_images = [
          ...currentGallery,
          { url: imageUrl, caption: caption || null }
        ];
        break;
      case 'slider':
        const currentSlider = branch.slider_images || [];
        updateData.slider_images = [
          ...currentSlider,
          { url: imageUrl, caption: caption || null }
        ];
        break;
    }

    await this.branchRepository.update(branchId, updateData);
  }

  getImageTransformation(imageType) {
    const transformations = {
      logo: [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      banner: [
        { width: 1200, height: 400, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      gallery: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ],
      slider: [
        { width: 1200, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    };

    return transformations[imageType] || [];
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
        new_values: activityData.newValues,
        created_at: new Date()
      }
    });
  }
}

module.exports = { UploadBrandingImageUseCase };