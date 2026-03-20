const { z } = require('zod');

// Validation schema for deleting branding image
const DeleteBrandingImageSchema = z.object({
  imageType: z.enum(['gallery', 'slider'], {
    errorMap: () => ({ message: 'Image type must be either gallery or slider' })
  }),
  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .min(1, 'Image URL is required')
});

module.exports = { DeleteBrandingImageSchema };