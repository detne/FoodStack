// src/dto/branding/update-branch-branding.js

const { z } = require('zod');

const UpdateBranchBrandingSchema = z.object({
  brandName: z.string().min(1).max(255).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(), // Allow any string, not just URL
  bannerUrl: z.string().optional().nullable(), // Allow any string, not just URL
  selectedThemeId: z.string().optional().nullable(), // Allow MongoDB ObjectId, not just UUID
  customThemeColors: z.object({
    primaryColor: z.string().optional().nullable(),
    secondaryColor: z.string().optional().nullable(),
    accentColor: z.string().optional().nullable(),
    backgroundColor: z.string().optional().nullable(),
    textColor: z.string().optional().nullable(),
    textSecondary: z.string().optional().nullable(),
  }).optional().nullable(),
  layoutType: z.enum(['DEFAULT', 'GRADIENT', 'CENTERED', 'SIDEBAR', 'MASONRY', 'GALLERY']).optional().nullable(),
  galleryImages: z.array(z.string()).max(20).optional().nullable(),
  sliderImages: z.array(z.string()).max(10).optional().nullable(),
  aboutSection1: z.object({
    title: z.string().max(255).optional().nullable(),
    text: z.string().optional().nullable(), // Changed from 'content' to 'text'
    image: z.any().optional().nullable(), // Changed from 'imageUrl' to 'image', allow any type
  }).optional().nullable(),
  aboutSection2: z.object({
    title: z.string().max(255).optional().nullable(),
    text: z.string().optional().nullable(), // Changed from 'content' to 'text'
    image: z.any().optional().nullable(), // Changed from 'imageUrl' to 'image', allow any type
  }).optional().nullable(),
  isPublished: z.boolean().optional().nullable(),
});

module.exports = { UpdateBranchBrandingSchema };