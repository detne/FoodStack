// src/dto/branding/update-restaurant-branding.js

const { z } = require('zod');

const UpdateRestaurantBrandingSchema = z.object({
  brandName: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  publicEmail: z.string().optional().nullable(),
  publicPhone: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(), // Allow any string, not just URL
  bannerUrl: z.string().optional().nullable(), // Allow any string, not just URL
  faviconUrl: z.string().optional().nullable(),
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
    title: z.string().optional().nullable(),
    text: z.string().optional().nullable(), // Changed from 'content' to 'text'
    image: z.any().optional().nullable(), // Changed from 'imageUrl' to 'image'
  }).optional().nullable(),
  aboutSection2: z.object({
    title: z.string().optional().nullable(),
    text: z.string().optional().nullable(), // Changed from 'content' to 'text'
    image: z.any().optional().nullable(), // Changed from 'imageUrl' to 'image'
  }).optional().nullable(),
  socialLinks: z.object({
    facebook: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
    youtube: z.string().optional().nullable(),
    tiktok: z.string().optional().nullable(),
  }).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  isPublished: z.boolean().optional().nullable(),
  customDomain: z.string().optional().nullable(),
});

module.exports = { UpdateRestaurantBrandingSchema };