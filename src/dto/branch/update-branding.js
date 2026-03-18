const { z } = require('zod');

// Validation schema for updating branch branding
const UpdateBrandingSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  
  logoUrl: z.string()
    .url('Logo URL must be a valid URL')
    .regex(/\.(jpg|jpeg|png|gif|webp)$/i, 'Logo must be an image file (jpg, jpeg, png, gif, webp)')
    .optional(),
  
  bannerUrl: z.string()
    .url('Banner URL must be a valid URL')
    .regex(/\.(jpg|jpeg|png|gif|webp)$/i, 'Banner must be an image file (jpg, jpeg, png, gif, webp)')
    .optional(),
  
  tagline: z.string()
    .max(200, 'Tagline must be at most 200 characters')
    .optional(),
  
  selectedThemeId: z.string()
    .optional(),
  
  themeColors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color').optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color').optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Accent color must be a valid hex color').optional(),
  }).optional(),
  
  layoutType: z.enum(['default', 'modern', 'classic', 'minimal'])
    .optional(),
  
  galleryImages: z.array(z.object({
    url: z.string().url('Gallery image URL must be valid'),
    caption: z.string().max(100, 'Caption must be at most 100 characters').optional()
  })).optional(),
  
  sliderImages: z.array(z.object({
    url: z.string().url('Slider image URL must be valid'),
    caption: z.string().max(100, 'Caption must be at most 100 characters').optional()
  })).optional(),
  
  operatingHours: z.record(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Open time must be in HH:mm format'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Close time must be in HH:mm format')
    })
  ).optional(),
  
  socialLinks: z.object({
    facebook: z.string().url('Facebook URL must be valid').optional(),
    instagram: z.string().url('Instagram URL must be valid').optional(),
    twitter: z.string().url('Twitter URL must be valid').optional(),
    website: z.string().url('Website URL must be valid').optional()
  }).optional(),
  
  seoTitle: z.string()
    .max(255, 'SEO title must be at most 255 characters')
    .optional(),
  
  seoDescription: z.string()
    .max(500, 'SEO description must be at most 500 characters')
    .optional(),
  
  seoKeywords: z.string()
    .max(255, 'SEO keywords must be at most 255 characters')
    .optional()
});

module.exports = { UpdateBrandingSchema };