const { z } = require('zod');

// Validation schema for branding image upload
const UploadBrandingImageSchema = z.object({
  imageType: z.enum(['logo', 'banner', 'gallery', 'slider'], {
    errorMap: () => ({ message: 'Image type must be one of: logo, banner, gallery, slider' })
  }),
  caption: z.string()
    .max(100, 'Caption must be at most 100 characters')
    .optional()
});

// File validation constants
const FILE_VALIDATION = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_SIZE: {
    logo: 5 * 1024 * 1024,      // 5MB
    gallery: 5 * 1024 * 1024,   // 5MB
    banner: 10 * 1024 * 1024,   // 10MB
    slider: 10 * 1024 * 1024    // 10MB
  },
  RECOMMENDED_DIMENSIONS: {
    logo: { width: 200, height: 200 },
    banner: { width: 1200, height: 400 },
    gallery: { width: 800, height: 600 },
    slider: { width: 1200, height: 600 }
  }
};

function validateFile(file, imageType) {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('File is required');
    return errors;
  }

  // Check file type
  if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push('File must be an image (JPEG, PNG, WebP)');
  }

  // Check file size
  const maxSize = FILE_VALIDATION.MAX_SIZE[imageType];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`File size must be less than ${maxSizeMB}MB for ${imageType}`);
  }

  return errors;
}

module.exports = { 
  UploadBrandingImageSchema, 
  FILE_VALIDATION,
  validateFile 
};