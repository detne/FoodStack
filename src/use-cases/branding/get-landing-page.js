// src/use-cases/branding/get-landing-page.js

class GetLandingPageUseCase {
  constructor({ brandingRepository }) {
    this.brandingRepository = brandingRepository;
  }

  async execute(slug, visitorData = null) {
    try {
      const landingData = await this.brandingRepository.getLandingPageData(slug);
      
      if (!landingData) {
        throw new Error('Landing page not found');
      }

      if (!landingData.is_published) {
        throw new Error('Landing page is not published');
      }

      // Record analytics if visitor data provided
      if (visitorData) {
        await this.brandingRepository.recordLandingPageVisit({
          restaurantId: landingData.restaurant_id,
          branchId: landingData.branch_id,
          visitorIp: visitorData.ip,
          userAgent: visitorData.userAgent,
          referrer: visitorData.referrer,
          pageUrl: visitorData.pageUrl,
          pageTitle: landingData.seo_title || landingData.brand_name,
        });
      }

      // Merge custom theme colors with base theme
      let finalThemeColors = {
        primaryColor: landingData.primary_color,
        secondaryColor: landingData.secondary_color,
        accentColor: landingData.accent_color,
        backgroundColor: landingData.background_color,
        textColor: landingData.text_color,
        textSecondary: landingData.text_secondary,
      };

      if (landingData.custom_theme_colors) {
        finalThemeColors = {
          ...finalThemeColors,
          ...landingData.custom_theme_colors,
        };
      }

      return {
        success: true,
        landingPage: {
          branch: {
            id: landingData.branch_id,
            name: landingData.branch_name,
            address: landingData.address,
            phone: landingData.phone,
            slug: landingData.slug,
          },
          branding: {
            brandName: landingData.brand_name,
            tagline: landingData.tagline,
            description: landingData.description,
            publicEmail: landingData.public_email,
            publicPhone: landingData.public_phone,
            websiteUrl: landingData.website_url,
            logoUrl: landingData.logo_url,
            bannerUrl: landingData.banner_url,
            galleryImages: landingData.gallery_images || [],
            sliderImages: landingData.slider_images || [],
            aboutSection1: landingData.about_section_1,
            aboutSection2: landingData.about_section_2,
            socialLinks: landingData.social_links || {},
            layoutType: landingData.final_layout_type || 'DEFAULT',
          },
          theme: {
            name: landingData.theme_name,
            category: landingData.theme_category,
            colors: finalThemeColors,
            typography: {
              fontFamily: landingData.font_family,
              headingFont: landingData.heading_font,
            },
            layout: {
              borderRadius: landingData.border_radius,
              shadowIntensity: landingData.shadow_intensity,
            },
          },
          seo: {
            title: landingData.seo_title,
            description: landingData.seo_description,
            keywords: landingData.seo_keywords,
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get landing page: ${error.message}`);
    }
  }
}

module.exports = { GetLandingPageUseCase };