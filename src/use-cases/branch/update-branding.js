const { NotFoundError, ForbiddenError, BadRequestError } = require('../../exception/http-errors');
const { v4: uuidv4 } = require('uuid');

class UpdateBranchBrandingUseCase {
  constructor(branchRepository, restaurantRepository, prisma) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.prisma = prisma;
  }

  async execute(branchId, updateData, context) {
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
      throw new ForbiddenError('You do not have permission to update this branch');
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

    // Validate against subscription plan
    await this.validateSubscriptionLimits(updateData, allowedFeatures);

    // Generate slug if not provided
    if (updateData.slug === undefined && !branch.slug) {
      updateData.slug = await this.generateSlug(branch.name);
    }

    // Validate slug uniqueness if changed
    if (updateData.slug && updateData.slug !== branch.slug) {
      await this.validateSlugUniqueness(updateData.slug, branchId);
    }

    // Prepare update data
    const updatePayload = this.prepareUpdatePayload(updateData);

    // Update branch in transaction
    const updatedBranch = await this.prisma.$transaction(async (tx) => {
      // Update branch
      const updated = await tx.branches.update({
        where: { id: branchId },
        data: {
          ...updatePayload,
          updated_at: new Date()
        }
      });

      // Log activity
      await this.logActivity(tx, {
        userId,
        restaurantId: restaurant.id,
        branchId,
        action: 'UPDATE_BRANDING',
        entityType: 'BRANCH',
        entityId: branchId,
        oldValues: this.extractBrandingData(branch),
        newValues: updatePayload
      });

      return updated;
    });

    // Generate public URL
    const publicUrl = updatedBranch.slug 
      ? `${process.env.PUBLIC_BASE_URL || 'https://yourapp.com'}/r/${updatedBranch.slug}`
      : null;

    return {
      branchId: updatedBranch.id,
      slug: updatedBranch.slug,
      publicUrl
    };
  }

  async validateSubscriptionLimits(updateData, allowedFeatures) {
    // Check banner feature
    if (updateData.bannerUrl && !allowedFeatures.banner) {
      throw new BadRequestError('Banner feature is not available in your subscription plan');
    }

    // Check gallery images limit
    if (updateData.galleryImages) {
      if (!allowedFeatures.gallery) {
        throw new BadRequestError('Gallery feature is not available in your subscription plan');
      }
      if (updateData.galleryImages.length > allowedFeatures.maxGalleryImages) {
        throw new BadRequestError(`Gallery images limit exceeded. Maximum allowed: ${allowedFeatures.maxGalleryImages}`);
      }
    }

    // Check slider images limit
    if (updateData.sliderImages) {
      if (!allowedFeatures.slider) {
        throw new BadRequestError('Slider feature is not available in your subscription plan');
      }
      if (updateData.sliderImages.length > (allowedFeatures.maxSliderImages || 3)) {
        throw new BadRequestError(`Slider images limit exceeded. Maximum allowed: ${allowedFeatures.maxSliderImages || 3}`);
      }
    }

    // Check logo feature
    if (updateData.logoUrl && !allowedFeatures.logo) {
      throw new BadRequestError('Logo feature is not available in your subscription plan');
    }
  }

  async generateSlug(branchName) {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    let baseSlug = branchName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.isSlugTaken(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async validateSlugUniqueness(slug, excludeBranchId) {
    const existingBranch = await this.prisma.branches.findFirst({
      where: {
        slug,
        id: { not: excludeBranchId },
        deleted_at: null
      }
    });

    if (existingBranch) {
      throw new BadRequestError('Slug is already taken');
    }
  }

  async isSlugTaken(slug) {
    const existing = await this.prisma.branches.findFirst({
      where: {
        slug,
        deleted_at: null
      }
    });
    return !!existing;
  }

  prepareUpdatePayload(updateData) {
    const payload = {};

    // Direct field mappings
    const directFields = [
      'slug', 'logo_url', 'banner_url', 'tagline', 'selected_theme_id',
      'layout_type', 'seo_title', 'seo_description', 'seo_keywords'
    ];

    directFields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      if (updateData[camelField] !== undefined) {
        payload[field] = updateData[camelField];
      }
    });

    // JSON field mappings
    const jsonFields = [
      'theme_colors', 'gallery_images', 'slider_images', 
      'operating_hours', 'social_links'
    ];

    jsonFields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      if (updateData[camelField] !== undefined) {
        payload[field] = updateData[camelField];
      }
    });

    return payload;
  }

  extractBrandingData(branch) {
    return {
      slug: branch.slug,
      logo_url: branch.logo_url,
      banner_url: branch.banner_url,
      tagline: branch.tagline,
      selected_theme_id: branch.selected_theme_id,
      theme_colors: branch.theme_colors,
      layout_type: branch.layout_type,
      gallery_images: branch.gallery_images,
      slider_images: branch.slider_images,
      operating_hours: branch.operating_hours,
      social_links: branch.social_links,
      seo_title: branch.seo_title,
      seo_description: branch.seo_description,
      seo_keywords: branch.seo_keywords
    };
  }

  async logActivity(tx, activityData) {
    await tx.activity_logs.create({
      data: {
        id: uuidv4(),
        user_id: activityData.userId,
        restaurant_id: activityData.restaurantId,
        branch_id: activityData.branchId,
        action: activityData.action,
        entity_type: activityData.entityType,
        entity_id: activityData.entityId,
        old_values: activityData.oldValues,
        new_values: activityData.newValues,
        created_at: new Date()
      }
    });
  }
}

module.exports = { UpdateBranchBrandingUseCase };