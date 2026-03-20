// src/dto/branding/update-branding.js

const { z } = require('zod');

const UpdateBrandingSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  tagline: z.string().optional().nullable(),
  selectedThemeId: z.string().optional().nullable(),
  themeColors: z.record(z.any()).optional().nullable(),
  layoutType: z.string().optional().nullable(),
  galleryImages: z.array(z.any()).optional().nullable(),
  sliderImages: z.array(z.any()).optional().nullable(),
  operatingHours: z.record(z.any()).optional().nullable(),
  socialLinks: z.record(z.any()).optional().nullable(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

module.exports = { UpdateBrandingSchema };
