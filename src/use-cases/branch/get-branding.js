const { NotFoundError, ForbiddenError } = require('../../exception/http-errors');

class GetBranchBrandingUseCase {
  constructor(branchRepository, restaurantRepository, prisma) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.prisma = prisma;
  }

  async execute(branchId, context) {
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

    // Verify user owns this branch (check restaurants.owner_id)
    if (restaurant.owner_id !== userId) {
      throw new ForbiddenError('You do not have permission to access this branch');
    }

    // Get subscription plan details to determine allowed features
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { restaurant_id: restaurant.id }
    });

    // Default allowed features if no subscription
    let allowedFeatures = {
      logo: true,
      banner: true,
      gallery: true,
      maxGalleryImages: 5
    };

    // If subscription exists, get branding features from subscription plan
    if (subscription) {
      // Get the subscription plan details
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

    // Format the response
    const brandingData = {
      branchId: branch.id,
      slug: branch.slug,
      logoUrl: branch.logo_url,
      bannerUrl: branch.banner_url,
      tagline: branch.tagline,
      selectedThemeId: branch.selected_theme_id,
      themeColors: branch.theme_colors || {},
      layoutType: branch.layout_type || 'default',
      galleryImages: branch.gallery_images || [],
      sliderImages: branch.slider_images || [],
      operatingHours: branch.operating_hours || {},
      socialLinks: branch.social_links || {},
      isPublished: branch.is_published || false,
      customDomain: branch.custom_domain,
      seoTitle: branch.seo_title,
      seoDescription: branch.seo_description,
      seoKeywords: branch.seo_keywords,
      allowedFeatures
    };

    return brandingData;
  }
}

module.exports = { GetBranchBrandingUseCase };