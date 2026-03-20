// src/repository/branding.js

const { prisma } = require('../config/database.config');

class BrandingRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async getBranchBranding(branchId) {
    return await this.prisma.branches.findUnique({
      where: { id: branchId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo_url: true,
        banner_url: true,
        tagline: true,
        selected_theme_id: true,
        theme_colors: true,
        layout_type: true,
        gallery_images: true,
        slider_images: true,
        operating_hours: true,
        social_links: true,
        is_published: true,
        seo_title: true,
        seo_description: true,
        seo_keywords: true,
        address: true,
        phone: true,
      },
    });
  }

  async updateBranding(branchId, data) {
    return await this.prisma.branches.update({
      where: { id: branchId },
      data: {
        logo_url: data.logoUrl,
        banner_url: data.bannerUrl,
        tagline: data.tagline,
        selected_theme_id: data.selectedThemeId,
        theme_colors: data.themeColors,
        layout_type: data.layoutType,
        gallery_images: data.galleryImages,
        slider_images: data.sliderImages,
        operating_hours: data.operatingHours,
        social_links: data.socialLinks,
        is_published: data.isPublished,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        seo_keywords: data.seoKeywords,
        updated_at: new Date(),
      },
    });
  }

  async publishBranch(branchId, isPublished) {
    return await this.prisma.branches.update({
      where: { id: branchId },
      data: {
        is_published: isPublished,
        updated_at: new Date(),
      },
    });
  }
}

module.exports = { BrandingRepository };
